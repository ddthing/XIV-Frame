'use client'

import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

export function useEditorShortcuts(onToggleFocus: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return
      const target = event.target as HTMLElement | null
      const editing = target?.closest('input:not([type="range"]), textarea, select, [contenteditable="true"]')
      const adjusting = target?.closest('[role="slider"], [role="spinbutton"], input[type="range"]')
      if (document.querySelector('dialog[open], [role="dialog"][data-open], [role="dialog"][data-state="open"], [role="alertdialog"]')) return
      const modifier = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()
      const store = useStore.getState()
      if (modifier && key === 's') {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent(event.shiftKey ? 'xiv-frame:open-export' : 'xiv-frame:save-project'))
        return
      }
      if (editing || event.altKey || store.isExporting) return
      if (modifier && (key === 'z' || key === 'y')) {
        event.preventDefault()
        if (key === 'y' || event.shiftKey) store.redo()
        else store.undo()
        return
      }
      if (modifier || event.shiftKey || event.repeat || adjusting) return
      const step = ({ '1': 'layout', '2': 'image', '3': 'signature' } as Record<string, string>)[key]
      if (step) {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent(`xiv-frame:open-${step}`))
      } else if (key === 'f' && window.matchMedia('(min-width: 768px)').matches) {
        event.preventDefault()
        onToggleFocus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggleFocus])
}
