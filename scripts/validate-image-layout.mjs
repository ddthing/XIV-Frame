import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const geometryPath = path.join(process.cwd(), 'src', 'lib', 'canvasGeometry.ts')
const geometrySource = fs.readFileSync(geometryPath, 'utf8')
const layoutPath = path.join(process.cwd(), 'src', 'lib', 'layoutTemplates.ts')
const layoutSource = fs.readFileSync(layoutPath, 'utf8')
const compiledGeometry = ts.transpileModule(geometrySource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const geometryModule = await import(`data:text/javascript;base64,${Buffer.from(compiledGeometry).toString('base64')}`)
const { getCanvasLogicalSize, getImageCellGeometry } = geometryModule

assert.match(layoutSource, /export function getLayoutGeometryImageCount\(/)

function assertClose(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 0.0001, `${message}: expected ${expected}, received ${actual}`)
}

function assertContentBounds(cells, width, height, label) {
  const right = Math.max(...cells.map((cell) => cell.x + cell.width))
  const bottom = Math.max(...cells.map((cell) => cell.y + cell.height))
  assertClose(right, width, `${label} width`)
  assertClose(bottom, height, `${label} height`)
}

const mixedImages = [
  { width: 1200, height: 800 },
  { width: 800, height: 1200 },
  { width: 1600, height: 900 },
  { width: 900, height: 1600 },
]
const gridGeometry = {
  effectivePreset: 'grid',
  columns: 2,
  rows: 2,
  cells: [
    { column: 0, row: 0 },
    { column: 1, row: 0 },
    { column: 0, row: 1 },
    { column: 1, row: 1 },
  ],
}
const verticalGeometry = {
  effectivePreset: 'vertical-split',
  columns: 1,
  rows: 2,
  cells: [
    { column: 0, row: 0 },
    { column: 0, row: 1 },
  ],
}
const splitGeometry = {
  effectivePreset: 'split',
  columns: 2,
  rows: 1,
  cells: [
    { column: 0, row: 0 },
    { column: 1, row: 0 },
  ],
}

const portraitImage = [{ width: 800, height: 1200 }]
const splitPreviewSize = getCanvasLogicalSize(portraitImage, splitGeometry, {
  imageGap: 24,
  imageTransition: 'none',
  blendWidth: 50,
  canvasRatio: 'original',
})
assert.deepEqual(
  splitPreviewSize,
  { logicalWidth: 1624, logicalHeight: 1200 },
  'selected two-slot split preview reserves its empty slot',
)
const verticalPreviewSize = getCanvasLogicalSize(portraitImage, verticalGeometry, {
  imageGap: 24,
  imageTransition: 'none',
  blendWidth: 50,
  canvasRatio: 'original',
})
assert.deepEqual(
  verticalPreviewSize,
  { logicalWidth: 800, logicalHeight: 2424 },
  'selected two-slot vertical preview reserves its empty slot',
)

const gridSoftSize = getCanvasLogicalSize(mixedImages, gridGeometry, {
  imageGap: 24,
  imageTransition: 'soft-blend',
  blendWidth: 50,
  canvasRatio: 'auto',
})
assert.deepEqual(gridSoftSize, { logicalWidth: 2350, logicalHeight: 1550 })
const gridSoftCells = mixedImages.map((_, index) => getImageCellGeometry({
  contentWidth: gridSoftSize.logicalWidth,
  contentHeight: gridSoftSize.logicalHeight,
  gap: -50,
  geometry: gridGeometry,
  imageCount: mixedImages.length,
  index,
}))
assertContentBounds(gridSoftCells, 2350, 1550, 'soft-blend grid')

const verticalImages = mixedImages.slice(0, 2)
const verticalSoftSize = getCanvasLogicalSize(verticalImages, verticalGeometry, {
  imageGap: 24,
  imageTransition: 'soft-blend',
  blendWidth: 50,
  canvasRatio: 'auto',
})
assert.deepEqual(verticalSoftSize, { logicalWidth: 1200, logicalHeight: 2550 })
const verticalSoftCells = verticalImages.map((_, index) => getImageCellGeometry({
  contentWidth: verticalSoftSize.logicalWidth,
  contentHeight: verticalSoftSize.logicalHeight,
  gap: -50,
  geometry: verticalGeometry,
  imageCount: verticalImages.length,
  index,
}))
assertContentBounds(verticalSoftCells, 1200, 2550, 'soft-blend vertical layout')

console.log('[layout:check] mixed-aspect soft-blend geometry passed.')
