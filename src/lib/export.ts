import type { RefObject } from 'react'
import type Konva from 'konva'
import { useStore } from '@/store/useStore'
import { captureEditorSnapshot } from '@/store/history'
import { canExportOriginal, getExportDimensions, getExportFilename, type ExportFormat, type ExportSize } from './canvasGeometry'

export interface ExportOptions {
  format: ExportFormat
  size: ExportSize
  filename: string
}

export function getStageDimensions(stage: Konva.Stage) {
  return {
    width: stage.width() / stage.scaleX(),
    height: stage.height() / stage.scaleY(),
  }
}

export function isStageReady(stage: Konva.Stage | null, images: (string | null | undefined)[]) {
  return Boolean(stage && stage.getAttr('exportImageSources') === JSON.stringify(images.filter(Boolean)))
}

function loadAsset(url: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('An image could not be loaded'))
    image.src = url
  })
}

async function waitForCompositionAssets(urls: string[]) {
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      Promise.all([document.fonts.ready, ...urls.map(loadAsset)]),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Canvas assets are still loading')), 15_000)
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
  // React commits the loaded images and removes interactive guides before capture.
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}

export async function exportCanvas(stageRef: RefObject<Konva.Stage | null>, options: ExportOptions | ExportFormat = 'png') {
  const store = useStore.getState()
  if (store.isExporting) throw new Error('An export is already in progress')
  if (!store.images.some(Boolean) || !isStageReady(stageRef.current, store.images)) throw new Error('Canvas is not ready')

  const settings: ExportOptions = typeof options === 'string'
    ? { format: options, size: 4096, filename: 'xiv-frame' }
    : options
  const composition = JSON.stringify(captureEditorSnapshot(store))
  store.setIsExporting(true)

  try {
    const assets = [
      ...store.images,
      store.logoUrl,
      store.characterCutoutUrl,
      store.grainIntensity > 0 ? '/noise-pattern.png' : null,
    ].filter((url): url is string => Boolean(url))
    await waitForCompositionAssets(assets)

    if (composition !== JSON.stringify(captureEditorSnapshot(useStore.getState()))) {
      throw new Error('The composition changed during export; try again')
    }
    const stage = stageRef.current
    if (!stage || !isStageReady(stage, useStore.getState().images)) throw new Error('Canvas is not ready')
    const logical = getStageDimensions(stage)
    if (settings.size === 'original' && !canExportOriginal(logical.width, logical.height)) {
      throw new Error('Original composition is too large; choose 4K instead')
    }
    const dimensions = getExportDimensions(logical.width, logical.height, settings.size)
    const pixelRatio = dimensions.width / stage.width()
    stage.draw()

    // CSS preview zoom/panning never enters the Konva scene. Offset only its
    // responsive fit scale, keeping the same layers and composition as preview.
    const scene = stage.toCanvas({ pixelRatio })
    const output = document.createElement('canvas')
    output.width = dimensions.width
    output.height = dimensions.height
    const context = output.getContext('2d')
    if (!context) throw new Error('Canvas export is unavailable')

    if (settings.format === 'jpeg') {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, output.width, output.height)
    }
    context.drawImage(scene, 0, 0, dimensions.width, dimensions.height)
    const blob = await new Promise<Blob>((resolve, reject) => {
      output.toBlob(result => result ? resolve(result) : reject(new Error('Canvas export returned no data')), `image/${settings.format}`, 0.95)
    })

    const filename = getExportFilename(settings.filename, settings.format)
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = filename
    link.href = objectUrl
    document.body.appendChild(link)
    link.click()
    link.remove()
    // A short grace period keeps Safari downloads valid after the click.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000)
    scene.width = scene.height = output.width = output.height = 0
    return { ...dimensions, filename }
  } finally {
    store.setIsExporting(false)
  }
}
