import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourcePath = path.join(root, 'src', 'lib', 'backgroundRemoval.ts')
const workerPath = path.join(root, 'src', 'lib', 'backgroundRemoval.worker.js')
const capabilitiesPath = path.join(root, 'src', 'lib', 'browserCapabilities.ts')
const syncPath = path.join(root, 'scripts', 'sync-transformers-worker.mjs')
const assetRoot = path.join(root, 'public', 'vendor', 'onnxruntime')
const requiredAssets = [
  'ort-wasm-simd-threaded.asyncify.mjs',
  'ort-wasm-simd-threaded.asyncify.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
]
const errors = []

function readSource(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function fail(message) {
  errors.push(`[wasm:check] ${message}`)
}

const source = readSource(sourcePath)
const workerSource = readSource(workerPath)
const capabilitiesSource = readSource(capabilitiesPath)
const syncSource = readSource(syncPath)

if (!capabilitiesSource.includes('export function getWasmAssetPaths')) {
  fail('Browser capability policy must expose the local WebAssembly asset paths.')
}

if (!source.includes('env.backends.onnx.wasm.wasmPaths = getWasmAssetPaths()')) {
  fail('Main-thread background removal must configure local ONNX Runtime assets.')
}

if (!workerSource.includes('env.backends.onnx.wasm.wasmPaths = getWasmAssetPaths(wasmThreadCount)')) {
  fail('Background-removal Worker must configure local ONNX Runtime assets.')
}

for (const fileName of requiredAssets) {
  if (!syncSource.includes(`'${fileName}'`)) {
    fail(`Worker sync script is missing ${fileName}.`)
  }

  const assetPath = path.join(assetRoot, fileName)
  if (!fs.existsSync(assetPath)) {
    fail(`Generated runtime asset is missing: public/vendor/onnxruntime/${fileName}`)
    continue
  }
  if (fs.statSync(assetPath).size === 0) fail(`Generated runtime asset is empty: ${fileName}`)
}

if (errors.length > 0) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
} else {
  console.log(`[wasm:check] ${requiredAssets.length} local ONNX Runtime assets passed.`)
}
