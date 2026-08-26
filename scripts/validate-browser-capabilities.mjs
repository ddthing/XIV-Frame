import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const sourcePath = path.join(process.cwd(), 'src', 'lib', 'browserCapabilities.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const browserCapabilities = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const android = {
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36',
  platform: 'Linux armv8l',
  maxTouchPoints: 5,
  deviceMemory: 8,
}
assert.equal(browserCapabilities.isLikelyMobileBrowser(android), true)
assert.equal(browserCapabilities.getImagePreparationConcurrency(android), 1)
assert.equal(browserCapabilities.getImagePreparationConcurrency({ ...android, hardwareConcurrency: 8 }), 2)

const iphone = {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  platform: 'iPhone',
  maxTouchPoints: 5,
  deviceMemory: 4,
}
assert.equal(browserCapabilities.isLikelyMobileBrowser(iphone), true)
assert.equal(browserCapabilities.getImagePreparationConcurrency(iphone), 1)
assert.equal(browserCapabilities.getImagePreparationConcurrency({ ...iphone, hardwareConcurrency: 6 }), 2)
assert.equal(browserCapabilities.getImagePreparationConcurrency({ ...iphone, deviceMemory: 2, hardwareConcurrency: 8 }), 1)

const desktop = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
  platform: 'Win32',
  maxTouchPoints: 0,
}
assert.equal(browserCapabilities.isLikelyMobileBrowser(desktop), false)
assert.equal(browserCapabilities.getImagePreparationConcurrency(desktop), 2)

assert.equal(browserCapabilities.getImagePreparationConcurrency({ ...desktop, deviceMemory: 2 }), 1)
assert.equal(browserCapabilities.getImagePreparationConcurrency({ ...desktop, deviceMemory: 8 }), 2)
assert.equal(browserCapabilities.getImagePreparationConcurrency({
  ...desktop,
  platform: 'MacIntel',
  maxTouchPoints: 2,
}), 1)
assert.equal(browserCapabilities.getImagePreparationConcurrency(undefined), 2)

assert.equal(browserCapabilities.getExportMaxDimension(iphone), 3072)
assert.equal(browserCapabilities.getExportMaxDimension({ ...desktop, deviceMemory: 2 }), 3072)
assert.equal(browserCapabilities.getExportMaxDimension(desktop), 4096)
assert.equal(browserCapabilities.getExportMaxDimension(undefined), 4096)

assert.equal(browserCapabilities.getWasmThreadCount({ ...desktop, crossOriginIsolated: false, hardwareConcurrency: 16 }), 1)
assert.equal(browserCapabilities.getWasmThreadCount({ ...desktop, crossOriginIsolated: true, hardwareConcurrency: 16 }), 4)
assert.equal(browserCapabilities.getWasmThreadCount({ ...android, crossOriginIsolated: true, hardwareConcurrency: 8 }), 2)
assert.equal(browserCapabilities.getWasmThreadCount(undefined), 1)
assert.deepEqual(browserCapabilities.getWasmAssetPaths({ ...desktop, crossOriginIsolated: false }), {
  mjs: '/vendor/onnxruntime/ort-wasm-simd-threaded.asyncify.mjs',
  wasm: '/vendor/onnxruntime/ort-wasm-simd-threaded.asyncify.wasm',
})
assert.deepEqual(browserCapabilities.getWasmAssetPaths({ ...desktop, crossOriginIsolated: true, hardwareConcurrency: 16 }), {
  mjs: '/vendor/onnxruntime/ort-wasm-simd-threaded.mjs',
  wasm: '/vendor/onnxruntime/ort-wasm-simd-threaded.wasm',
})

console.log('[device:check] browser capability policy passed.')
