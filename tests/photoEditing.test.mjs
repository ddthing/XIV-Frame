import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

async function load(path) {
  const { outputText } = ts.transpileModule(await readFile(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}
const { getPhotoFit, getPhotoTransform } = await load('../src/lib/photoEditing.ts')
const { getCanvasDimensions, getImageCellSize } = await load('../src/lib/canvasGeometry.ts')
const point = ([a,b,c,d,e,f], x, y) => [a*x+c*y+e, b*x+d*y+f].map(n => n || 0)

test('quarter turns map every source corner inside the swapped output dimensions', () => {
  const right = getPhotoTransform(600, 900, 'rotate-right')
  const left = getPhotoTransform(600, 900, 'rotate-left')
  assert.deepEqual([right.width,right.height], [900,600])
  assert.deepEqual([left.width,left.height], [900,600])
  const corners = [[0,0],[600,0],[600,900],[0,900]]
  assert.deepEqual(corners.map(([x,y]) => point(right.matrix,x,y)), [[900,0],[900,600],[0,600],[0,0]])
  assert.deepEqual(corners.map(([x,y]) => point(left.matrix,x,y)), [[0,600],[0,0],[900,0],[900,600]])
})

test('each flip applied twice restores original pixel coordinates', () => {
  for (const operation of ['flip-horizontal','flip-vertical']) {
    const transform = getPhotoTransform(1600,900,operation)
    assert.deepEqual([transform.width,transform.height], [1600,900])
    for (const [x,y] of [[0,0],[1600,900],[315,622]]) {
      assert.deepEqual(point(transform.matrix,...point(transform.matrix,x,y)), [x,y])
    }
  }
})

test('contain keeps extreme portrait and landscape photos fully inside every layout and fixed ratio', () => {
  const images = [{width:1600,height:900},{width:900,height:1600},{width:4096,height:256},{width:300,height:2400}]
  for (const layoutPreset of ['split','vertical-split','grid']) for (const count of [1,2,3,4]) for (const canvasRatio of ['auto','16:9','2:1','1:1','4:5','9:16']) for (const gap of [24,-60]) {
    const current = images.slice(0,count)
    const canvas = getCanvasDimensions({images:current,layoutPreset,canvasRatio,gap,borderWidth:40})
    const cell = getImageCellSize(canvas.logicalWidth,canvas.logicalHeight,count,layoutPreset,gap)
    for (const image of current) {
      const fit = getPhotoFit(image,cell,'contain')
      const base = Math.max(cell.width/image.width,cell.height/image.height)
      const width = image.width*base*fit.scale, height=image.height*base*fit.scale
      assert.ok(width <= cell.width+1e-7 && height <= cell.height+1e-7)
      assert.ok(Math.abs(width-cell.width)<1e-7 || Math.abs(height-cell.height)<1e-7)
      assert.ok(Math.abs(2*fit.position.x+width-cell.width)<1e-7)
      assert.ok(Math.abs(2*fit.position.y+height-cell.height)<1e-7)
    }
  }
})

test('fill covers both edges and centers the crop for portrait and landscape photos', () => {
  for (const image of [{width:1600,height:900},{width:900,height:1600}]) {
    const cell={width:600,height:400},fit=getPhotoFit(image,cell,'cover')
    const scale=Math.max(cell.width/image.width,cell.height/image.height)
    assert.equal(fit.scale,1)
    assert.ok(fit.position.x<=0 && fit.position.y<=0)
    assert.equal(fit.position.x*2+image.width*scale,cell.width)
    assert.equal(fit.position.y*2+image.height*scale,cell.height)
  }
})
