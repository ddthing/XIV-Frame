import type { RefObject, MutableRefObject } from 'react'
import type Konva from 'konva'
import { useStore } from '@/store/useStore'

function waitForCanvasPaint() {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    return new Promise<void>((resolve) => setTimeout(resolve, 0))
  }

  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()))
  })
}

export async function exportCanvas(stageRef: RefObject<Konva.Stage | null> | MutableRefObject<Konva.Stage | null>, type: 'png' | 'jpeg') {
  if (!stageRef.current) throw new Error('Export stage unavailable')

  const store = useStore.getState()
  store.setIsExporting(true)

  try {
    // Wait for React and Konva to paint the export-only noise layer. Two
    // animation frames are enough and avoid an unconditional 150ms delay.
    await waitForCanvasPaint()

    const stage = stageRef.current
    if (!stage) throw new Error('Export stage unavailable')

    const currentScale = stage.scaleX() || 1
    const logicalWidth = stage.width() / currentScale
    const logicalHeight = stage.height() / currentScale
    const maxLogicalDimension = Math.max(logicalWidth, logicalHeight)

    // Twitter "Load 4K" optimal dimension is up to 4096px.
    // If the image is small, we double it for crispness. If it's too large, we clamp to 4096px
    // to prevent Twitter from aggressively resizing and crushing the quality.
    let targetDimension = maxLogicalDimension
    if (targetDimension > 4096) {
      targetDimension = 4096
    } else if (targetDimension < 2048) {
      targetDimension = Math.min(4096, targetDimension * 2)
    }

    // Calculate pixel ratio to offset the responsive window scale and achieve the target 4K dimension
    const pixelRatio = targetDimension / (maxLogicalDimension * currentScale)
    const blob = await stage.toBlob({
      pixelRatio,
      mimeType: `image/${type}`,
      quality: type === 'jpeg' ? 0.95 : undefined, // 95% is optimal for Twitter high-quality JPEG
    }) as Blob | null

    if (!blob) throw new Error('Export image could not be created')

    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `ffxiv-screenshot-${Date.now()}.${type}`
    link.href = objectUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // Keep the URL alive briefly so browsers finish consuming the download
    // after the temporary anchor is removed.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  } finally {
    store.setIsExporting(false)
  }
}
