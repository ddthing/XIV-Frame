import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

async function moduleUrl(path, replacements = {}) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8')
  let { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  })
  for (const [from, to] of Object.entries(replacements)) outputText = outputText.replaceAll(`'${from}'`, `'${to}'`)
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
}

const imageModule = await moduleUrl('../src/lib/imageUpload.ts')
const { MAX_PROJECT_FILE_SIZE, ProjectFileError, validateProjectDocument, serializeProject, prepareProjectImport, releasePreparedProject } = await import(await moduleUrl('../src/lib/project.ts', { './imageUpload': imageModule }))
const { initialImageState } = await import(await moduleUrl('../src/store/slices/imageSlice.ts'))
const { initialLayoutState } = await import(await moduleUrl('../src/store/slices/layoutSlice.ts'))
const { initialSignatureState } = await import(await moduleUrl('../src/store/slices/signatureSlice.ts'))
const { initialCharacterState } = await import(await moduleUrl('../src/store/slices/characterSlice.ts'))
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='
const OTHER_PNG = PNG.replace('ScLbt', 'ScLbu')

function state(patch = {}) {
  return { ...initialImageState, ...initialLayoutState, ...initialSignatureState, ...initialCharacterState, ...patch }
}

async function document(patch = {}) {
  return JSON.parse(await serializeProject(state({ images: [PNG], ...patch })))
}

const fileFor = value => new File([JSON.stringify(value)], 'composition.xivframe', { type: 'application/json' })

test('round-trips editable composition and embeds all assets while excluding actions and UI state', async () => {
  const saved = await document({
    logoUrl: PNG, characterSourceUrl: PNG, characterCutoutUrl: PNG,
    imagePositions: [{ x: -48, y: 25 }], imageScales: [1.8], characterPosition: { x: 25, y: 10 },
    characterName: '빛의 전사', canvasRatio: '4:5', fontFamily: 'Ridibatang',
    zoom: 175, isExporting: true, isImageLocked: true, resetAll() {},
  })
  assert.equal(saved.format, 'xiv-frame')
  const imported = validateProjectDocument(saved).composition
  assert.deepEqual(imported.images, [PNG])
  assert.deepEqual(imported.imagePositions, [{ x: -48, y: 25 }])
  assert.deepEqual(imported.imageScales, [1.8])
  assert.equal(imported.logoUrl, PNG)
  assert.equal(imported.characterCutoutUrl, PNG)
  assert.equal(imported.characterName, '빛의 전사')
  assert.equal(imported.canvasRatio, '4:5')
  for (const key of ['zoom', 'isExporting', 'isImageLocked', 'resetAll']) assert.equal(Object.hasOwn(imported, key), false)
})

test('normalizes implicit photo transforms so fresh uploads can be saved', async () => {
  const saved = await document()
  assert.deepEqual(saved.composition.imagePositions, [{ x: 0, y: 0 }])
  assert.deepEqual(saved.composition.imageScales, [1])
})

test('preserves the existing default bitmap font alias in previously saved settings', async () => {
  const saved = await document({ fontFamily: 'Terrarum Sans Bitmap' })
  assert.equal(validateProjectDocument(saved).composition.fontFamily, 'Terrarum Sans Bitmap')
})

test('rejects incompatible versions, malformed settings, transform counts, and unsupported images', async () => {
  const valid = await document()
  assert.throws(() => validateProjectDocument({ ...valid, version: 99 }), error => error instanceof ProjectFileError && error.code === 'version')
  for (const patch of [
    { images: ['https://example.com/private.png'] }, { images: ['blob:foreign'] },
    { images: ['data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='] }, { images: ['data:image/png;base64,broken'] },
    { images: Array(5).fill(PNG) }, { imageScales: [] }, { imageScales: [Infinity] },
    { imagePositions: [{ x: NaN, y: 0 }] }, { canvasRatio: 'free' }, { fontFamily: 'unknown-font' },
    { borderWidth: -1 }, { signatureColor: 'url(https://example.com/)' }, { showCopyright: 'true' },
  ]) {
    assert.throws(() => validateProjectDocument({ ...valid, composition: { ...valid.composition, ...patch } }), ProjectFileError)
  }
})

test('unknown properties cannot overwrite actions or inject prototype keys into state', async () => {
  const valid = await document()
  const imported = validateProjectDocument(JSON.parse(JSON.stringify(valid).replace('"composition":{', '"composition":{"__proto__":{"polluted":true},"applyEdit":"bad","isExporting":true,'))).composition
  assert.equal(Object.hasOwn(imported, '__proto__'), false)
  assert.equal(Object.hasOwn(imported, 'applyEdit'), false)
  assert.equal(Object.hasOwn(imported, 'isExporting'), false)
  assert.equal({}.polluted, undefined)
})

test('rejects oversized files before reading or allocating images', async () => {
  let read = false
  await assert.rejects(prepareProjectImport({ size: MAX_PROJECT_FILE_SIZE + 1, text() { read = true } }), error => error.code === 'too-large')
  assert.equal(read, false)
})

test('invalid JSON and remote asset imports never create images or fetch remote resources', async () => {
  const originalFetch = globalThis.fetch
  let fetches = 0
  globalThis.fetch = () => { fetches += 1; throw new Error('Unexpected network request') }
  try {
    await assert.rejects(prepareProjectImport(new File(['not JSON'], 'broken.xivframe')), ProjectFileError)
    const valid = await document()
    valid.composition.logoUrl = 'https://example.com/track.png'
    await assert.rejects(prepareProjectImport(fileFor(valid)), ProjectFileError)
    assert.equal(fetches, 0)
  } finally {
    globalThis.fetch = originalFetch
  }
})

function mockImageDecode(results) {
  const previousWindow = globalThis.window
  const created = []
  const revoked = []
  const createUrl = URL.createObjectURL
  const revokeUrl = URL.revokeObjectURL
  URL.createObjectURL = blob => { const url = createUrl(blob); created.push(url); return url }
  URL.revokeObjectURL = url => { revoked.push(url); revokeUrl(url) }
  globalThis.window = {
    Image: class {
      naturalWidth = 1
      naturalHeight = 1
      set src(_value) { queueMicrotask(() => results.shift() === false ? this.onerror() : this.onload()) }
    },
  }
  return { created, revoked, restore() { globalThis.window = previousWindow; URL.createObjectURL = createUrl; URL.revokeObjectURL = revokeUrl; created.forEach(revokeUrl) } }
}

test('a late decoding failure revokes every temporary URL and leaves the input composition untouched', async () => {
  const valid = await document({ images: [PNG, OTHER_PNG] })
  const before = JSON.stringify(valid)
  const mocked = mockImageDecode([true, false])
  try {
    await assert.rejects(prepareProjectImport(fileFor(valid)), error => error.code === 'image')
    assert.equal(mocked.created.length, 2)
    assert.deepEqual(new Set(mocked.revoked), new Set(mocked.created))
    assert.equal(JSON.stringify(valid), before)
  } finally { mocked.restore() }
})

test('successful imports prepare local images once, preserve transforms, and transfer ownership to the caller', async () => {
  const valid = await document({ logoUrl: PNG, imageScales: [2.2] })
  const mocked = mockImageDecode([true])
  try {
    const composition = await prepareProjectImport(fileFor(valid))
    assert.ok(composition.images[0].startsWith('blob:'))
    assert.equal(composition.logoUrl, composition.images[0])
    assert.deepEqual(composition.imageScales, [2.2])
    assert.equal(mocked.created.length, 1)
    assert.equal(mocked.revoked.length, 0)
    releasePreparedProject(composition)
    assert.deepEqual(mocked.revoked, mocked.created)
  } finally { mocked.restore() }
})

test('saving blob URLs embeds bytes rather than session addresses and never fetches remote URLs', async () => {
  const originalFileReader = globalThis.FileReader
  globalThis.FileReader = class {
    async readAsDataURL(blob) { this.result = `data:${blob.type};base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`; this.onload() }
  }
  const url = URL.createObjectURL(new Blob([Buffer.from(PNG.split(',')[1], 'base64')], { type: 'image/png' }))
  try {
    const saved = await document({ images: [url] })
    assert.equal(saved.composition.images[0], PNG)
    await assert.rejects(serializeProject(state({ images: ['https://example.com/image.png'] })), error => error.code === 'save')
  } finally { URL.revokeObjectURL(url); globalThis.FileReader = originalFileReader }
})
