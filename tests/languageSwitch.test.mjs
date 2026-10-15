import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const require = createRequire(import.meta.url)
let onValueChange
let changeEditorLocale
let pathname = '/'
const navigations = []
const wrapper = ({children}) => React.createElement('div', null, children)
const mocks = {
  'next/navigation': { usePathname: () => pathname, useRouter: () => ({push: path => navigations.push(path)}) },
  'next-intl': { useLocale: () => 'ko', useTranslations: () => key => key },
  './EditorLocaleProvider': { useEditorLocaleChange: () => changeEditorLocale },
  '@/lib/utils': { cn: (...args) => args.filter(Boolean).join(' ') },
  '@/components/ui/select': {
    Select: ({children, onValueChange: change}) => {onValueChange = change; return wrapper({children})},
    SelectContent: wrapper, SelectItem: wrapper, SelectTrigger: wrapper, SelectValue: wrapper,
  },
}
const source = fs.readFileSync(new URL('../src/components/LanguageSwitcher.tsx', import.meta.url), 'utf8')
const {outputText} = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
})
const exports = {}
vm.runInNewContext(outputText, { exports, require: id => id in mocks ? mocks[id] : require(id), localStorage: {setItem() {}} })

test('editor language changes update the mounted editor without route navigation', () => {
  const changes = []
  navigations.length = 0
  changeEditorLocale = locale => changes.push(locale)
  renderToStaticMarkup(React.createElement(exports.LanguageSwitcher))
  onValueChange('en')
  onValueChange('ja')
  assert.deepEqual(changes, ['en', 'ja'])
  assert.deepEqual(navigations, [])
})

test('document pages retain their localized navigation outside the editor', () => {
  changeEditorLocale = null
  navigations.length = 0
  pathname = '/ko/about'
  renderToStaticMarkup(React.createElement(exports.LanguageSwitcher))
  onValueChange('en')
  assert.deepEqual(navigations, ['/en/about'])
})
