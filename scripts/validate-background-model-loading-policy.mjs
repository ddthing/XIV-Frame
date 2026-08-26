import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const sourcePath = path.join(process.cwd(), 'src', 'components', 'sidebar', 'signature', 'CharacterSettings.tsx')
const source = fs.readFileSync(sourcePath, 'utf8')
const fileChangeStart = source.indexOf('const handleFileChange')
const removeBackgroundStart = source.indexOf('const handleRemoveBackground')
const fileChangeSource = source.slice(fileChangeStart, removeBackgroundStart)
const removeBackgroundSource = source.slice(removeBackgroundStart)

assert.ok(fileChangeStart >= 0)
assert.ok(removeBackgroundStart > fileChangeStart)
assert.equal(fileChangeSource.includes('startModelWarmup'), false)
assert.equal(fileChangeSource.includes('warmBackgroundRemovalModel'), false)
assert.match(removeBackgroundSource, /removeImageBackground\(blob/)

console.log('[background:model-policy] model loading is deferred until explicit removal.')
