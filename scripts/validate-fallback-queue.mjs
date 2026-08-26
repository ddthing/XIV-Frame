import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const sourcePath = path.join(process.cwd(), 'src', 'lib', 'serialTaskQueue.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const queueModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const queue = queueModule.createSerialTaskQueue()
let releaseFirst
let firstStarted = false
let secondStarted = false

const first = queue.run(() => {
  firstStarted = true
  return new Promise((resolve) => { releaseFirst = resolve })
})
const second = queue.run(async () => {
  secondStarted = true
  return 'second'
})

await new Promise((resolve) => setTimeout(resolve, 0))
assert.equal(firstStarted, true)
assert.equal(secondStarted, false)
releaseFirst('first')
assert.equal(await first, 'first')
assert.equal(await second, 'second')
assert.equal(secondStarted, true)

let allowQueuedTask = false
let queuedTaskStarted = false
const blocking = queue.run(() => new Promise((resolve) => setTimeout(resolve, 10)))
const queued = queue.run(async () => {
  queuedTaskStarted = true
}, () => allowQueuedTask)
await blocking
await assert.rejects(queued)
assert.equal(queuedTaskStarted, false)

await assert.rejects(queue.run(async () => {
  throw new Error('expected failure')
}))
assert.equal(await queue.run(async () => 'after failure'), 'after failure')

console.log('[fallback:check] serialized fallback queue passed.')
