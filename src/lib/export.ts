import type { RefObject, MutableRefObject } from 'react'
import type Konva from 'konva'
import { useStore } from '@/store/useStore'

export async function exportCanvas(stageRef: RefObject<Konva.Stage | null> | MutableRefObject<Konva.Stage | null>, type: 'png' | 'jpeg') {
  if (!stageRef.current) return

  const store = useStore.getState()
  store.setIsExporting(true)

  try {
    // Wait for React to render the NoiseLayer onto the Konva Canvas
    await new Promise(resolve => setTimeout(resolve, 150))

    const stage = stageRef.current
    if (!stage) return

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

    if (!blob) return

    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `ffxiv-screenshot-${Date.now()}.${type}`
    link.href = objectUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
  } finally {
    store.setIsExporting(false)
  }
}
