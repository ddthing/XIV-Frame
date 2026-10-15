import { StateCreator } from 'zustand'

export type CanvasRatio = 'auto' | '16:9' | '2:1' | '1:1' | '4:5' | '9:16'
export type BackgroundColor = 'white' | 'light-gray' | 'transparent'
export type CopyrightPosition = 'bottom-left' | 'bottom-center' | 'bottom-right'
export type CopyrightColor = 'black' | 'white' | 'gray'
export type ImageTransition = 'none' | 'soft-blend'
export type LayoutPreset = 'split' | 'vertical-split' | 'grid'

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
  showGuides: boolean
  setShowGuides: (show: boolean) => void
  exportFormat: 'png' | 'jpeg'
  exportSize: 'original' | 2048 | 4096
  exportFilename: string
  setExportPreferences: (preferences: Partial<Pick<LayoutSlice, 'exportFormat' | 'exportSize' | 'exportFilename'>>) => void

  grainIntensity: number
  setGrainIntensity: (intensity: number) => void

  isExporting: boolean
  setIsExporting: (isExporting: boolean) => void
  isCanvasLoading: boolean
  setIsCanvasLoading: (isCanvasLoading: boolean) => void
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
  showGuides: false,
  exportFormat: 'png' as const,
  exportSize: 4096 as const,
  exportFilename: 'xiv-frame',
  grainIntensity: 0,
  isExporting: false,
  isCanvasLoading: true,
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
  setShowGuides: (showGuides) => set({ showGuides }),
  setExportPreferences: (preferences) => set(preferences),
  setGrainIntensity: (intensity) => set({ grainIntensity: intensity }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setIsCanvasLoading: (isCanvasLoading) => set({ isCanvasLoading }),
})
