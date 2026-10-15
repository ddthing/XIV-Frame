'use client'

import { useShallow } from 'zustand/react/shallow'
import { useStore } from '@/store/useStore'

/** Shared undo controls for desktop, mobile, and keyboard shortcuts. */
export function useEditorHistory() {
  return useStore(useShallow(state => ({
    canUndo: state.canUndo,
    canRedo: state.canRedo,
    undo: state.undo,
    redo: state.redo,
  })))
}
