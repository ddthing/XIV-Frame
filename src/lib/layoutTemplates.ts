import { MAX_IMAGE_COUNT } from '@/lib/imageLimits'

export type LayoutPreset =
  | 'split'
  | 'vertical-split'
  | 'grid'
  | 'feature-top'
  | 'feature-bottom'
  | 'feature-left'
  | 'feature-right'
  | 'columns-3'
  | 'rows-3'
  | 'columns-4'
  | 'rows-4'
  | 'matrix-3'
  | 'matrix-4'

export type LayoutTemplateGroup = 'two' | 'three' | 'four' | 'matrix'

export interface LayoutTemplateOption {
  id: LayoutPreset
  group: LayoutTemplateGroup
  minImages: number
  maxImages: number
  previewCount: number
  labelKey: string
}

export interface LayoutCell {
  column: number
  row: number
  columnSpan?: number
  rowSpan?: number
}

export interface LayoutGeometry {
  effectivePreset: LayoutPreset
  columns: number
  rows: number
  cells: LayoutCell[]
}

export const LAYOUT_TEMPLATE_OPTIONS: readonly LayoutTemplateOption[] = [
  { id: 'split', group: 'two', minImages: 0, maxImages: MAX_IMAGE_COUNT, previewCount: 2, labelKey: 'presetSplit' },
  { id: 'vertical-split', group: 'two', minImages: 0, maxImages: MAX_IMAGE_COUNT, previewCount: 2, labelKey: 'presetVertical' },
  { id: 'grid', group: 'four', minImages: 3, maxImages: 4, previewCount: 4, labelKey: 'presetGrid' },
  { id: 'feature-top', group: 'three', minImages: 3, maxImages: 4, previewCount: 3, labelKey: 'presetFeatureTop' },
  { id: 'feature-bottom', group: 'three', minImages: 3, maxImages: 4, previewCount: 3, labelKey: 'presetFeatureBottom' },
  { id: 'feature-left', group: 'three', minImages: 3, maxImages: 4, previewCount: 3, labelKey: 'presetFeatureLeft' },
  { id: 'feature-right', group: 'three', minImages: 3, maxImages: 4, previewCount: 3, labelKey: 'presetFeatureRight' },
  { id: 'columns-3', group: 'three', minImages: 3, maxImages: 4, previewCount: 3, labelKey: 'presetColumns3' },
  { id: 'rows-3', group: 'three', minImages: 3, maxImages: 4, previewCount: 3, labelKey: 'presetRows3' },
  { id: 'columns-4', group: 'four', minImages: 4, maxImages: 4, previewCount: 4, labelKey: 'presetColumns4' },
  { id: 'rows-4', group: 'four', minImages: 4, maxImages: 4, previewCount: 4, labelKey: 'presetRows4' },
  { id: 'matrix-3', group: 'matrix', minImages: 9, maxImages: 9, previewCount: 9, labelKey: 'presetGrid3x3' },
  { id: 'matrix-4', group: 'matrix', minImages: 16, maxImages: 16, previewCount: 16, labelKey: 'presetGrid4x4' },
]

export const LAYOUT_TEMPLATE_GROUPS: readonly LayoutTemplateGroup[] = ['two', 'three', 'four', 'matrix']

function cellsInRow(count: number): LayoutCell[] {
  return Array.from({ length: count }, (_, column) => ({ column, row: 0 }))
}

function cellsInColumn(count: number): LayoutCell[] {
  return Array.from({ length: count }, (_, row) => ({ column: 0, row }))
}

function cellsInGrid(columns: number, rows: number, count: number): LayoutCell[] {
  return Array.from({ length: count }, (_, index) => ({
    column: index % columns,
    row: Math.floor(index / columns),
  }))
}

function featureTopCells(imageCount: number): LayoutGeometry {
  if (imageCount >= 4) {
    return {
      effectivePreset: 'feature-top',
      columns: 3,
      rows: 2,
      cells: [
        { column: 0, row: 0, columnSpan: 3 },
        { column: 0, row: 1 },
        { column: 1, row: 1 },
        { column: 2, row: 1 },
      ],
    }
  }

  return {
    effectivePreset: 'feature-top',
    columns: 2,
    rows: 2,
    cells: [
      { column: 0, row: 0, columnSpan: 2 },
      { column: 0, row: 1 },
      { column: 1, row: 1 },
    ],
  }
}

function featureBottomCells(imageCount: number): LayoutGeometry {
  if (imageCount >= 4) {
    return {
      effectivePreset: 'feature-bottom',
      columns: 3,
      rows: 2,
      cells: [
        { column: 0, row: 0 },
        { column: 1, row: 0 },
        { column: 2, row: 0 },
        { column: 0, row: 1, columnSpan: 3 },
      ],
    }
  }

  return {
    effectivePreset: 'feature-bottom',
    columns: 2,
    rows: 2,
    cells: [
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 0, row: 1, columnSpan: 2 },
    ],
  }
}

function featureLeftCells(imageCount: number): LayoutGeometry {
  if (imageCount >= 4) {
    return {
      effectivePreset: 'feature-left',
      columns: 3,
      rows: 2,
      cells: [
        { column: 0, row: 0, rowSpan: 2 },
        { column: 1, row: 0, columnSpan: 2 },
        { column: 1, row: 1 },
        { column: 2, row: 1 },
      ],
    }
  }

  return {
    effectivePreset: 'feature-left',
    columns: 2,
    rows: 2,
    cells: [
      { column: 0, row: 0, rowSpan: 2 },
      { column: 1, row: 0 },
      { column: 1, row: 1 },
    ],
  }
}

function featureRightCells(imageCount: number): LayoutGeometry {
  if (imageCount >= 4) {
    return {
      effectivePreset: 'feature-right',
      columns: 3,
      rows: 2,
      cells: [
        { column: 0, row: 0, columnSpan: 2 },
        { column: 2, row: 0, rowSpan: 2 },
        { column: 0, row: 1 },
        { column: 1, row: 1 },
      ],
    }
  }

  return {
    effectivePreset: 'feature-right',
    columns: 2,
    rows: 2,
    cells: [
      { column: 0, row: 0 },
      { column: 1, row: 0, rowSpan: 2 },
      { column: 0, row: 1 },
    ],
  }
}

function getTemplateGeometry(preset: LayoutPreset, previewCount: number): LayoutGeometry {
  const count = Math.max(1, Math.min(MAX_IMAGE_COUNT, Math.floor(previewCount)))

  switch (preset) {
    case 'vertical-split':
      return { effectivePreset: 'vertical-split', columns: 1, rows: count, cells: cellsInColumn(count) }
    case 'grid':
      return { effectivePreset: 'grid', columns: 2, rows: 2, cells: cellsInGrid(2, 2, 4) }
    case 'feature-top':
      return featureTopCells(Math.max(3, Math.min(4, count)))
    case 'feature-bottom':
      return featureBottomCells(Math.max(3, Math.min(4, count)))
    case 'feature-left':
      return featureLeftCells(Math.max(3, Math.min(4, count)))
    case 'feature-right':
      return featureRightCells(Math.max(3, Math.min(4, count)))
    case 'columns-3':
      return count === 4
        ? {
            effectivePreset: 'columns-3',
            columns: 3,
            rows: 2,
            cells: [
              { column: 0, row: 0 },
              { column: 1, row: 0 },
              { column: 2, row: 0 },
              { column: 1, row: 1 },
            ],
          }
        : { effectivePreset: 'columns-3', columns: 3, rows: 1, cells: cellsInRow(3) }
    case 'rows-3':
      return count === 4
        ? {
            effectivePreset: 'rows-3',
            columns: 2,
            rows: 3,
            cells: [
              { column: 0, row: 0 },
              { column: 0, row: 1 },
              { column: 0, row: 2 },
              { column: 1, row: 1 },
            ],
          }
        : { effectivePreset: 'rows-3', columns: 1, rows: 3, cells: cellsInColumn(3) }
    case 'columns-4':
      return { effectivePreset: 'columns-4', columns: 4, rows: 1, cells: cellsInRow(4) }
    case 'rows-4':
      return { effectivePreset: 'rows-4', columns: 1, rows: 4, cells: cellsInColumn(4) }
    case 'matrix-3':
      return { effectivePreset: 'matrix-3', columns: 3, rows: 3, cells: cellsInGrid(3, 3, 9) }
    case 'matrix-4':
      return { effectivePreset: 'matrix-4', columns: 4, rows: 4, cells: cellsInGrid(4, 4, 16) }
    case 'split':
    default:
      return { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
  }
}

export function getLayoutGeometry(preset: LayoutPreset | string | undefined, imageCount: number): LayoutGeometry {
  const count = Math.max(1, Math.min(MAX_IMAGE_COUNT, imageCount))
  const template = LAYOUT_TEMPLATE_OPTIONS.find((option) => option.id === preset)

  // Keep the selected composition while its slots are being filled. Overflow
  // still falls back below so extra images remain visible instead of clipping.
  if (template && imageCount < template.minImages) {
    return getTemplateGeometry(template.id, template.previewCount)
  }

  switch (preset) {
    case 'vertical-split':
      return { effectivePreset: 'vertical-split', columns: 1, rows: count, cells: cellsInColumn(count) }
    case 'grid':
      if (count >= 3 && count <= 4) {
        return { effectivePreset: 'grid', columns: 2, rows: 2, cells: cellsInGrid(2, 2, 4) }
      }
      return { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'feature-top':
      return count >= 3 && count <= 4 ? featureTopCells(count) : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'feature-bottom':
      return count >= 3 && count <= 4 ? featureBottomCells(count) : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'feature-left':
      return count >= 3 && count <= 4 ? featureLeftCells(count) : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'feature-right':
      return count >= 3 && count <= 4 ? featureRightCells(count) : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'columns-3':
      if (count === 4) {
        return {
          effectivePreset: 'columns-3',
          columns: 3,
          rows: 2,
          cells: [
            { column: 0, row: 0 },
            { column: 1, row: 0 },
            { column: 2, row: 0 },
            { column: 1, row: 1 },
          ],
        }
      }
      return count === 3 ? { effectivePreset: 'columns-3', columns: 3, rows: 1, cells: cellsInRow(3) } : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'rows-3':
      if (count === 4) {
        return {
          effectivePreset: 'rows-3',
          columns: 2,
          rows: 3,
          cells: [
            { column: 0, row: 0 },
            { column: 0, row: 1 },
            { column: 0, row: 2 },
            { column: 1, row: 1 },
          ],
        }
      }
      return count === 3 ? { effectivePreset: 'rows-3', columns: 1, rows: 3, cells: cellsInColumn(3) } : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'columns-4':
      return count === 4 ? { effectivePreset: 'columns-4', columns: 4, rows: 1, cells: cellsInRow(4) } : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'rows-4':
      return count === 4 ? { effectivePreset: 'rows-4', columns: 1, rows: 4, cells: cellsInColumn(4) } : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'matrix-3':
      return count === 9 ? { effectivePreset: 'matrix-3', columns: 3, rows: 3, cells: cellsInGrid(3, 3, 9) } : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'matrix-4':
      return count === 16 ? { effectivePreset: 'matrix-4', columns: 4, rows: 4, cells: cellsInGrid(4, 4, 16) } : { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
    case 'split':
    default:
      return { effectivePreset: 'split', columns: count, rows: 1, cells: cellsInRow(count) }
  }
}

export function getLayoutGeometryImageCount(
  preset: LayoutPreset | string | undefined,
  imageCount: number,
  preserveSelectedPreview = false,
) {
  const count = Math.max(0, Math.min(MAX_IMAGE_COUNT, Math.floor(imageCount)))
  if (count === 0) return 2

  // A selected two-slot composition must not collapse into a full-canvas
  // single image while the user is filling its preview.
  if (
    preserveSelectedPreview
    && count === 1
    && (preset === 'split' || preset === 'vertical-split')
  ) {
    return 2
  }

  return count
}

export function getLayoutPreviewGeometry(preset: LayoutPreset | string | undefined): LayoutGeometry {
  const option = LAYOUT_TEMPLATE_OPTIONS.find((template) => template.id === preset)
  return getTemplateGeometry(option?.id ?? 'split', option?.previewCount ?? 2)
}

export function getRecommendedLayoutPreset(imageCount: number): LayoutPreset | undefined {
  if (imageCount === 3 || imageCount === 4) return 'grid'
  if (imageCount === 9) return 'matrix-3'
  if (imageCount === 16) return 'matrix-4'
  return undefined
}

export function isLayoutTemplateAvailable(preset: LayoutPreset | string | undefined, imageCount: number) {
  const option = LAYOUT_TEMPLATE_OPTIONS.find((template) => template.id === preset)
  return Boolean(option && imageCount >= option.minImages && imageCount <= option.maxImages)
}
