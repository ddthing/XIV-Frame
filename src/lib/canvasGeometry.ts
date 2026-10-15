import type { CanvasRatio, LayoutPreset } from '../store/slices/layoutSlice'

export const CANVAS_RATIOS: CanvasRatio[] = ['auto', '16:9', '2:1', '1:1', '4:5', '9:16']

export function canvasAspectRatio(ratio: CanvasRatio) {
  if (ratio === 'auto') return 16 / 9
  const [width, height] = ratio.split(':').map(Number)
  return width / height
}

/** Fixed ratios describe the complete output, including its frame border. */
export function getCanvasDimensions({
  images,
  layoutPreset,
  gap,
  canvasRatio,
  borderWidth = 0,
}: {
  images: { width: number; height: number }[]
  layoutPreset: LayoutPreset
  gap: number
  canvasRatio: CanvasRatio
  borderWidth?: number
}) {
  let width = 1920
  let height = 1080

  if (images.length) {
    const first = images[0]
    if (layoutPreset === 'grid' && images.length >= 3) {
      width = first.width * 2 + gap
      height = first.height * 2 + gap
    } else if (layoutPreset === 'vertical-split') {
      width = first.width
      height = images.reduce((sum, image) => sum + image.height * first.width / image.width, 0)
        + (images.length - 1) * gap
    } else {
      height = first.height
      width = images.reduce((sum, image) => sum + image.width * first.height / image.height, 0)
        + (images.length - 1) * gap
    }
  }

  let outerWidth = Math.max(1, width) + borderWidth * 2
  let outerHeight = Math.max(1, height) + borderWidth * 2

  if (canvasRatio !== 'auto') {
    const ratio = canvasAspectRatio(canvasRatio)
    outerWidth = Math.max(outerWidth, outerHeight * ratio)
    outerHeight = outerWidth / ratio
  }

  return {
    logicalWidth: outerWidth - borderWidth * 2,
    logicalHeight: outerHeight - borderWidth * 2,
    outerWidth,
    outerHeight,
  }
}

export type ExportSize = 'original' | 2048 | 4096

export function getImageCellSize(contentWidth: number, contentHeight: number, count: number, layout: string, gap: number) {
  if (layout === 'grid' && count >= 3) return { width: (contentWidth - gap) / 2, height: (contentHeight - gap) / 2 }
  if (layout === 'vertical-split') return { width: contentWidth, height: (contentHeight - gap * (count - 1)) / count }
  return { width: (contentWidth - gap * (count - 1)) / count, height: contentHeight }
}
export type ExportFormat = 'png' | 'jpeg'

export function getExportDimensions(width: number, height: number, size: ExportSize) {
  if (![width, height].every(value => Number.isFinite(value) && value > 0)) {
    throw new Error('Canvas dimensions are invalid')
  }

  const scale = size === 'original' ? 1 : size / Math.max(width, height)
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export function canExportOriginal(width: number, height: number) {
  return Math.max(width, height) <= 8192 && width * height <= 40_000_000
}

export function getExportFilename(filename: string, format: ExportFormat) {
  const base = filename.trim().replace(/\.(png|jpe?g)$/i, '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/[. ]+$/g, '').slice(0, 100)
  return `${base || 'xiv-frame'}.${format === 'jpeg' ? 'jpg' : 'png'}`
}
