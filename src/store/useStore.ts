import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

import { ImageSlice, createImageSlice, initialImageState } from './slices/imageSlice'
import { LayoutSlice, createLayoutSlice, initialLayoutState, CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor, LayoutPreset } from './slices/layoutSlice'
import { SignatureSlice, createSignatureSlice, initialSignatureState, SignaturePosition, SignatureAlign } from './slices/signatureSlice'
import { CharacterSlice, createCharacterSlice, initialCharacterState } from './slices/characterSlice'
import { captureEditorSnapshot, createEditorHistory, type EditorSnapshot } from './history'

// Re-export types so we don't break existing imports
export type { CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor, LayoutPreset, SignaturePosition, SignatureAlign }

export interface AppState extends ImageSlice, LayoutSlice, SignatureSlice, CharacterSlice {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  clearHistory: () => void
  applyEdit: (patch: Partial<EditorSnapshot>) => void
  resetAll: () => void
}

type PersistedAppState = Omit<Partial<AppState>, 'layoutPreset' | 'imageTransition' | 'canvasRatio'> & {
  layoutPreset?: string
  imageTransition?: string
  canvasRatio?: string
}

// Keep edits usable in private browsing and when a large legacy logo fills the
// browser quota. The current Zustand state remains available for the session;
// persistence is best-effort and existing stored settings are read unchanged.
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(name, value)
    } catch {
      // Do not let a storage quota error break text or logo controls.
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(name)
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
  },
}

export const useStore = create<AppState>()(
  persist(
    (set, get, api) => {
      const history = createEditorHistory()
      const setWithHistory: typeof set = (partial, replace) => {
        const current = get()
        const update = typeof partial === 'function' ? partial(current) : partial
        if (update === current) return
        const next = { ...current, ...update }
        history.record(captureEditorSnapshot(current), captureEditorSnapshot(next))
        if (replace) set({ ...next, ...history.status() }, true)
        else set({ ...update, ...history.status() })
      }

      const applyEdit = (patch: Partial<EditorSnapshot>) => {
        history.finishGroup()
        setWithHistory(patch)
        history.finishGroup()
      }

      return {
        ...createImageSlice(setWithHistory, get, api),
        ...createLayoutSlice(setWithHistory, get, api),
        ...createSignatureSlice(setWithHistory, get, api),
        ...createCharacterSlice(setWithHistory, get, api),
        ...history.status(),
        applyEdit,
        undo: () => {
          const previous = history.undo(captureEditorSnapshot(get()))
          if (previous) set({ ...previous, ...history.status() })
        },
        redo: () => {
          const next = history.redo(captureEditorSnapshot(get()))
          if (next) set({ ...next, ...history.status() })
        },
        clearHistory: () => {
          history.clear(captureEditorSnapshot(get()))
          set(history.status())
        },
        resetAll: () => {
          history.finishGroup()
          setWithHistory({
            ...initialImageState,
            ...initialLayoutState,
            ...initialSignatureState,
            ...initialCharacterState,
            // A reset also invalidates pending uploads from the initially empty
            // canvas, whose request guards compare the image collection.
            images: [],
            imagePositions: [],
            imageScales: [],
          })
          history.finishGroup()
        },
      }
    },
    {
      name: 'xiv-frame-settings-v2',
      storage: createJSONStorage(() => safeLocalStorage),
      version: 4, // Normalize legacy layout values and preserve new canvas ratios.
      migrate: (persistedState: unknown) => {
        const state: PersistedAppState = persistedState && typeof persistedState === 'object'
          ? { ...(persistedState as PersistedAppState) }
          : {}

        // Migrate legacy 'blend' preset
        if (state.layoutPreset === 'blend') {
          state.layoutPreset = 'split'
          state.imageTransition = 'soft-blend'
        }

        if (!['split', 'vertical-split', 'grid'].includes(state.layoutPreset ?? '')) {
          state.layoutPreset = 'split'
        }

        if (!['none', 'soft-blend'].includes(state.imageTransition ?? '')) {
          state.imageTransition = 'none'
        }

        // Older builds persisted 'original', which is no longer a supported ratio.
        if (!['auto', '16:9', '2:1', '1:1', '4:5', '9:16'].includes(state.canvasRatio ?? '')) {
          state.canvasRatio = 'auto'
        }

        return state as AppState
      },
      partialize: (state) => {
        // Exclude ephemeral and non-serializable state from persistence
        // Note: logoUrl is NOT excluded, allowing the Base64 string to persist
        const persistedState = { ...state } as Partial<AppState> & Record<string, unknown>
        delete persistedState.images
        delete persistedState.imagePositions
        delete persistedState.imageScales
        delete persistedState.isImageLocked
        delete persistedState.isExporting
        delete persistedState.isCanvasLoading
        delete persistedState.canUndo
        delete persistedState.canRedo
        delete persistedState.characterSourceUrl
        delete persistedState.characterCutoutUrl
        if (persistedState.logoUrl?.startsWith('blob:')) delete persistedState.logoUrl
        return persistedState
      }
    }
  )
)
