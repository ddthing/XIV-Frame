import { StateCreator } from 'zustand'

export type CanvasRatio = 'auto' | '16:9' | '2:1'
export type BackgroundColor = 'white' | 'light-gray' | 'transparent'
export type CopyrightPosition = 'bottom-left' | 'bottom-center' | 'bottom-right'
export type CopyrightColor = 'black' | 'white' | 'gray'
export type ImageTransition = 'none' | 'soft-blend'
export type LayoutPreset = 'split' | 'vertical-split' | 'blend' | 'grid'

export interface LayoutSlice {
  layoutPreset: LayoutPreset
  setLayoutPreset: (preset: LayoutPreset) => void
  canvasRatio: CanvasRatio
  setCanvasRatio: (ratio: CanvasRatio) => void
  backgroundColor: BackgroundColor
  setBackgroundColor: (color: BackgroundColor) => void
  imageGap: number
  setImageGap: (gap: number) => void
  
  imageTransition: ImageTransition
  setImageTransition: (transition: ImageTransition) => void
  blendWidth: number
  setBlendWidth: (width: number) => void
  
  copyrightColor: CopyrightColor
  setCopyrightColor: (color: CopyrightColor) => void
  copyrightPosition: CopyrightPosition
  setCopyrightPosition: (pos: CopyrightPosition) => void
  showCopyright: boolean
  setShowCopyright: (show: boolean) => void

  borderWidth: number
  setBorderWidth: (width: number) => void

  zoom: number
  setZoom: (zoom: number) => void

  grainIntensity: number
  setGrainIntensity: (intensity: number) => void
}

export const initialLayoutState = {
  layoutPreset: 'split' as LayoutPreset,
  canvasRatio: 'auto' as CanvasRatio,
  backgroundColor: 'white' as BackgroundColor,
  imageGap: 24,
  imageTransition: 'none' as ImageTransition,
  blendWidth: 50,
  borderWidth: 0,
  showCopyright: true,
  copyrightColor: 'black' as CopyrightColor,
  copyrightPosition: 'bottom-center' as CopyrightPosition,
  zoom: 100,
  grainIntensity: 0,
}

export const createLayoutSlice: StateCreator<LayoutSlice, [], [], LayoutSlice> = (set) => ({
  ...initialLayoutState,
  
  setLayoutPreset: (preset) => set({ layoutPreset: preset }),
  setCanvasRatio: (ratio) => set({ canvasRatio: ratio }),
  setImageGap: (gap) => set({ imageGap: gap }),
  setImageTransition: (t) => set({ imageTransition: t }),
  setBlendWidth: (w) => set({ blendWidth: w }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setCopyrightPosition: (pos) => set({ copyrightPosition: pos }),
  setCopyrightColor: (color) => set({ copyrightColor: color }),
  setBorderWidth: (width) => set({ borderWidth: width }),
  setShowCopyright: (show) => set({ showCopyright: show }),
  setZoom: (z) => set({ zoom: z }),
  setGrainIntensity: (intensity) => set({ grainIntensity: intensity }),
})
