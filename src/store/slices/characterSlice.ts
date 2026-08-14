import { StateCreator } from 'zustand'

export interface CharacterSlice {
  characterSourceUrl: string | null
  setCharacterSourceUrl: (url: string | null) => void
  characterCutoutUrl: string | null
  setCharacterCutoutUrl: (url: string | null) => void
  characterPosition: { x: number; y: number } | null
  setCharacterPosition: (position: { x: number; y: number } | null) => void
  characterScale: number
  setCharacterScale: (scale: number) => void
  characterOpacity: number
  setCharacterOpacity: (opacity: number) => void
  characterFlipX: boolean
  setCharacterFlipX: (flip: boolean) => void
  characterShadow: boolean
  setCharacterShadow: (enabled: boolean) => void
}

export const initialCharacterState = {
  characterSourceUrl: null,
  characterCutoutUrl: null,
  characterPosition: null,
  characterScale: 1,
  characterOpacity: 100,
  characterFlipX: false,
  characterShadow: true,
}

export const createCharacterSlice: StateCreator<CharacterSlice, [], [], CharacterSlice> = (set) => ({
  ...initialCharacterState,

  setCharacterSourceUrl: (url) => set({ characterSourceUrl: url }),
  setCharacterCutoutUrl: (url) => set({ characterCutoutUrl: url }),
  setCharacterPosition: (position) => set({ characterPosition: position }),
  setCharacterScale: (scale) => set({ characterScale: scale }),
  setCharacterOpacity: (opacity) => set({ characterOpacity: opacity }),
  setCharacterFlipX: (flip) => set({ characterFlipX: flip }),
  setCharacterShadow: (enabled) => set({ characterShadow: enabled }),
})
