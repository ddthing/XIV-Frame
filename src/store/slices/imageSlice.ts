import { StateCreator } from 'zustand'
import { revokeObjectUrl } from '@/lib/imageUpload'

export type PreparedImage = {
  index: number
  url: string
}

export interface ImageSlice {
  images: string[]
  setImages: (images: string[]) => void
  imagePositions: { x: number; y: number }[]
  setImagePosition: (index: number, pos: { x: number; y: number }) => void
  imageScales: number[]
  setImageScale: (index: number, scale: number) => void
  selectedImageIndex: number
  setSelectedImageIndex: (index: number) => void
  setPreparedImages: (entries: readonly PreparedImage[], selectedIndex?: number) => void
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
  selectedImageIndex: 0,
  isImageLocked: false,
}

export const createImageSlice: StateCreator<ImageSlice, [], [], ImageSlice> = (set) => ({
  ...initialImageState,
  
  setImages: (images) => set((state) => {
    const nextUrls = new Set(images)
    const revokedUrls = new Set<string>()
    state.images.forEach((url) => {
      if (!nextUrls.has(url) && !revokedUrls.has(url)) {
        revokeObjectUrl(url)
        revokedUrls.add(url)
      }
    })

    return {
      images,
      imagePositions: images.map((_, i) => state.imagePositions[i] || { x: 0, y: 0 }),
      imageScales: images.map((_, i) => state.imageScales[i] || 1),
      selectedImageIndex: images.length === 0 ? 0 : Math.min(state.selectedImageIndex, images.length - 1),
    }
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

  setSelectedImageIndex: (index) => set({ selectedImageIndex: Math.max(0, index) }),

  setPreparedImages: (entries, selectedIndex) => set((state) => {
    const validEntries = entries.filter(({ index, url }) => (
      Number.isInteger(index) && index >= 0 && typeof url === 'string' && url.length > 0
    ))
    if (validEntries.length === 0) return state

    const nextImages = [...state.images]
    const nextPositions = [...state.imagePositions]
    const nextScales = [...state.imageScales]

    validEntries.forEach(({ index, url }) => {
      if (nextImages[index] === url) return
      nextImages[index] = url
      nextPositions[index] = { x: 0, y: 0 }
      nextScales[index] = 1
    })

    const retainedUrls = new Set(nextImages)
    const revokedUrls = new Set<string>()
    state.images.forEach((url) => {
      if (url && !retainedUrls.has(url) && !revokedUrls.has(url)) {
        revokeObjectUrl(url)
        revokedUrls.add(url)
      }
    })

    return {
      images: nextImages,
      imagePositions: nextPositions,
      imageScales: nextScales,
      ...(selectedIndex === undefined
        ? {}
        : { selectedImageIndex: Math.max(0, Math.min(selectedIndex, nextImages.length - 1)) }),
    }
  }),
  
  setImageAt: (index, url) => set((state) => {
    const newImages = [...state.images]
    const oldUrl = newImages[index]
    if (oldUrl === url) return state
    revokeObjectUrl(oldUrl)
    newImages[index] = url
    return { images: newImages }
  }),
  
  removeImageAt: (index) => set((state) => {
    if (index < 0 || index >= state.images.length) return state

    const newImages = [...state.images]
    const oldUrl = newImages[index]
    revokeObjectUrl(oldUrl)
    newImages.splice(index, 1)
    const newPositions = [...state.imagePositions]
    newPositions.splice(index, 1)
    const newScales = [...state.imageScales]
    newScales.splice(index, 1)
    const selectedImageIndex = state.selectedImageIndex === index
      ? Math.max(0, Math.min(index, newImages.length - 1))
      : state.selectedImageIndex > index
        ? state.selectedImageIndex - 1
        : state.selectedImageIndex
    return { images: newImages, imagePositions: newPositions, imageScales: newScales, selectedImageIndex }
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
    
    const selectedImageIndex = state.selectedImageIndex === idx1
      ? idx2
      : state.selectedImageIndex === idx2
        ? idx1
        : state.selectedImageIndex
    return { images: newImages, imagePositions: newPositions, imageScales: newScales, selectedImageIndex }
  }),
  
  setIsImageLocked: (locked) => set({ isImageLocked: locked }),
})
