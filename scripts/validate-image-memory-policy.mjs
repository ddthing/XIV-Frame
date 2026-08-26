import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const sourcePath = path.join(process.cwd(), 'src', 'lib', 'imageUpload.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const imageUpload = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

assert.equal(typeof imageUpload.getImagePreparationMaxDimension, 'function')
assert.equal(imageUpload.getImagePreparationMaxDimension(0), imageUpload.MAX_CANVAS_IMAGE_DIMENSION)
assert.equal(imageUpload.getImagePreparationMaxDimension(1), imageUpload.MAX_CANVAS_IMAGE_DIMENSION)
assert.equal(imageUpload.getImagePreparationMaxDimension(2), 3072)
assert.equal(imageUpload.getImagePreparationMaxDimension(4), 2048)
assert.equal(imageUpload.getImagePreparationMaxDimension(9), 1536)
assert.equal(imageUpload.getImagePreparationMaxDimension(16), 1536)
assert.equal(imageUpload.getImagePreparationMaxDimension(99), 1536)

console.log('[image-memory:check] preview pixel budget policy passed.')
