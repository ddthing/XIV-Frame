import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const sourcePath = path.join(process.cwd(), 'src', 'lib', 'deferredStorage.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const storageModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const writes = []
const removed = []
const storage = {
  getItem: () => null,
  setItem: (name, value) => writes.push([name, value]),
  removeItem: (name) => removed.push(name),
}
let scheduledCallback = null
let scheduleCount = 0
const deferred = storageModule.createDeferredStorage(
  storage,
  200,
  (callback) => {
    scheduleCount += 1
    scheduledCallback = callback
    return scheduleCount
  },
  () => undefined,
)

deferred.setItem('settings', 'first')
deferred.setItem('settings', 'latest')
assert.deepEqual(writes, [])
assert.equal(scheduleCount, 1)
deferred.flush()
assert.deepEqual(writes, [['settings', 'latest']])

deferred.setItem('settings', 'scheduled')
assert.equal(typeof scheduledCallback, 'function')
scheduledCallback()
assert.deepEqual(writes, [['settings', 'latest'], ['settings', 'scheduled']])

deferred.setItem('settings', 'before-remove')
deferred.removeItem('settings')
assert.deepEqual(writes, [['settings', 'latest'], ['settings', 'scheduled'], ['settings', 'before-remove']])
assert.deepEqual(removed, ['settings'])

console.log('[storage:check] deferred settings persistence passed.')
