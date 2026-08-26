import type { MutableRefObject, RefObject } from 'react'
import type Konva from 'konva'

import { useStore } from '@/store/useStore'
import { getExportMaxDimension } from './browserCapabilities'
import { createSerialTaskQueue } from './serialTaskQueue'

export type ExportFormat = 'png' | 'jpeg'

export interface ExportResult {
  format: ExportFormat
  bytes: number
  quality?: number
  optimizedFrom?: ExportFormat
}

export class ExportFileTooLargeError extends Error {
  readonly code = 'file-too-large'

  constructor() {
    super('The export could not be reduced below the X upload limit.')
    this.name = 'ExportFileTooLargeError'
  }
}

/** X currently limits uploaded photos to 5 MB. Use a decimal cap for a conservative client-side check. */
export const X_MAX_UPLOAD_BYTES = 5_000_000

const INITIAL_JPEG_QUALITY = 0.92
const MIN_JPEG_QUALITY = 0.5
const JPEG_QUALITY_SEARCH_STEPS = 7
const MIN_EXPORT_DIMENSION = 1024
const DIMENSION_REDUCTION_FACTOR = 0.85

const exportQueue = createSerialTaskQueue()

interface EncodedExport extends ExportResult {
  blob: Blob
}

function waitForCanvasPaint() {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    return new Promise<void>((resolve) => setTimeout(resolve, 0))
  }

  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()))
  })
}

function getExportTarget(stage: Konva.Stage) {
  const currentScale = stage.scaleX() || 1
  const logicalWidth = stage.width() / currentScale
  const logicalHeight = stage.height() / currentScale
  const maxLogicalDimension = Math.max(logicalWidth, logicalHeight, 1)
  const maxExportDimension = getExportMaxDimension()

  // Keep the largest canvas allocation bounded on mobile and low-memory
  // devices. Small compositions are doubled for a sharper downloaded frame.
  let targetDimension = maxLogicalDimension
  if (targetDimension > maxExportDimension) {
    targetDimension = maxExportDimension
  } else if (targetDimension < 2048) {
    targetDimension = Math.min(maxExportDimension, targetDimension * 2)
  }

  return { currentScale, maxLogicalDimension, targetDimension }
}

function getNextTargetDimension(targetDimension: number) {
  if (targetDimension <= MIN_EXPORT_DIMENSION) return null

  const nextDimension = Math.floor(targetDimension * DIMENSION_REDUCTION_FACTOR)
  return Math.max(MIN_EXPORT_DIMENSION, nextDimension)
}

async function renderStageBlob({
  stage,
  targetDimension,
  maxLogicalDimension,
  currentScale,
  mimeType,
  quality,
  isStale,
}: {
  stage: Konva.Stage
  targetDimension: number
  maxLogicalDimension: number
  currentScale: number
  mimeType: `image/${ExportFormat}`
  quality?: number
  isStale: () => boolean
}): Promise<Blob | null | undefined> {
  const pixelRatio = targetDimension / (maxLogicalDimension * currentScale)
  const blob = await stage.toBlob({
    pixelRatio,
    mimeType,
    quality,
  }) as Blob | null

  // undefined is reserved for a reset/navigation that invalidated this work.
  if (isStale()) return undefined
  return blob
}

function requireBlob(blob: Blob | null | undefined) {
  if (blob === undefined) return undefined
  if (!blob) throw new Error('Export image could not be created')
  return blob
}

async function renderJpegAtTarget({
  stage,
  targetDimension,
  maxLogicalDimension,
  currentScale,
  isStale,
}: {
  stage: Konva.Stage
  targetDimension: number
  maxLogicalDimension: number
  currentScale: number
  isStale: () => boolean
}): Promise<EncodedExport | null | undefined> {
  const preferredBlob = requireBlob(await renderStageBlob({
    stage,
    targetDimension,
    maxLogicalDimension,
    currentScale,
    mimeType: 'image/jpeg',
    quality: INITIAL_JPEG_QUALITY,
    isStale,
  }))
  if (preferredBlob === undefined) return undefined
  if (preferredBlob.size <= X_MAX_UPLOAD_BYTES) {
    return {
      blob: preferredBlob,
      bytes: preferredBlob.size,
      format: 'jpeg',
      quality: INITIAL_JPEG_QUALITY,
    }
  }

  // JPEG size is usually monotonic with quality for the same canvas. Find
  // the highest quality that fits instead of dropping directly to a blurry
  // preset. The final dimension loop below handles unusually large frames.
  const minimumBlob = requireBlob(await renderStageBlob({
    stage,
    targetDimension,
    maxLogicalDimension,
    currentScale,
    mimeType: 'image/jpeg',
    quality: MIN_JPEG_QUALITY,
    isStale,
  }))
  if (minimumBlob === undefined) return undefined
  if (minimumBlob.size > X_MAX_UPLOAD_BYTES) return null

  let bestBlob = minimumBlob
  let bestQuality = MIN_JPEG_QUALITY
  let lowQuality = MIN_JPEG_QUALITY
  let highQuality = INITIAL_JPEG_QUALITY

  for (let step = 0; step < JPEG_QUALITY_SEARCH_STEPS; step += 1) {
    const quality = (lowQuality + highQuality) / 2
    const candidateBlob = requireBlob(await renderStageBlob({
      stage,
      targetDimension,
      maxLogicalDimension,
      currentScale,
      mimeType: 'image/jpeg',
      quality,
      isStale,
    }))
    if (candidateBlob === undefined) return undefined

    if (candidateBlob.size <= X_MAX_UPLOAD_BYTES) {
      bestBlob = candidateBlob
      bestQuality = quality
      lowQuality = quality
    } else {
      highQuality = quality
    }
  }

  return {
    blob: bestBlob,
    bytes: bestBlob.size,
    format: 'jpeg',
    quality: bestQuality,
  }
}

async function renderJpegWithinLimit({
  stage,
  targetDimension,
  maxLogicalDimension,
  currentScale,
  isStale,
}: {
  stage: Konva.Stage
  targetDimension: number
  maxLogicalDimension: number
  currentScale: number
  isStale: () => boolean
}): Promise<EncodedExport | null | undefined> {
  let currentTargetDimension = targetDimension

  while (true) {
    const result = await renderJpegAtTarget({
      stage,
      targetDimension: currentTargetDimension,
      maxLogicalDimension,
      currentScale,
      isStale,
    })
    if (result === undefined) return undefined
    if (result) return result

    const nextTargetDimension = getNextTargetDimension(currentTargetDimension)
    if (nextTargetDimension === null) return null
    currentTargetDimension = nextTargetDimension
  }
}

async function renderPngWithinLimit({
  stage,
  targetDimension,
  maxLogicalDimension,
  currentScale,
  isOpaqueBackground,
  isStale,
}: {
  stage: Konva.Stage
  targetDimension: number
  maxLogicalDimension: number
  currentScale: number
  isOpaqueBackground: boolean
  isStale: () => boolean
}): Promise<EncodedExport | undefined> {
  let currentTargetDimension = targetDimension

  while (true) {
    const pngBlob = requireBlob(await renderStageBlob({
      stage,
      targetDimension: currentTargetDimension,
      maxLogicalDimension,
      currentScale,
      mimeType: 'image/png',
      isStale,
    }))
    if (pngBlob === undefined) return undefined
    if (pngBlob.size <= X_MAX_UPLOAD_BYTES) {
      return {
        blob: pngBlob,
        bytes: pngBlob.size,
        format: 'png',
      }
    }

    // A JPEG fallback would flatten transparency against an implementation-
    // dependent background. Keep transparent exports lossless and resize them
    // instead. For an opaque canvas, search JPEG quality before reducing size.
    if (isOpaqueBackground) {
      const jpegResult = await renderJpegWithinLimit({
        stage,
        targetDimension: currentTargetDimension,
        maxLogicalDimension,
        currentScale,
        isStale,
      })
      if (jpegResult === undefined) return undefined
      if (jpegResult) return { ...jpegResult, optimizedFrom: 'png' }
    }

    const nextTargetDimension = getNextTargetDimension(currentTargetDimension)
    if (nextTargetDimension === null) throw new ExportFileTooLargeError()
    currentTargetDimension = nextTargetDimension
  }
}

async function runExportCanvas(
  stageRef: RefObject<Konva.Stage | null> | MutableRefObject<Konva.Stage | null>,
  type: ExportFormat,
): Promise<ExportResult | undefined> {
  if (!stageRef.current) throw new Error('Export stage unavailable')

  const store = useStore.getState()
  const exportVersion = store.resetVersion
  const isStale = () => useStore.getState().resetVersion !== exportVersion
  store.setIsExporting(true)

  try {
    // Wait for React and Konva to paint the export-only noise layer. Two
    // animation frames are enough and avoid an unconditional delay.
    await waitForCanvasPaint()
    if (isStale()) return undefined

    const stage = stageRef.current
    if (!stage) throw new Error('Export stage unavailable')

    const { currentScale, maxLogicalDimension, targetDimension } = getExportTarget(stage)
    let encoded: EncodedExport | undefined
    if (type === 'png') {
      encoded = await renderPngWithinLimit({
        stage,
        targetDimension,
        maxLogicalDimension,
        currentScale,
        isOpaqueBackground: store.backgroundColor !== 'transparent',
        isStale,
      })
    } else {
      const jpegResult = await renderJpegWithinLimit({
        stage,
        targetDimension,
        maxLogicalDimension,
        currentScale,
        isStale,
      })
      if (jpegResult === null) throw new ExportFileTooLargeError()
      encoded = jpegResult
    }

    if (encoded === undefined) return undefined
    if (encoded.blob.size > X_MAX_UPLOAD_BYTES) throw new ExportFileTooLargeError()

    const objectUrl = URL.createObjectURL(encoded.blob)
    const link = document.createElement('a')
    const extension = encoded.format === 'jpeg' ? 'jpg' : 'png'
    link.download = `ffxiv-screenshot-${Date.now()}.${extension}`
    link.href = objectUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // Keep the URL alive briefly so browsers finish consuming the download
    // after the temporary anchor is removed.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)

    return {
      format: encoded.format,
      bytes: encoded.blob.size,
      ...(encoded.quality === undefined ? {} : { quality: encoded.quality }),
      ...(encoded.optimizedFrom === undefined ? {} : { optimizedFrom: encoded.optimizedFrom }),
    }
  } finally {
    store.setIsExporting(false)
  }
}

export function exportCanvas(
  stageRef: RefObject<Konva.Stage | null> | MutableRefObject<Konva.Stage | null>,
  type: ExportFormat = 'png',
) {
  return exportQueue.run(() => runExportCanvas(stageRef, type))
}
