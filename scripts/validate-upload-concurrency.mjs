import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const sourcePath = path.join(process.cwd(), 'src', 'lib', 'asyncPool.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const poolModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

let activeTasks = 0
let peakTasks = 0
const results = await poolModule.settleWithConcurrency(
  Array.from({ length: 8 }, (_, index) => index),
  async (value) => {
    activeTasks += 1
    peakTasks = Math.max(peakTasks, activeTasks)
    await new Promise((resolve) => setTimeout(resolve, value === 0 ? 8 : 1))
    activeTasks -= 1
    if (value === 3) throw new Error('expected task failure')
    return value * 2
  },
  2,
)

assert.equal(peakTasks, 2)
assert.deepEqual(results.map((result) => result.status), [
  'fulfilled', 'fulfilled', 'fulfilled', 'rejected',
  'fulfilled', 'fulfilled', 'fulfilled', 'fulfilled',
])
assert.deepEqual(results.filter((result) => result.status === 'fulfilled').map((result) => result.value), [0, 2, 4, 8, 10, 12, 14])

let startedAfterCancel = 0
const cancelledResults = await poolModule.settleWithConcurrency(
  [1, 2, 3, 4],
  async (value) => {
    startedAfterCancel += 1
    return value
  },
  2,
  () => false,
)

assert.equal(startedAfterCancel, 0)
assert.equal(cancelledResults.every((result) => result.status === 'rejected'), true)

console.log('[upload:check] bounded preparation concurrency passed.')
