import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const source = fs.readFileSync(new URL('../src/constants/signature.tsx', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText
const exports = {}
vm.runInNewContext(compiled, { exports, require })
const css = fs.readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8')
const registeredFonts = new Set([...css.matchAll(/@font-face\s*\{\s*font-family:\s*'([^']+)'/g)].map(match => match[1]))

test('every selectable signature font resolves to a registered font face', () => {
  for (const font of Object.keys(exports.FONT_MAP)) {
    assert.ok(registeredFonts.has(exports.resolveSignatureFont(font)), `${font} would silently fall back`)
  }
})

test('every selected font label is translated in all editor languages', () => {
  for (const locale of ['ko', 'en', 'ja']) {
    const messages = JSON.parse(fs.readFileSync(new URL(`../src/messages/${locale}.json`, import.meta.url), 'utf8'))
    for (const key of Object.values(exports.FONT_MAP)) {
      assert.ok(messages.SignatureSettings[key], `${locale}: missing ${key}`)
    }
  }
})
