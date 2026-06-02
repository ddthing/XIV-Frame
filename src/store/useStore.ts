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
      
      resetAll: () => set({
        ...initialImageState,
        ...initialLayoutState,
        ...initialSignatureState,
      }),
    }),
    {
      name: 'xiv-frame-settings',
      partialize: (state) => {
        // Exclude ephemeral and non-serializable state from persistence
        const { images, imagePositions, imageScales, isImageLocked, logoUrl, ...rest } = state
        return rest
      }
    }
  )
)
