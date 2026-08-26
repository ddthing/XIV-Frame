'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'
import {
  AlertCircle,
  Brush,
  Eraser,
  FlipHorizontal,
  Loader2,
  Moon,
  RotateCcw,
  RefreshCw,
  Trash2,
  Undo2,
  Upload,
  WandSparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EditorChoice, EditorFieldHeader, EditorSection } from '@/components/ui/editor'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { CharacterPositionControls } from './CharacterPositionControls'
import { cancelBackgroundRemoval, imageDataToBlobUrl, dataUrlToImageData, prepareCharacterImage, removeImageBackground } from '@/lib/backgroundRemoval'
import { BackgroundRemovalError, getBackgroundRemovalFailureCode } from '@/lib/backgroundRemovalErrors'
import { CHARACTER_SCALE_MAX, CHARACTER_SCALE_MIN } from '@/lib/characterScale'
import { createEditablePixelState, type PixelState } from '@/lib/characterPixels'
import { ImageUploadError, revokeObjectUrl } from '@/lib/imageUpload'
import { useStore } from '@/store/useStore'

const MAX_UNDO_STEPS = 8

type BrushMode = 'erase' | 'restore'
type PointerPosition = { clientX: number; clientY: number }
type BrushCursor = { x: number; y: number }

const processingMessageKeys = {
  'model-unavailable': 'characterModelUnavailableError',
  'browser-unsupported': 'characterBrowserUnsupportedError',
  'image-memory': 'characterProcessingMemoryError',
  'image-processing': 'characterProcessingImageError',
  timeout: 'characterProcessingTimeoutError',
  unknown: 'characterProcessingGenericError',
} as const

function CharacterErrorNotice({
  message,
  canRetry,
  onRetry,
  disabled,
  retryLabel,
  retryAriaLabel,
}: {
  message: string | null
  canRetry: boolean
  onRetry: () => void
  disabled: boolean
  retryLabel: string
  retryAriaLabel: string
}) {
  if (!message) return null

  return (
    <div data-character-processing-error="true" role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-[11px] leading-4 text-destructive">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">{message}</p>
      {canRetry && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 px-2 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRetry}
          disabled={disabled}
          aria-label={retryAriaLabel}
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

function drawPixels(canvas: HTMLCanvasElement | null, pixels: PixelState | null) {
  if (!canvas || !pixels) return
  canvas.width = pixels.width
  canvas.height = pixels.height
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, pixels.width, pixels.height)
  const imageData = new ImageData(pixels.width, pixels.height)
  imageData.data.set(pixels.data)
  context.putImageData(imageData, 0, 0)
}

function resizePixelState(pixels: PixelState, width: number, height: number): PixelState {
  if (pixels.width === width && pixels.height === height) {
    // This buffer is read-only source data; working pixels are cloned separately.
    return { data: pixels.data, width, height }
  }

  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = pixels.width
  sourceCanvas.height = pixels.height
  const sourceContext = sourceCanvas.getContext('2d')
  if (!sourceContext) throw new Error('Canvas context unavailable')

  const sourceImageData = new ImageData(pixels.width, pixels.height)
  sourceImageData.data.set(pixels.data)
  sourceContext.putImageData(sourceImageData, 0, 0)

  const targetCanvas = document.createElement('canvas')
  targetCanvas.width = width
  targetCanvas.height = height
  const targetContext = targetCanvas.getContext('2d')
  if (!targetContext) throw new Error('Canvas context unavailable')
  targetContext.imageSmoothingEnabled = true
  targetContext.imageSmoothingQuality = 'high'
  targetContext.drawImage(sourceCanvas, 0, 0, width, height)

  return {
    data: targetContext.getImageData(0, 0, width, height).data,
    width,
    height,
  }
}

function drawPixelsRegion(canvas: HTMLCanvasElement | null, pixels: PixelState, x: number, y: number, width: number, height: number) {
  if (!canvas || width <= 0 || height <= 0) return
  const context = canvas.getContext('2d')
  if (!context) return

  const startX = Math.max(0, Math.min(pixels.width - 1, x))
  const startY = Math.max(0, Math.min(pixels.height - 1, y))
  const regionWidth = Math.min(width, pixels.width - startX)
  const regionHeight = Math.min(height, pixels.height - startY)
  if (regionWidth <= 0 || regionHeight <= 0) return

  // Only allocate the dirty brush region. Creating a full-size ImageData here
  // on every animation frame caused a ~9MB allocation for a 1536px image.
  const imageData = new ImageData(regionWidth, regionHeight)
  const rowBytes = regionWidth * 4
  for (let row = 0; row < regionHeight; row += 1) {
    const sourceStart = ((startY + row) * pixels.width + startX) * 4
    imageData.data.set(pixels.data.subarray(sourceStart, sourceStart + rowBytes), row * rowBytes)
  }
  context.putImageData(imageData, startX, startY)
}

export function CharacterSettings() {
  const {
    characterSourceUrl,
    resetVersion,
    setCharacterSourceUrl,
    characterCutoutUrl,
    setCharacterCutoutUrl,
    setCharacterPosition,
    characterScale,
    setCharacterScale,
    characterOpacity,
    setCharacterOpacity,
    characterFlipX,
    setCharacterFlipX,
    characterShadow,
    setCharacterShadow,
  } = useStore(useShallow((state) => ({
    characterSourceUrl: state.characterSourceUrl,
    resetVersion: state.resetVersion,
    setCharacterSourceUrl: state.setCharacterSourceUrl,
    characterCutoutUrl: state.characterCutoutUrl,
    setCharacterCutoutUrl: state.setCharacterCutoutUrl,
    setCharacterPosition: state.setCharacterPosition,
    characterScale: state.characterScale,
    setCharacterScale: state.setCharacterScale,
    characterOpacity: state.characterOpacity,
    setCharacterOpacity: state.setCharacterOpacity,
    characterFlipX: state.characterFlipX,
    setCharacterFlipX: state.setCharacterFlipX,
    characterShadow: state.characterShadow,
    setCharacterShadow: state.setCharacterShadow,
  })))
  const t = useTranslations('SignatureSettings')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const brushViewportRef = useRef<HTMLDivElement>(null)
  const sourceBlobRef = useRef<Blob | null>(null)
  const sourceUrlRef = useRef<string | null>(characterSourceUrl)
  const sourcePixelsRef = useRef<PixelState | null>(null)
  const originalPixelsRef = useRef<PixelState | null>(null)
  const workingPixelsRef = useRef<PixelState | null>(null)
  const undoStackRef = useRef<Uint8ClampedArray[]>([])
  const paintingRef = useRef(false)
  const paintFrameRef = useRef<number | null>(null)
  const brushCursorHideTimeoutRef = useRef<number | null>(null)
  const lastPointerRef = useRef<PointerPosition | null>(null)
  const filePreparationAbortRef = useRef<AbortController | null>(null)
  const cutoutRenderAbortRef = useRef<AbortController | null>(null)
  const cutoutRenderRequestRef = useRef(0)
  const fileRequestRef = useRef(0)
  const processingRequestRef = useRef(0)
  const mountedRef = useRef(true)
  const sourcePreview = characterSourceUrl
  const [workingPixels, setWorkingPixels] = useState<PixelState | null>(null)
  const [brushCursor, setBrushCursor] = useState<BrushCursor | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [brushMode, setBrushMode] = useState<BrushMode>('erase')
  const [brushSize, setBrushSize] = useState(72)
  const [isPreparing, setIsPreparing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [canRetryBackgroundRemoval, setCanRetryBackgroundRemoval] = useState(false)
  const [undoCount, setUndoCount] = useState(0)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cancelBackgroundRemoval()
      filePreparationAbortRef.current?.abort()
      filePreparationAbortRef.current = null
      cutoutRenderAbortRef.current?.abort()
      cutoutRenderAbortRef.current = null
      cutoutRenderRequestRef.current += 1
      sourceUrlRef.current = null
      fileRequestRef.current += 1
      processingRequestRef.current += 1
      if (paintFrameRef.current !== null) {
        window.cancelAnimationFrame(paintFrameRef.current)
        paintFrameRef.current = null
      }
      if (brushCursorHideTimeoutRef.current !== null) {
        window.clearTimeout(brushCursorHideTimeoutRef.current)
        brushCursorHideTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!editorOpen) return
    drawPixels(canvasRef.current, workingPixels)
  }, [editorOpen, workingPixels])

  useEffect(() => {
    if (resetVersion === 0) return

    cancelBackgroundRemoval()
    filePreparationAbortRef.current?.abort()
    filePreparationAbortRef.current = null
    cutoutRenderAbortRef.current?.abort()
    cutoutRenderAbortRef.current = null
    cutoutRenderRequestRef.current += 1
    fileRequestRef.current += 1
    processingRequestRef.current += 1
    sourceUrlRef.current = null
    sourceBlobRef.current = null
    sourcePixelsRef.current = null
    originalPixelsRef.current = null
    workingPixelsRef.current = null
    paintingRef.current = false
    lastPointerRef.current = null
    undoStackRef.current = []

    const frame = window.requestAnimationFrame(() => {
      if (!mountedRef.current) return
      setWorkingPixels(null)
      setBrushCursor(null)
      setEditorOpen(false)
      setIsPreparing(false)
      setProgress(0)
      setError(null)
      setCanRetryBackgroundRemoval(false)
      setUndoCount(0)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [resetVersion])

  const clearBrushCursorHide = () => {
    if (brushCursorHideTimeoutRef.current === null) return
    window.clearTimeout(brushCursorHideTimeoutRef.current)
    brushCursorHideTimeoutRef.current = null
  }

  const hideBrushCursor = (delay = 0) => {
    clearBrushCursorHide()
    if (delay <= 0) {
      setBrushCursor(null)
      return
    }

    brushCursorHideTimeoutRef.current = window.setTimeout(() => {
      brushCursorHideTimeoutRef.current = null
      if (mountedRef.current) setBrushCursor(null)
    }, delay)
  }

  const updateBrushCursor = (event: PointerEvent<HTMLCanvasElement>) => {
    const viewport = brushViewportRef.current
    const canvas = event.currentTarget
    if (!viewport) return

    const canvasRect = canvas.getBoundingClientRect()
    const viewportRect = viewport.getBoundingClientRect()
    if (canvasRect.width <= 0 || canvasRect.height <= 0) return

    const canvasX = Math.max(0, Math.min(canvasRect.width, event.clientX - canvasRect.left))
    const canvasY = Math.max(0, Math.min(canvasRect.height, event.clientY - canvasRect.top))
    setBrushCursor({
      x: canvasRect.left - viewportRect.left + canvasX,
      y: canvasRect.top - viewportRect.top + canvasY,
    })
  }

  const syncWorkingPixels = (next: PixelState) => {
    workingPixelsRef.current = next
    setWorkingPixels(next)
    drawPixels(canvasRef.current, next)
  }

  const openEditorFromCutout = async () => {
    if (workingPixelsRef.current || !characterCutoutUrl) {
      setBrushCursor(null)
      setEditorOpen(true)
      return
    }

    const cutoutUrlAtStart = characterCutoutUrl
    const sourceUrlAtStart = characterSourceUrl
    const resetVersionAtStart = useStore.getState().resetVersion
    const isStale = () => (
      !mountedRef.current
      || useStore.getState().resetVersion !== resetVersionAtStart
      || useStore.getState().characterCutoutUrl !== cutoutUrlAtStart
    )

    try {
      const pixels = await dataUrlToImageData(cutoutUrlAtStart)
      if (isStale()) return
      const { original, working } = createEditablePixelState(pixels.data, pixels.width, pixels.height)
      let sourcePixels: PixelState | null = null
      if (sourceUrlAtStart) {
        try {
          const source = await dataUrlToImageData(sourceUrlAtStart)
          if (isStale()) return
          sourcePixels = resizePixelState({ data: source.data, width: source.width, height: source.height }, pixels.width, pixels.height)
        } catch {
          sourcePixels = null
        }
      }
      if (isStale()) return
      originalPixelsRef.current = original
      sourcePixelsRef.current = sourcePixels
      undoStackRef.current = []
      syncWorkingPixels(working)
      setBrushCursor(null)
      setEditorOpen(true)
    } catch {
      if (!isStale()) {
        setError(t('characterEditorError'))
        setCanRetryBackgroundRemoval(false)
      }
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    filePreparationAbortRef.current?.abort()
    cutoutRenderAbortRef.current?.abort()
    cutoutRenderAbortRef.current = null
    cutoutRenderRequestRef.current += 1
    cancelBackgroundRemoval()
    const controller = new AbortController()
    filePreparationAbortRef.current = controller
    const requestId = ++fileRequestRef.current
    processingRequestRef.current += 1
    const resetVersionAtStart = useStore.getState().resetVersion

    setError(null)
    setCanRetryBackgroundRemoval(false)

    try {
      const prepared = await prepareCharacterImage(file, controller.signal)
      if (
        requestId !== fileRequestRef.current
        || useStore.getState().resetVersion !== resetVersionAtStart
      ) {
        revokeObjectUrl(prepared.dataUrl)
        return
      }

      sourceUrlRef.current = prepared.dataUrl
      sourceBlobRef.current = prepared.blob
      setCharacterSourceUrl(prepared.dataUrl)
      setCharacterCutoutUrl(null)
      setCharacterPosition(null)
      sourcePixelsRef.current = null
      originalPixelsRef.current = null
      workingPixelsRef.current = null
      setWorkingPixels(null)
      setBrushCursor(null)
      setEditorOpen(false)
      undoStackRef.current = []
      setUndoCount(0)
    } catch (cause) {
      if (
        requestId !== fileRequestRef.current
        || useStore.getState().resetVersion !== resetVersionAtStart
      ) return
      if (cause instanceof ImageUploadError && cause.code === 'invalid-type') {
        setError(t('characterFileTypeError'))
      } else if (cause instanceof ImageUploadError && cause.code === 'too-large') {
        setError(t('characterFileTooLarge'))
      } else {
        setError(t('characterEditorError'))
      }
    } finally {
      if (filePreparationAbortRef.current === controller) filePreparationAbortRef.current = null
    }
  }

  const handleRemoveBackground = async () => {
    if (!sourcePreview || isPreparing) return
    const requestId = ++processingRequestRef.current
    const resetVersionAtStart = useStore.getState().resetVersion
    const isStale = () => (
      requestId !== processingRequestRef.current
      || useStore.getState().resetVersion !== resetVersionAtStart
    )
    const sourceUrl = sourcePreview
    const sourceBlob = sourceBlobRef.current
    cutoutRenderAbortRef.current?.abort()
    const cutoutController = new AbortController()
    cutoutRenderAbortRef.current = cutoutController
    const cutoutRequestId = ++cutoutRenderRequestRef.current

    setIsPreparing(true)
    setProgress(3)
    setError(null)
    setCanRetryBackgroundRemoval(false)

    try {
      const blob = sourceBlob ?? await (async () => {
        try {
          const response = await fetch(sourceUrl)
          if (!response.ok) throw new Error('이미지를 읽지 못했습니다.')
          return await response.blob()
        } catch {
          throw new BackgroundRemovalError('image-processing', '이미지를 읽지 못했습니다.')
        }
      })()
      const result = await removeImageBackground(blob, (nextProgress) => {
        if (!isStale()) setProgress(nextProgress)
      })
      if (isStale()) return
      const source = await dataUrlToImageData(sourceUrl)
      if (isStale()) return

      const { original, working } = createEditablePixelState(result.data, result.width, result.height)
      const sourcePixels = resizePixelState({ data: source.data, width: source.width, height: source.height }, result.width, result.height)
      originalPixelsRef.current = original
      sourcePixelsRef.current = sourcePixels
      undoStackRef.current = []
      setUndoCount(0)
      syncWorkingPixels(working)
      const cutoutUrl = await imageDataToBlobUrl(result.data, result.width, result.height, cutoutController.signal)
      if (
        isStale()
        || cutoutRequestId !== cutoutRenderRequestRef.current
        || cutoutController.signal.aborted
      ) {
        revokeObjectUrl(cutoutUrl)
        return
      }
      setCharacterCutoutUrl(cutoutUrl)
      setCharacterPosition(null)
      setBrushCursor(null)
      setEditorOpen(true)
    } catch (cause) {
      if (isStale()) return
      const failureCode = getBackgroundRemovalFailureCode(cause)
      setError(t(processingMessageKeys[failureCode]))
      setCanRetryBackgroundRemoval(true)
    } finally {
      if (cutoutRenderAbortRef.current === cutoutController) cutoutRenderAbortRef.current = null
      if (!isStale()) {
        setIsPreparing(false)
        setProgress(0)
      }
    }
  }

  const saveWorkingPixels = (pixels: PixelState | null) => {
    if (!pixels) return
    cutoutRenderAbortRef.current?.abort()
    const controller = new AbortController()
    cutoutRenderAbortRef.current = controller
    const requestId = ++cutoutRenderRequestRef.current
    void imageDataToBlobUrl(pixels.data, pixels.width, pixels.height, controller.signal)
      .then((url) => {
        if (
          !mountedRef.current
          || controller.signal.aborted
          || requestId !== cutoutRenderRequestRef.current
        ) {
          revokeObjectUrl(url)
          return
        }
        setCharacterCutoutUrl(url)
      })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === 'AbortError') return
        if (mountedRef.current && requestId === cutoutRenderRequestRef.current) {
          setError(t('characterEditorError'))
          setCanRetryBackgroundRemoval(false)
        }
      })
      .finally(() => {
        if (cutoutRenderAbortRef.current === controller) cutoutRenderAbortRef.current = null
      })
  }

  const paintAt = (point: PointerPosition) => {
    const canvas = canvasRef.current
    const working = workingPixelsRef.current
    const original = originalPixelsRef.current
    const source = sourcePixelsRef.current ?? original
    if (!canvas || !working || !original || !source) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / Math.max(1, rect.width)
    const scaleY = canvas.height / Math.max(1, rect.height)
    const centerX = Math.max(0, Math.min(canvas.width - 1, (point.clientX - rect.left) * scaleX))
    const centerY = Math.max(0, Math.min(canvas.height - 1, (point.clientY - rect.top) * scaleY))
    const radius = brushSize * Math.max(scaleX, scaleY) * 0.5
    const radiusSquared = radius * radius
    const inverseRadius = 1 / Math.max(1, radius)
    const minX = Math.max(0, Math.floor(centerX - radius))
    const maxX = Math.min(canvas.width - 1, Math.ceil(centerX + radius))
    const minY = Math.max(0, Math.floor(centerY - radius))
    const maxY = Math.min(canvas.height - 1, Math.ceil(centerY + radius))
    const workingData = working.data
    const sourceData = source.data
    const mode = brushMode

    for (let y = minY; y <= maxY; y += 1) {
      const deltaY = y - centerY
      const rowDistanceSquared = deltaY * deltaY
      let pixelIndex = (y * canvas.width + minX) * 4
      for (let x = minX; x <= maxX; x += 1) {
        const deltaX = x - centerX
        const distanceSquared = (deltaX * deltaX) + rowDistanceSquared
        if (distanceSquared > radiusSquared) {
          pixelIndex += 4
          continue
        }
        const influence = Math.max(0, 1 - Math.sqrt(distanceSquared) * inverseRadius)
        const alphaIndex = pixelIndex + 3
        const currentAlpha = workingData[alphaIndex]
        if (mode === 'erase') {
          workingData[alphaIndex] = Math.round(currentAlpha * (1 - influence))
          pixelIndex += 4
          continue
        }

        const sourceAlpha = sourceData[alphaIndex]
        if (sourceAlpha > 0 && influence > 0) {
          workingData[pixelIndex] = sourceData[pixelIndex]
          workingData[pixelIndex + 1] = sourceData[pixelIndex + 1]
          workingData[pixelIndex + 2] = sourceData[pixelIndex + 2]
        }
        workingData[alphaIndex] = Math.max(currentAlpha, Math.round(sourceAlpha * influence))
        pixelIndex += 4
      }
    }

    drawPixelsRegion(canvas, working, minX, minY, maxX - minX + 1, maxY - minY + 1)
  }

  const schedulePaint = (event: PointerEvent<HTMLCanvasElement>) => {
    lastPointerRef.current = { clientX: event.clientX, clientY: event.clientY }
    if (paintFrameRef.current !== null) return

    paintFrameRef.current = window.requestAnimationFrame(() => {
      paintFrameRef.current = null
      const point = lastPointerRef.current
      if (paintingRef.current && point) paintAt(point)
    })
  }

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    clearBrushCursorHide()
    updateBrushCursor(event)
    const working = workingPixelsRef.current
    if (!working) return
    event.currentTarget.setPointerCapture(event.pointerId)
    paintingRef.current = true
    undoStackRef.current = [...undoStackRef.current.slice(-(MAX_UNDO_STEPS - 1)), working.data.slice()]
    setUndoCount(undoStackRef.current.length)
    schedulePaint(event)
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    clearBrushCursorHide()
    updateBrushCursor(event)
    if (paintingRef.current) schedulePaint(event)
  }

  const handlePointerEnter = (event: PointerEvent<HTMLCanvasElement>) => {
    clearBrushCursorHide()
    updateBrushCursor(event)
  }

  const handlePointerLeave = () => {
    if (!paintingRef.current) hideBrushCursor()
  }

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!paintingRef.current) return
    const pendingFrame = paintFrameRef.current
    if (pendingFrame !== null) {
      window.cancelAnimationFrame(pendingFrame)
      paintFrameRef.current = null
      const point = lastPointerRef.current
      if (point) paintAt(point)
    }
    paintingRef.current = false
    lastPointerRef.current = null
    saveWorkingPixels(workingPixelsRef.current)
    if (event.pointerType === 'touch') hideBrushCursor(450)
  }

  const handleUndo = () => {
    const previous = undoStackRef.current.pop()
    const working = workingPixelsRef.current
    if (!previous || !working) return
    setUndoCount(undoStackRef.current.length)
    syncWorkingPixels({ data: previous.slice(), width: working.width, height: working.height })
    saveWorkingPixels(workingPixelsRef.current)
  }

  const handleRestoreModelResult = () => {
    const original = originalPixelsRef.current
    if (!original) return
    undoStackRef.current = [...undoStackRef.current.slice(-(MAX_UNDO_STEPS - 1)), workingPixelsRef.current?.data.slice() ?? original.data.slice()]
    setUndoCount(undoStackRef.current.length)
    const next = { data: original.data.slice(), width: original.width, height: original.height }
    syncWorkingPixels(next)
    saveWorkingPixels(next)
  }

  const handleClear = () => {
    cancelBackgroundRemoval()
    cutoutRenderAbortRef.current?.abort()
    cutoutRenderAbortRef.current = null
    cutoutRenderRequestRef.current += 1
    fileRequestRef.current += 1
    processingRequestRef.current += 1
    setCanRetryBackgroundRemoval(false)
    setCharacterSourceUrl(null)
    setCharacterCutoutUrl(null)
    sourceUrlRef.current = null
    sourceBlobRef.current = null
    sourcePixelsRef.current = null
    originalPixelsRef.current = null
    workingPixelsRef.current = null
    setWorkingPixels(null)
    setBrushCursor(null)
    paintingRef.current = false
    lastPointerRef.current = null
    setEditorOpen(false)
    setCharacterPosition(null)
    undoStackRef.current = []
    setUndoCount(0)
  }

  return (
    <div className="space-y-6 font-sans">
      <EditorSection title={t('characterTitle')} description={t('characterDescription')}>
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/15 bg-accent/35 px-4 py-3">
            <div className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-card text-primary shadow-subtle">
                <WandSparkles className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{t('characterPrivacyTitle')}</p>
                <p className="mt-1 font-body text-[12px] leading-5 text-muted-foreground">{t('characterPrivacyDescription')}</p>
              </div>
            </div>
          </div>

          {!sourcePreview ? (
            <label htmlFor="character-file-input" className="relative flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/25 bg-card px-4 text-center transition-colors hover:bg-surface-inset/70 focus-within:ring-2 focus-within:ring-ring/50">
              <span className="grid size-8 place-items-center rounded-md bg-surface-inset text-foreground"><Upload className="size-3.5" aria-hidden="true" /></span>
              <span className="text-xs font-semibold text-foreground">{t('characterUploadLabel')}</span>
              <span className="font-body text-[11px] text-muted-foreground">{t('characterUploadHint')}</span>
              <input ref={fileInputRef} id="character-file-input" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 z-10 size-full cursor-pointer opacity-0" aria-label={t('characterUploadLabel')} />
            </label>
          ) : (
            <div className="space-y-3">
              <input ref={fileInputRef} id="character-file-input" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" aria-label={t('characterUploadLabel')} />
              <div className="grid grid-cols-2 gap-2">
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t('characterOriginal')}</div>
                  <img src={sourcePreview} alt={t('characterOriginal')} className="aspect-square w-full object-contain bg-surface-inset/70 p-2" />
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t('characterResult')}</div>
                  {characterCutoutUrl ? (
                    <img src={characterCutoutUrl} alt={t('characterResult')} className="checkerboard aspect-square w-full object-contain p-2" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-surface-inset/70 p-2 text-center font-body text-[11px] leading-4 text-muted-foreground">{t('characterResultEmpty')}</div>
                  )}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" size="sm" className="h-10 rounded-md" onClick={() => fileInputRef.current?.click()} disabled={isPreparing}>
                  <Upload className="size-3.5" aria-hidden="true" /> {t('characterChange')}
                </Button>
                <Button type="button" size="sm" className="h-10 rounded-md" onClick={handleRemoveBackground} disabled={isPreparing}>
                  {isPreparing ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <WandSparkles className="size-3.5" aria-hidden="true" />}
                  {isPreparing ? t('characterProcessing') : t('characterRemoveBackground')}
                </Button>
              </div>

              {isPreparing && (
                <div role="status" aria-live="polite" aria-atomic="true" className="space-y-2 rounded-lg border border-border bg-card px-3 py-3">
                  <div className="flex items-center justify-between gap-3 font-body text-[11px] text-muted-foreground">
                    <span>{t('characterProcessingHint')}</span>
                    <span className="font-mono tabular-nums">{progress}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={t('characterProcessing')}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    aria-valuetext={`${progress}%`}
                    className="h-1 overflow-hidden rounded-full bg-muted"
                  >
                    <div className="h-full bg-primary transition-[width]" style={{ width: `${Math.max(4, progress)}%` }} />
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-full rounded-md border-destructive/35 text-destructive hover:border-destructive/50 hover:bg-destructive/10"
                onClick={handleClear}
                disabled={isPreparing}
              >
                <Trash2 className="size-3.5" aria-hidden="true" /> {t('characterDelete')}
              </Button>
            </div>
          )}
          <CharacterErrorNotice
            message={error}
            canRetry={canRetryBackgroundRemoval}
            onRetry={() => void handleRemoveBackground()}
            disabled={isPreparing}
            retryLabel={t('characterRetry')}
            retryAriaLabel={t('characterRetryAria')}
          />
        </div>
      </EditorSection>

      {characterCutoutUrl && (
        <EditorSection title={t('characterRefineTitle')} description={t('characterRefineDescription')} className="border-t border-border pt-5">
          <div className="space-y-3">
            <div ref={brushViewportRef} className="checkerboard relative overflow-hidden rounded-xl border border-border bg-card p-3">
              {editorOpen ? (
                <>
                  <canvas
                    ref={canvasRef}
                    aria-label={t('characterEditorLabel')}
                    className="mx-auto block max-h-[360px] w-full max-w-full cursor-none touch-none object-contain"
                    onPointerEnter={handlePointerEnter}
                    onPointerLeave={handlePointerLeave}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  />
                  {brushCursor && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute z-10 rounded-full border-2 border-primary bg-primary/5 shadow-[0_0_0_1px_var(--color-background)]"
                      style={{
                        left: brushCursor.x,
                        top: brushCursor.y,
                        width: brushSize,
                        height: brushSize,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                </>
              ) : (
                <img src={characterCutoutUrl} alt={t('characterResult')} className="mx-auto block max-h-[360px] w-full object-contain" />
              )}
            </div>

            {editorOpen ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <EditorChoice active={brushMode === 'erase'} onClick={() => setBrushMode('erase')}>
                    <Eraser className="size-3.5" aria-hidden="true" /> {t('characterErase')}
                  </EditorChoice>
                  <EditorChoice active={brushMode === 'restore'} onClick={() => setBrushMode('restore')}>
                    <Brush className="size-3.5" aria-hidden="true" /> {t('characterRestore')}
                  </EditorChoice>
                </div>
                <div className="space-y-2 rounded-lg border border-border bg-card p-3">
                  <EditorFieldHeader label={t('characterBrushSize')} value={`${brushSize}px`} htmlFor="character-brush-size" />
                  <Slider id="character-brush-size" value={[brushSize]} min={16} max={220} step={1} onValueChange={(values) => setBrushSize(Array.isArray(values) ? values[0] : values)} />
                  <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('characterBrushHint')}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="h-10 flex-1 rounded-md" onClick={handleUndo} disabled={undoCount === 0}>
                    <Undo2 className="size-3.5" aria-hidden="true" /> {t('characterUndo')}
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-10 flex-1 rounded-md" onClick={handleRestoreModelResult}>
                    <RotateCcw className="size-3.5" aria-hidden="true" /> {t('characterResetMask')}
                  </Button>
                </div>
              </>
            ) : (
              <Button type="button" variant="outline" size="sm" className="h-10 w-full rounded-md" onClick={() => void openEditorFromCutout()}>
                <Brush className="size-3.5" aria-hidden="true" /> {t('characterOpenEditor')}
              </Button>
            )}
          </div>
        </EditorSection>
      )}

      {characterCutoutUrl && (
        <EditorSection title={t('characterPlacementTitle')} description={t('characterPlacementDescription')} className="border-t border-border pt-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <EditorFieldHeader label={t('characterScale')} value={`${Math.round(characterScale * 100)}%`} htmlFor="character-scale" />
              <Slider id="character-scale" value={[characterScale]} min={CHARACTER_SCALE_MIN} max={CHARACTER_SCALE_MAX} step={0.01} onValueChange={(values) => setCharacterScale(Array.isArray(values) ? values[0] : values)} />
            </div>
            <div className="space-y-2">
              <EditorFieldHeader label={t('opacity')} value={`${characterOpacity}%`} htmlFor="character-opacity" />
              <Slider id="character-opacity" value={[characterOpacity]} min={0} max={100} step={1} onValueChange={(values) => setCharacterOpacity(Array.isArray(values) ? values[0] : values)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <EditorChoice active={characterFlipX} onClick={() => setCharacterFlipX(!characterFlipX)}>
                <FlipHorizontal className="size-3.5" aria-hidden="true" /> {t('characterFlip')}
              </EditorChoice>
              <div className="flex min-h-10 items-center justify-between rounded-md border border-border bg-card px-3">
                <span className="inline-flex items-center gap-2 text-xs font-semibold"><Moon className="size-3.5" aria-hidden="true" />{t('characterShadow')}</span>
                <Switch checked={characterShadow} onCheckedChange={setCharacterShadow} size="sm" aria-label={t('characterShadow')} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('characterDragHint')}</p>
              <button type="button" className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground" onClick={() => setCharacterPosition(null)}>
                <RotateCcw className="size-3.5" aria-hidden="true" /> {t('characterResetPosition')}
              </button>
            </div>
            <CharacterPositionControls />
          </div>
        </EditorSection>
      )}

      <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('characterModelNote')}</p>
    </div>
  )
}
