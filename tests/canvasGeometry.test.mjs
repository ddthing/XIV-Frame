import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

// Transpile with the existing dependency so these tests also run on Node 20.
const source = await readFile(new URL('../src/lib/canvasGeometry.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
})
const { canExportOriginal, getCanvasDimensions, getExportDimensions, getExportFilename } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

const images = [{ width: 1920, height: 1080 }, { width: 1920, height: 1080 }]

test('all fixed aspect ratios include the border in their final dimensions', () => {
  for (const ratio of ['16:9', '2:1', '1:1', '4:5', '9:16']) {
    const result = getCanvasDimensions({ images, layoutPreset: 'split', gap: 24, canvasRatio: ratio, borderWidth: 48 })
    const [w, h] = ratio.split(':').map(Number)
    assert.ok(Math.abs(result.outerWidth / result.outerHeight - w / h) < 1e-12)
    assert.equal(result.outerWidth - result.logicalWidth, 96)
    assert.equal(result.outerHeight - result.logicalHeight, 96)
  }
})

test('auto dimensions preserve natural horizontal, vertical, and grid compositions', () => {
  const options = { images, gap: 24, canvasRatio: 'auto', borderWidth: 0 }
  assert.deepEqual(getCanvasDimensions({ ...options, layoutPreset: 'split' }), { logicalWidth: 3864, logicalHeight: 1080, outerWidth: 3864, outerHeight: 1080 })
  assert.equal(getCanvasDimensions({ ...options, layoutPreset: 'vertical-split' }).outerHeight, 2184)
  const grid = getCanvasDimensions({ ...options, images: [...images, images[0]], layoutPreset: 'grid' })
  assert.equal(grid.outerWidth, 3864)
  assert.equal(grid.outerHeight, 2184)
})

test('soft blend overlap affects vertical and grid geometry as well as horizontal', () => {
  const options = { images, gap: -50, canvasRatio: 'auto' }
  assert.equal(getCanvasDimensions({ ...options, layoutPreset: 'split' }).outerWidth, 3790)
  assert.equal(getCanvasDimensions({ ...options, layoutPreset: 'vertical-split' }).outerHeight, 2110)
  const grid = getCanvasDimensions({ ...options, images: [...images, images[0]], layoutPreset: 'grid' })
  assert.equal(grid.outerWidth, 3790)
  assert.equal(grid.outerHeight, 2110)
})

test('2K and 4K use the longest edge for both portrait and landscape output', () => {
  assert.deepEqual(getExportDimensions(1920, 1080, 4096), { width: 4096, height: 2304 })
  assert.deepEqual(getExportDimensions(1080, 1920, 2048), { width: 1152, height: 2048 })
  assert.deepEqual(getExportDimensions(1000, 1250, 4096), { width: 3277, height: 4096 })
  assert.deepEqual(getExportDimensions(2160, 3840, 'original'), { width: 2160, height: 3840 })
  assert.deepEqual(getExportDimensions(3333.3, 1111.1, 'original'), { width: 3333, height: 1111 })
})

test('unsafe dimensions and oversized original exports are caught before allocation', () => {
  assert.throws(() => getExportDimensions(0, 1000, 4096))
  assert.throws(() => getExportDimensions(Infinity, 1000, 4096))
  assert.equal(canExportOriginal(4096, 4096), true)
  assert.equal(canExportOriginal(9000, 1000), false)
  assert.equal(canExportOriginal(8000, 8000), false)
})

test('download names have a single matching extension and no path characters', () => {
  assert.equal(getExportFilename(' My frame.PNG ', 'jpeg'), 'My frame.jpg')
  assert.equal(getExportFilename('raid/clear:01', 'png'), 'raid-clear-01.png')
  assert.equal(getExportFilename(' ', 'png'), 'xiv-frame.png')
})
