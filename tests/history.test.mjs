import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

// Use the existing TypeScript dependency; no test framework or browser is needed
// for the history controller and image slice.
async function loadTypeScript(relativePath) {
  const source = await readFile(new URL(relativePath, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}

const { captureEditorSnapshot, createEditorHistory } = await loadTypeScript('../src/store/history.ts')
const { initialImageState, createImageSlice } = await loadTypeScript('../src/store/slices/imageSlice.ts')
const { initialLayoutState } = await loadTypeScript('../src/store/slices/layoutSlice.ts')
const { initialSignatureState } = await loadTypeScript('../src/store/slices/signatureSlice.ts')
const { initialCharacterState } = await loadTypeScript('../src/store/slices/characterSlice.ts')

function initialState(patch = {}) {
  return captureEditorSnapshot({
    ...initialImageState,
    ...initialLayoutState,
    ...initialSignatureState,
    ...initialCharacterState,
    ...patch,
  })
}

test('records composition changes and ignores zoom, loading, export, and lock state', () => {
  const history = createEditorHistory()
  const before = initialState()
  const viewOnly = captureEditorSnapshot({ ...before, zoom: 200, isExporting: true, isCanvasLoading: true, isImageLocked: true })
  assert.equal(history.record(before, viewOnly), false)
  assert.deepEqual(history.status(), { canUndo: false, canRedo: false })
  const after = { ...before, canvasRatio: '4:5', characterName: 'Warrior of Light' }
  history.record(before, after)
  assert.deepEqual(history.undo(after), before)
  assert.deepEqual(history.status(), { canUndo: false, canRedo: true })
  assert.deepEqual(history.redo(before), after)
})

test('coalesces one continuous gesture, but separates fields, images, and idle gaps', () => {
  let time = 0
  const history = createEditorHistory({ now: () => time })
  let state = initialState({ images: ['a', 'b'], imageScales: [1, 1] })
  const initial = state
  for (const scale of [1.1, 1.2, 1.3]) {
    const next = { ...state, imageScales: [scale, 1] }
    history.record(state, next)
    state = next
    time += 100
  }
  const firstImageEdit = state
  const secondImageEdit = { ...state, imageScales: [1.3, 1.1] }
  history.record(state, secondImageEdit)
  time += 1000
  const afterPause = { ...secondImageEdit, imageScales: [1.3, 1.2] }
  history.record(secondImageEdit, afterPause)
  const nameEdit = { ...afterPause, characterName: 'New name' }
  history.record(afterPause, nameEdit)
  assert.deepEqual(history.undo(nameEdit), afterPause)
  assert.deepEqual(history.undo(afterPause), secondImageEdit)
  assert.deepEqual(history.undo(secondImageEdit), firstImageEdit)
  assert.deepEqual(history.undo(firstImageEdit), initial)
  assert.equal(history.undo(initial), null)
})

test('a new branch invalidates redo and keeps the history bounded', () => {
  const history = createEditorHistory({ limit: 2 })
  const first = initialState()
  const second = { ...first, canvasRatio: '1:1' }
  const third = { ...second, canvasRatio: '4:5' }
  const fourth = { ...third, canvasRatio: '9:16' }
  history.record(first, second)
  history.record(second, third)
  history.record(third, fourth)
  assert.deepEqual(history.undo(fourth), third)
  assert.deepEqual(history.undo(third), second)
  assert.equal(history.undo(second), null)
  history.record(second, { ...second, layoutPreset: 'grid' })
  assert.equal(history.status().canRedo, false)
})

test('retains removed images for undo and releases unreachable URLs exactly once', () => {
  const revoked = []
  const history = createEditorHistory({ revokeUrl: url => revoked.push(url) })
  const empty = initialState()
  const uploaded = initialState({ images: ['blob:original', 'blob:original'] })
  const replaced = initialState({ images: ['blob:replacement'] })
  history.record(empty, uploaded)
  history.record(uploaded, replaced)
  assert.deepEqual(revoked, [])
  history.undo(replaced)
  history.record(uploaded, { ...uploaded, canvasRatio: '1:1' })
  assert.deepEqual(revoked, ['blob:replacement'])
  history.clear(empty)
  assert.deepEqual(revoked, ['blob:replacement', 'blob:original'])
  history.clear(empty)
  assert.equal(revoked.length, 2)
})

test('releases evicted images, preserves current images, and makes reset reversible', () => {
  const revoked = []
  const history = createEditorHistory({ limit: 1, revokeUrl: url => revoked.push(url) })
  const first = initialState({ images: ['blob:first'] })
  const second = initialState({ images: ['blob:second'], signatureSize: 140 })
  const third = initialState({ images: ['blob:third'] })
  history.record(first, second)
  history.record(second, third)
  assert.deepEqual(revoked, ['blob:first'])
  history.finishGroup()
  const reset = initialState()
  history.record(third, reset)
  assert.deepEqual(history.undo(reset), third)
  history.clear(third)
  assert.equal(revoked.includes('blob:third'), false)
  assert.deepEqual(history.status(), { canUndo: false, canRedo: false })
})

test('capturing a snapshot isolates transform arrays and position objects', () => {
  const state = initialState({ images: ['a'], imagePositions: [{ x: 2, y: 3 }], imageScales: [1.2], characterPosition: { x: 4, y: 5 } })
  const snapshot = captureEditorSnapshot(state)
  state.images[0] = 'b'
  state.imagePositions[0].x = 100
  state.imageScales[0] = 3
  state.characterPosition.x = 100
  assert.deepEqual(snapshot.images, ['a'])
  assert.deepEqual(snapshot.imagePositions, [{ x: 2, y: 3 }])
  assert.deepEqual(snapshot.imageScales, [1.2])
  assert.deepEqual(snapshot.characterPosition, { x: 4, y: 5 })
})

test('image replacement resets transforms atomically and invalid transforms do nothing', () => {
  let state
  const edits = []
  const set = update => {
    const next = typeof update === 'function' ? update(state) : update
    if (next === state) return
    state = { ...state, ...next }
    edits.push(next)
  }
  state = { ...createImageSlice(set), images: ['old'], imagePositions: [{ x: 40, y: 30 }], imageScales: [2] }
  state.setImageAt(0, 'new')
  assert.equal(edits.length, 1)
  assert.deepEqual(state.imagePositions, [{ x: 0, y: 0 }])
  assert.deepEqual(state.imageScales, [1])
  state.setImageScale(0, 1)
  state.setImagePosition(0, { x: 0, y: 0 })
  state.setImageScale(10, 2)
  state.setImagePosition(0, { x: NaN, y: 0 })
  assert.equal(edits.length, 1)
  state.setImageScale(0, 1.5)
  state.setImagePosition(0, { x: 15, y: 30 })
  const editCount = edits.length
  state.resetImageTransform(0)
  assert.equal(edits.length, editCount + 1)
  assert.deepEqual(state.imagePositions, [{ x: 0, y: 0 }])
  assert.deepEqual(state.imageScales, [1])
  state.resetImageTransform(0)
  assert.equal(edits.length, editCount + 1)
})
