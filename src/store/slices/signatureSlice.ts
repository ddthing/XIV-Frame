import { StateCreator } from 'zustand'

export type SignaturePosition = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right'
export type SignatureAlign = 'left' | 'center' | 'right'

export interface SignatureSlice {
  characterName: string
  serverName: string
  setCharacterName: (name: string) => void
  setServerName: (name: string) => void
  
  signaturePosition: SignaturePosition
  setSignaturePosition: (pos: SignaturePosition) => void
  signatureAlign: SignatureAlign
  setSignatureAlign: (align: SignatureAlign) => void
  
  fontFamily: string
  setFontFamily: (font: string) => void
  signatureSize: number
  setSignatureSize: (size: number) => void
  signatureColor: string
  setSignatureColor: (color: string) => void
  signatureOpacity: number
  setSignatureOpacity: (opacity: number) => void

  upperLetterSpacing: number
  setUpperLetterSpacing: (val: number) => void
  upperBold: boolean
  setUpperBold: (val: boolean) => void
  upperItalic: boolean
  setUpperItalic: (val: boolean) => void

  lowerLetterSpacing: number
  setLowerLetterSpacing: (val: number) => void
  lowerBold: boolean
  setLowerBold: (val: boolean) => void
  lowerItalic: boolean
  setLowerItalic: (val: boolean) => void

  logoUrl: string | null
  setLogoUrl: (url: string | null) => void
  logoPosition: SignaturePosition
  setLogoPosition: (pos: SignaturePosition) => void
  logoScale: number
  setLogoScale: (scale: number) => void
  logoOpacity: number
  setLogoOpacity: (opacity: number) => void
}

export const initialSignatureState = {
  characterName: 'Name',
  serverName: 'FINAL FANTASY XIV',
  signaturePosition: 'bottom-center' as SignaturePosition,
  signatureAlign: 'center' as SignatureAlign,
  fontFamily: 'Pretendard',
  signatureSize: 100,
  signatureColor: '#000000',
  signatureOpacity: 100,

  upperLetterSpacing: 0,
  upperBold: true,
  upperItalic: false,

  lowerLetterSpacing: 0,
  lowerBold: false,
  lowerItalic: false,

  logoUrl: null,
  logoPosition: 'bottom-center' as SignaturePosition,
  logoScale: 100,
  logoOpacity: 100,
}

export const createSignatureSlice: StateCreator<SignatureSlice, [], [], SignatureSlice> = (set) => ({
  ...initialSignatureState,
  
  setCharacterName: (name) => set({ characterName: name }),
  setServerName: (name) => set({ serverName: name }),

  setSignaturePosition: (pos) => set({ signaturePosition: pos }),
  setSignatureAlign: (align) => set({ signatureAlign: align }),

  setFontFamily: (font) => set({ fontFamily: font }),
  setSignatureSize: (size) => set({ signatureSize: size }),
  setSignatureColor: (color) => set({ signatureColor: color }),
  setSignatureOpacity: (opacity) => set({ signatureOpacity: opacity }),

  setUpperLetterSpacing: (val) => set({ upperLetterSpacing: val }),
  setUpperBold: (val) => set({ upperBold: val }),
  setUpperItalic: (val) => set({ upperItalic: val }),

  setLowerLetterSpacing: (val) => set({ lowerLetterSpacing: val }),
  setLowerBold: (val) => set({ lowerBold: val }),
  setLowerItalic: (val) => set({ lowerItalic: val }),

  setLogoUrl: (url) => set({ logoUrl: url }),
  setLogoScale: (scale) => set({ logoScale: scale }),
  setLogoOpacity: (opacity) => set({ logoOpacity: opacity }),
  setLogoPosition: (pos) => set({ logoPosition: pos }),
})
