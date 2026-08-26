export interface CanvasImageSize {
  width: number
  height: number
}

export interface CanvasLayoutCell {
  column: number
  row: number
  columnSpan?: number
  rowSpan?: number
}

export interface CanvasLayoutGeometry {
  effectivePreset: string
  columns: number
  rows: number
  cells: readonly CanvasLayoutCell[]
}

export interface CanvasLogicalSizeOptions {
  imageGap: number
  imageTransition: string
  blendWidth: number
  canvasRatio: string
}

export interface CanvasLogicalSize {
  logicalWidth: number
  logicalHeight: number
}

export interface ImageCellGeometry {
  x: number
  y: number
  width: number
  height: number
  column: number
  row: number
  columnSpan: number
  rowSpan: number
}

function getLayoutGap({ imageGap, imageTransition, blendWidth }: CanvasLogicalSizeOptions) {
  return imageTransition === 'soft-blend' ? -blendWidth : imageGap
}

export function getCanvasLogicalSize(
  images: readonly CanvasImageSize[],
  geometry: CanvasLayoutGeometry,
  options: CanvasLogicalSizeOptions,
): CanvasLogicalSize {
  if (images.length === 0) return { logicalWidth: 1920, logicalHeight: 1080 }

  const firstImage = images[0]
  const layoutGap = getLayoutGap(options)
  let totalWidth = 0
  let gridHeight = firstImage.height

  // Aspect-based splits derive their size from image dimensions. Reserve the
  // selected layout's empty slots as soon as the first image is available so
  // asynchronous image decoding cannot reflow the canvas while it fills.
  if (geometry.effectivePreset === 'vertical-split') {
    const slotCount = Math.max(images.length, geometry.cells.length)
    totalWidth = firstImage.width
    gridHeight = images.reduce(
      (height, image) => height + image.height * (firstImage.width / image.width),
      0,
    )
    gridHeight += (slotCount - images.length) * firstImage.height
    gridHeight += Math.max(0, slotCount - 1) * layoutGap
  } else if (geometry.effectivePreset === 'split') {
    const slotCount = Math.max(images.length, geometry.cells.length)
    totalWidth = images.reduce(
      (width, image) => width + image.width * (firstImage.height / image.height),
      0,
    )
    totalWidth += (slotCount - images.length) * firstImage.width
    totalWidth += Math.max(0, slotCount - 1) * layoutGap
  } else {
    totalWidth = (firstImage.width * geometry.columns) + (layoutGap * (geometry.columns - 1))
    gridHeight = (firstImage.height * geometry.rows) + (layoutGap * (geometry.rows - 1))
  }

  // Keep the legacy value as a defensive fallback for a settings payload that
  // was written before the persisted-state migration ran.
  if (options.canvasRatio === 'x' || options.canvasRatio === '16:9') {
    const width = Math.max(totalWidth, gridHeight * (16 / 9))
    return { logicalWidth: width, logicalHeight: width * (9 / 16) }
  }

  if (options.canvasRatio === '2:1') {
    const width = Math.max(totalWidth, gridHeight * 2)
    return { logicalWidth: width, logicalHeight: width / 2 }
  }

  return { logicalWidth: totalWidth, logicalHeight: gridHeight }
}

export function getImageCellGeometry({
  contentWidth,
  contentHeight,
  gap,
  geometry,
  imageCount,
  index,
}: {
  contentWidth: number
  contentHeight: number
  gap: number
  geometry: CanvasLayoutGeometry
  imageCount: number
  index: number
}): ImageCellGeometry {
  const cell = geometry.cells[index] || { column: index, row: 0 }
  const columnSpan = cell.columnSpan ?? 1
  const rowSpan = cell.rowSpan ?? 1
  const isAspectRow = geometry.effectivePreset === 'split'
  const isAspectColumn = geometry.effectivePreset === 'vertical-split'
  const count = Math.max(1, imageCount)

  let unitWidth = 0
  let unitHeight = 0

  if (isAspectColumn) {
    unitWidth = contentWidth
    unitHeight = (contentHeight - (gap * (count - 1))) / count
  } else if (isAspectRow) {
    unitWidth = (contentWidth - (gap * (count - 1))) / count
    unitHeight = contentHeight
  } else {
    unitWidth = (contentWidth - (gap * (geometry.columns - 1))) / geometry.columns
    unitHeight = (contentHeight - (gap * (geometry.rows - 1))) / geometry.rows
  }

  const width = isAspectRow
    ? unitWidth
    : unitWidth * columnSpan + (gap * (columnSpan - 1))
  const height = isAspectColumn
    ? unitHeight
    : unitHeight * rowSpan + (gap * (rowSpan - 1))
  const x = isAspectColumn
    ? 0
    : isAspectRow
      ? index * (width + gap)
      : cell.column * (unitWidth + gap)
  const y = isAspectColumn
    ? index * (height + gap)
    : isAspectRow
      ? 0
      : cell.row * (unitHeight + gap)

  return { x, y, width, height, column: cell.column, row: cell.row, columnSpan, rowSpan }
}
