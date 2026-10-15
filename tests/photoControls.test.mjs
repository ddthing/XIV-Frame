import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const state = {
  images: ['photo-1.png', 'photo-2.png', 'photo-3.png', 'photo-4.png'],
  imagePositions: [], imageScales: [], isImageLocked: false,
}
const wrapper = ({children}) => React.createElement('div', null, children)
const mocks = {
  'next-intl': { useTranslations: () => key => key },
  'zustand/react/shallow': { useShallow: selector => selector },
  '@/store/useStore': { useStore: selector => selector(state) },
  '@/components/ui/button': { Button: ({children,...props}) => React.createElement('button', props, children) },
  '@/components/ui/accordion': { Accordion: wrapper, AccordionContent: wrapper, AccordionItem: wrapper, AccordionTrigger: wrapper },
  '@/components/ui/editor': { EditorFieldHeader: () => null, EditorSection: wrapper },
  '@/components/ui/input': { Input: props => React.createElement('input', props) },
  '@/components/ui/slider': { Slider: () => null },
  '@/components/ui/switch': { Switch: () => null },
  '@/lib/imageUpload': {},
  './LazySettings': { LazyCharacterSettings: () => null },
}
const source = fs.readFileSync(new URL('../src/components/sidebar/ImageUploader.tsx', import.meta.url), 'utf8')
const {outputText} = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
})
const exports = {}
vm.runInNewContext(outputText, { exports, require: id => id in mocks ? mocks[id] : require(id) })

test('unselected photos cannot intercept selection through hidden move or delete buttons', () => {
  const html = renderToStaticMarkup(React.createElement(exports.ImageUploader))
  assert.equal((html.match(/aria-label="selectImage \d"/g) || []).length, 4)
  assert.equal((html.match(/aria-label="deleteImage"/g) || []).length, 1)
  assert.equal((html.match(/aria-label="moveNext"/g) || []).length, 1)
  assert.equal((html.match(/aria-label="movePrevious"/g) || []).length, 0)
})
