import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const source = fs.readFileSync(new URL('../src/components/canvas/layers/CharacterLayer.tsx', import.meta.url), 'utf8')
const {outputText} = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
})

function renderCharacter(flipped) {
  let stateIndex = 0
  const edits = []
  const state = {
    characterCutoutUrl: 'character.png', characterPosition: {x:100,y:50},
    characterScale: 1, characterOpacity: 100, characterFlipX: flipped,
    characterShadow: false, isExporting: false,
    applyEdit: patch => edits.push(patch), setCharacterPosition() {},
  }
  const useStore = selector => selector(state)
  useStore.getState = () => state
  const react = require('react')
  const mocks = {
    react: { ...react, useEffect() {}, useMemo: callback => callback(), useRef: value => ({current:value}), useState: value => [stateIndex++ === 0 ? true : value, () => {}] },
    'react-konva': {Group:'Group', Image:'Image', Rect:'Rect', Text:'Text'},
    'use-image': {__esModule:true, default:() => [{width:600,height:900}]},
    'zustand/react/shallow': {useShallow: selector => selector},
    '@/store/useStore': {useStore},
  }
  const exports = {}
  vm.runInNewContext(outputText, {exports, require:id => id in mocks ? mocks[id] : require(id)})
  const tree = exports.CharacterLayer({contentWidth:1200,contentHeight:1600})
  const [image, guide] = tree.props.children
  return {image, guide, edits}
}

test('flipped and normal resize guides follow the actual rendered image right edge', () => {
  for (const flipped of [false,true]) {
    const {image, guide} = renderCharacter(flipped)
    const scene = guide.type(guide.props)
    const handle = scene.props.children.find(child => child?.props?.draggable)
    const {x,width,offsetX=0,scaleX} = image.props
    const right = Math.max(x-offsetX*scaleX, x+(width-offsetX)*scaleX)
    assert.ok(Math.abs(handle.props.x+handle.props.width/2-right)<1e-8)
  }
})

test('resizing either orientation preserves its visual left anchor in one atomic edit', () => {
  for (const flipped of [false,true]) {
    const {guide, edits} = renderCharacter(flipped)
    guide.props.onResizePreview(100+guide.props.width*1.2)
    guide.props.onResizeEnd()
    assert.equal(edits.length,1)
    assert.equal(edits[0].characterPosition.x,100)
    assert.equal(edits[0].characterPosition.y,50)
    assert.ok(Math.abs(edits[0].characterScale-1.2)<1e-8)
  }
})
