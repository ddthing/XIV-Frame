import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const sourcePath = resolve('node_modules/@huggingface/transformers/dist/transformers.web.min.js')
const targetPath = resolve('public/vendor/transformers.web.min.js')

mkdirSync(dirname(targetPath), { recursive: true })
copyFileSync(sourcePath, targetPath)
console.log('Synced Transformers.js worker bundle.')
