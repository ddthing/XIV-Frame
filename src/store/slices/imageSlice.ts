import { StateCreator } from 'zustand'

export interface ImageSlice {
  images: string[]
  setImages: (images: string[]) => void
  imagePositions: { x: number; y: number }[]
  setImagePosition: (index: number, pos: { x: number; y: number }) => void
  imageScales: number[]
  setImageScale: (index: number, scale: number) => void
  setImageAt: (index: number, url: string) => void
  removeImageAt: (index: number) => void
  swapImages: (idx1: number, idx2: number) => void
  isImageLocked: boolean
  setIsImageLocked: (locked: boolean) => void
}

export const initialImageState = {
  images: [],
  imagePositions: [],
  imageScales: [],
  isImageLocked: false,
}

export const createImageSlice: StateCreator<ImageSlice, [], [], ImageSlice> = (set, get) => ({
  ...initialImageState,
  
  setImages: (images) => set({ 
    images,
    imagePositions: images.map((_, i) => get().imagePositions[i] || { x: 0, y: 0 }),
    imageScales: images.map((_, i) => get().imageScales[i] || 1)
  }),
  
  setImagePosition: (index, pos) => set((state) => {
    const newPositions = [...state.imagePositions]
    newPositions[index] = pos
    return { imagePositions: newPositions }
  }),

  setImageScale: (index, scale) => set((state) => {
    const newScales = [...state.imageScales]
    newScales[index] = scale
    return { imageScales: newScales }
  }),
  
  setImageAt: (index, url) => set((state) => {
    const newImages = [...state.images]
    newImages[index] = url
    return { images: newImages }
  }),
  
  removeImageAt: (index) => set((state) => {
    const newImages = [...state.images]
    newImages.splice(index, 1)
    const newPositions = [...state.imagePositions]
    newPositions.splice(index, 1)
    const newScales = [...state.imageScales]
    newScales.splice(index, 1)
    return { images: newImages, imagePositions: newPositions, imageScales: newScales }
  }),
  
  swapImages: (idx1, idx2) => set((state) => {
    const newImages = [...state.images]
    const temp = newImages[idx1]
    newImages[idx1] = newImages[idx2]
    newImages[idx2] = temp
    
    const newPositions = [...state.imagePositions]
    const tempPos = newPositions[idx1]
    newPositions[idx1] = newPositions[idx2]
    newPositions[idx2] = tempPos

    const newScales = [...state.imageScales]
    const tempScale = newScales[idx1]
    newScales[idx1] = newScales[idx2]
    newScales[idx2] = tempScale
    
    return { images: newImages, imagePositions: newPositions, imageScales: newScales }
  }),
  
  setIsImageLocked: (locked) => set({ isImageLocked: locked }),
})
