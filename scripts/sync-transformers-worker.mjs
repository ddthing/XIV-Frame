import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const sourcePath = resolve('node_modules/@huggingface/transformers/dist/transformers.web.min.js')
const targetPath = resolve('public/vendor/transformers.web.min.js')
const onnxRuntimeSourceDir = resolve('node_modules/onnxruntime-web/dist')
const onnxRuntimeTargetDir = resolve('public/vendor/onnxruntime')
const onnxRuntimeFiles = [
  'ort-wasm-simd-threaded.asyncify.mjs',
  'ort-wasm-simd-threaded.asyncify.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
]

mkdirSync(dirname(targetPath), { recursive: true })
copyFileSync(sourcePath, targetPath)
mkdirSync(onnxRuntimeTargetDir, { recursive: true })
for (const fileName of onnxRuntimeFiles) {
  copyFileSync(resolve(onnxRuntimeSourceDir, fileName), resolve(onnxRuntimeTargetDir, fileName))
}
console.log('Synced Transformers.js worker bundle and local ONNX Runtime WebAssembly assets.')
