import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const sourcePath = path.join(process.cwd(), 'src', 'lib', 'characterPixels.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const pixelModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const input = new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8])
const { original, working } = pixelModule.createEditablePixelState(input, 2, 1)

assert.strictEqual(original.data, input)
assert.notStrictEqual(working.data, input)
working.data[0] = 99
assert.equal(original.data[0], 1)
assert.deepEqual(original, { data: input, width: 2, height: 1 })
assert.deepEqual(working, { data: new Uint8ClampedArray([99, 2, 3, 4, 5, 6, 7, 8]), width: 2, height: 1 })

console.log('[character:check] editable mask buffer ownership passed.')
