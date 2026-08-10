import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

import { ImageSlice, createImageSlice, initialImageState } from './slices/imageSlice'
import { LayoutSlice, createLayoutSlice, initialLayoutState, CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor } from './slices/layoutSlice'
import { SignatureSlice, createSignatureSlice, initialSignatureState, SignaturePosition, SignatureAlign } from './slices/signatureSlice'

// Re-export types so we don't break existing imports
export type { CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor, SignaturePosition, SignatureAlign }

export interface AppState extends ImageSlice, LayoutSlice, SignatureSlice {
  resetAll: () => void
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
      
      resetAll: () => {
        // Revoke all existing blob URLs before resetting
        get().images.forEach(url => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url)
          }
        })
        set({
          ...initialImageState,
          ...initialLayoutState,
          ...initialSignatureState,
        })
      },
    }),
    {
      name: 'xiv-frame-settings-v2',
      storage: createJSONStorage(() => safeLocalStorage),
      version: 2, // Bump version to 2 for layoutPreset migration
      migrate: (persistedState: any, version: number) => {
        let state = { ...persistedState }
        
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
        const { images, imagePositions, imageScales, isImageLocked, ...rest } = state
        return rest
      }
    }
  )
)
