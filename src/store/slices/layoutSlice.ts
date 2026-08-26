import { StateCreator } from 'zustand'
import type { LayoutPreset } from '@/lib/layoutTemplates'
import { DEFAULT_IMAGE_SHAPE, type ImageShape } from '@/lib/imageShapes'

export type { LayoutPreset } from '@/lib/layoutTemplates'
export type { ImageShape } from '@/lib/imageShapes'

/**
 * The named profiles make the export intent explicit in the UI. `original`
 * preserves the natural composition by default; `x` is the timeline profile.
 */
export type CanvasRatio = 'x' | 'original' | '2:1'
export type BackgroundColor = 'white' | 'black' | 'light-gray' | 'transparent' | 'custom'
export type CopyrightPosition = 'bottom-left' | 'bottom-center' | 'bottom-right'
export type CopyrightColor = 'black' | 'white' | 'gray'
export type ImageTransition = 'none' | 'soft-blend'

export interface LayoutSlice {
  layoutPreset: LayoutPreset
  hasChosenLayout: boolean
  setLayoutPreset: (preset: LayoutPreset) => void
  canvasRatio: CanvasRatio
  setCanvasRatio: (ratio: CanvasRatio) => void
  backgroundColor: BackgroundColor
  setBackgroundColor: (color: BackgroundColor) => void
  customBackgroundColor: string
  setCustomBackgroundColor: (color: string) => void
  imageGap: number
  setImageGap: (gap: number) => void
  imageShape: ImageShape
  setImageShape: (shape: ImageShape) => void
  
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

  isExporting: boolean
  setIsExporting: (isExporting: boolean) => void
}

export const initialLayoutState = {
  layoutPreset: 'split' as LayoutPreset,
  hasChosenLayout: false,
  canvasRatio: 'original' as CanvasRatio,
  backgroundColor: 'white' as BackgroundColor,
  customBackgroundColor: '#e6e8e4',
  imageGap: 24,
  imageShape: DEFAULT_IMAGE_SHAPE,
  imageTransition: 'none' as ImageTransition,
  blendWidth: 50,
  borderWidth: 0,
  showCopyright: true,
  copyrightColor: 'black' as CopyrightColor,
  copyrightPosition: 'bottom-center' as CopyrightPosition,
  zoom: 100,
  grainIntensity: 0,
  isExporting: false,
}

export const createLayoutSlice: StateCreator<LayoutSlice, [], [], LayoutSlice> = (set) => ({
  ...initialLayoutState,
  
  setLayoutPreset: (preset) => set({ layoutPreset: preset, hasChosenLayout: true }),
  setCanvasRatio: (ratio) => set({ canvasRatio: ratio }),
  setImageGap: (gap) => set({ imageGap: gap }),
  setImageShape: (shape) => set({ imageShape: shape }),
  setImageTransition: (t) => set({ imageTransition: t }),
  setBlendWidth: (w) => set({ blendWidth: w }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setCustomBackgroundColor: (color) => set({ customBackgroundColor: color }),
  setCopyrightPosition: (pos) => set({ copyrightPosition: pos }),
  setCopyrightColor: (color) => set({ copyrightColor: color }),
  setBorderWidth: (width) => set({ borderWidth: width }),
  setShowCopyright: (show) => set({ showCopyright: show }),
  setZoom: (z) => set({ zoom: z }),
  setGrainIntensity: (intensity) => set({ grainIntensity: intensity }),
  setIsExporting: (isExporting) => set({ isExporting }),
})
