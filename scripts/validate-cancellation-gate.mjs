import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import * as ts from 'typescript'

const sourcePath = path.join(process.cwd(), 'src', 'lib', 'cancellationGate.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const cancellationModule = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

const hub = cancellationModule.createCancellationHub()
const gate = hub.begin()
const pending = Promise.race([
  new Promise((resolve) => setTimeout(() => resolve('stale result'), 50)),
  gate.promise,
])

hub.cancel()
await assert.rejects(pending, { name: 'AbortError' })
assert.equal(gate.isCancelled(), true)
gate.dispose()

const nextGate = hub.begin()
assert.equal(nextGate.isCancelled(), false)
nextGate.dispose()

console.log('[cancellation:check] fallback cancellation gate passed.')
