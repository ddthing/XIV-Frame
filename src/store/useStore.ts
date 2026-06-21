import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ImageSlice, createImageSlice, initialImageState } from './slices/imageSlice'
import { LayoutSlice, createLayoutSlice, initialLayoutState, CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor } from './slices/layoutSlice'
import { SignatureSlice, createSignatureSlice, initialSignatureState, SignaturePosition, SignatureAlign } from './slices/signatureSlice'

// Re-export types so we don't break existing imports
export type { CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor, SignaturePosition, SignatureAlign }

export interface AppState extends ImageSlice, LayoutSlice, SignatureSlice {
  resetAll: () => void
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
