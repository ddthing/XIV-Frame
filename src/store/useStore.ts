import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

import { ImageSlice, createImageSlice, initialImageState } from './slices/imageSlice'
import { LayoutSlice, createLayoutSlice, initialLayoutState, CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor } from './slices/layoutSlice'
import { SignatureSlice, createSignatureSlice, initialSignatureState, SignaturePosition, SignatureAlign } from './slices/signatureSlice'
import { CharacterSlice, createCharacterSlice, initialCharacterState } from './slices/characterSlice'
import { revokeObjectUrl } from '@/lib/imageUpload'

// Re-export types so we don't break existing imports
export type { CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor, SignaturePosition, SignatureAlign }

export interface AppState extends ImageSlice, LayoutSlice, SignatureSlice, CharacterSlice {
  resetAll: () => void
}

type PersistedAppState = Omit<Partial<AppState>, 'layoutPreset' | 'imageTransition'> & {
  layoutPreset?: string
  imageTransition?: string
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
    (set, get, api) => ({
      ...createImageSlice(set, get, api),
      ...createLayoutSlice(set, get, api),
      ...createSignatureSlice(set, get, api),
      ...createCharacterSlice(set, get, api),
      
      resetAll: () => {
        // Revoke all existing blob URLs before resetting
        get().images.forEach(revokeObjectUrl)
        set({
          ...initialImageState,
          ...initialLayoutState,
          ...initialSignatureState,
          ...initialCharacterState,
        })
      },
    }),
    {
      name: 'xiv-frame-settings-v2',
      storage: createJSONStorage(() => safeLocalStorage),
      version: 2, // Bump version to 2 for layoutPreset migration
      migrate: (persistedState: unknown) => {
        const state: PersistedAppState = persistedState && typeof persistedState === 'object'
          ? { ...(persistedState as PersistedAppState) }
          : {}
        
        // Migrate legacy 'blend' preset
        if (state.layoutPreset === 'blend') {
          state.layoutPreset = 'split'
          state.imageTransition = 'soft-blend'
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
        delete persistedState.characterSourceUrl
        delete persistedState.characterCutoutUrl
        return persistedState
      }
    }
  )
)
