import { StateCreator } from 'zustand'

export interface ImageSlice {
  images: string[]
  setImages: (images: string[]) => void
  imagePositions: { x: number; y: number }[]
  setImagePosition: (index: number, pos: { x: number; y: number }) => void
  imageScales: number[]
  setImageScale: (index: number, scale: number) => void
  resetImageTransform: (index: number) => void
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

export const createImageSlice: StateCreator<ImageSlice, [], [], ImageSlice> = (set) => ({
  ...initialImageState,
  
  setImages: (images) => set((state) => {
    return {
      images: [...images],
      imagePositions: images.map((_, i) => state.imagePositions[i] || { x: 0, y: 0 }),
      imageScales: images.map((_, i) => state.imageScales[i] || 1),
    }
  }),
  
  setImagePosition: (index, pos) => set((state) => {
    if (index < 0 || index >= state.images.length || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return state
    const current = state.imagePositions[index] ?? { x: 0, y: 0 }
    if (current.x === pos.x && current.y === pos.y) return state
    const newPositions = [...state.imagePositions]
    newPositions[index] = { ...pos }
    return { imagePositions: newPositions }
  }),

  setImageScale: (index, scale) => set((state) => {
    if (index < 0 || index >= state.images.length || !Number.isFinite(scale) || scale <= 0 || (state.imageScales[index] ?? 1) === scale) return state
    const newScales = [...state.imageScales]
    newScales[index] = scale
    return { imageScales: newScales }
  }),

  resetImageTransform: (index) => set((state) => {
    if (index < 0 || index >= state.images.length) return state
    const current = state.imagePositions[index] ?? { x: 0, y: 0 }
    if (current.x === 0 && current.y === 0 && (state.imageScales[index] ?? 1) === 1) return state
    const imagePositions = [...state.imagePositions]
    const imageScales = [...state.imageScales]
    imagePositions[index] = { x: 0, y: 0 }
    imageScales[index] = 1
    return { imagePositions, imageScales }
  }),
  
  setImageAt: (index, url) => set((state) => {
    if (index < 0 || index > 3) return state

    const newImages = [...state.images]
    // Keep the collection dense even if a stale UI action targets a later slot.
    // Dense indices are part of the canvas layout contract.
    const safeIndex = Math.min(index, newImages.length)
    const oldUrl = newImages[safeIndex]
    if (oldUrl === url) return state
    newImages[safeIndex] = url
    const newPositions = [...state.imagePositions]
    const newScales = [...state.imageScales]
    newPositions[safeIndex] = { x: 0, y: 0 }
    newScales[safeIndex] = 1
    // Replacement and transform reset are one reversible edit. URL cleanup is
    // owned by history so a removed screenshot remains available to undo.
    return { images: newImages, imagePositions: newPositions, imageScales: newScales }
  }),
  
  removeImageAt: (index) => set((state) => {
    if (index < 0 || index >= state.images.length) return state

    const newImages = [...state.images]
    newImages.splice(index, 1)
    const newPositions = [...state.imagePositions]
    newPositions.splice(index, 1)
    const newScales = [...state.imageScales]
    newScales.splice(index, 1)
    return { images: newImages, imagePositions: newPositions, imageScales: newScales }
  }),
  
  swapImages: (idx1, idx2) => set((state) => {
    if (idx1 < 0 || idx2 < 0 || idx1 >= state.images.length || idx2 >= state.images.length || idx1 === idx2) return state

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
