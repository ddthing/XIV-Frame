import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const sourcePath = path.join(process.cwd(), 'src', 'lib', 'backgroundRemovalErrors.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const errorsModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const cases = [
  [new TypeError('Failed to fetch'), 'model-unavailable'],
  [new Error('HTTP 403 while loading the model'), 'model-unavailable'],
  [new Error('WebAssembly backend is not supported'), 'browser-unsupported'],
  [new Error('Image processing backend is not supported in this browser'), 'browser-unsupported'],
  [new Error('WebAssembly memory allocation failed'), 'image-memory'],
  [new Error('이미지 크기가 올바르지 않습니다.'), 'image-processing'],
  [new Error('배경 제거 Worker 응답 시간이 초과되었습니다.'), 'timeout'],
  [new Error('unexpected failure'), 'unknown'],
]

for (const [error, expected] of cases) {
  assert.equal(errorsModule.getBackgroundRemovalFailureCode(error), expected)
}

const typedError = new errorsModule.BackgroundRemovalError('model-unavailable', 'model unavailable')
assert.equal(errorsModule.getBackgroundRemovalFailureCode(typedError), 'model-unavailable')
assert.equal(errorsModule.toBackgroundRemovalError(new Error('unexpected failure'), 'image-processing').code, 'image-processing')
assert.equal(errorsModule.shouldFallbackFromBackgroundRemovalError(new Error('Failed to fetch')), false)
assert.equal(errorsModule.shouldFallbackFromBackgroundRemovalError(new Error('WebAssembly backend is not supported')), true)

console.log('[background:errors] cause classification passed.')
