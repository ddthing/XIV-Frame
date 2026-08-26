import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const sourcePath = path.join(process.cwd(), 'src', 'lib', 'idleResourceCache.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const cacheModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
let factoryCount = 0
let disposeCount = 0
const cache = cacheModule.createIdleResourceCache(async () => {
  factoryCount += 1
  return {
    dispose: async () => {
      disposeCount += 1
    },
  }
}, { idleMs: 0 })

await cache.use(() => 'first')
cache.scheduleDispose()
await tick()
assert.equal(disposeCount, 1)

await cache.use(() => 'after-dispose')
assert.equal(factoryCount, 2)

let releaseActive
const active = cache.use(() => new Promise((resolve) => { releaseActive = resolve }))
cache.scheduleDispose()
await tick()
assert.equal(disposeCount, 1)
releaseActive('released')
await active
await tick()
assert.equal(disposeCount, 2)

await cache.use(() => 'cached')
cache.scheduleDispose()
await cache.use(() => 'reuse-before-idle')
await tick()
assert.equal(disposeCount, 2)
assert.equal(factoryCount, 3)

let resolvePendingFactory
let pendingDisposeCount = 0
const pendingCache = cacheModule.createIdleResourceCache(
  () => new Promise((resolve) => { resolvePendingFactory = resolve }),
  { idleMs: 0 },
)
const pendingUse = pendingCache.use(() => 'pending')
pendingCache.scheduleDispose()
await tick()
assert.equal(pendingDisposeCount, 0)
resolvePendingFactory({ dispose: () => { pendingDisposeCount += 1 } })
assert.equal(await pendingUse, 'pending')
await tick()
assert.equal(pendingDisposeCount, 1)

console.log('[pipeline-cache:check] idle resource cache passed.')
