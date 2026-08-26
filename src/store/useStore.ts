import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { ImageSlice, createImageSlice, initialImageState } from './slices/imageSlice'
import { LayoutSlice, createLayoutSlice, initialLayoutState, CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor, ImageShape } from './slices/layoutSlice'
import { SignatureSlice, createSignatureSlice, initialSignatureState, SignaturePosition, SignatureAlign } from './slices/signatureSlice'
import { CharacterSlice, createCharacterSlice, initialCharacterState } from './slices/characterSlice'
import { createDeferredStorage, type SyncStorage } from '@/lib/deferredStorage'
import { revokeObjectUrl } from '@/lib/imageUpload'

// Re-export types so we don't break existing imports
export type { CanvasRatio, BackgroundColor, CopyrightPosition, CopyrightColor, SignaturePosition, SignatureAlign, ImageShape }

export interface AppState extends ImageSlice, LayoutSlice, SignatureSlice, CharacterSlice {
  resetVersion: number
  resetAll: () => void
}

type PersistedAppState = Omit<Partial<AppState>, 'layoutPreset' | 'imageTransition'> & {
  layoutPreset?: string
  imageTransition?: string
}

export type StorageStatus = 'saved' | 'partial' | 'session'

let storageStatus: StorageStatus = 'saved'
const SETTINGS_STORAGE_KEY = 'xiv-frame-settings-v2'
const LOGO_STORAGE_KEY = 'xiv-frame-logo-v1'
const SETTINGS_WRITE_DEBOUNCE_MS = 200

export function getStorageStatus() {
  return storageStatus
}

function publishStorageStatus(status: StorageStatus) {
  if (storageStatus === status) return

  storageStatus = status
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('xiv-frame-storage-status'))
  }
}

function persistLogoUrl(url: string | null) {
  if (typeof window === 'undefined') return

  try {
    if (url) window.localStorage.setItem(LOGO_STORAGE_KEY, url)
    else window.localStorage.removeItem(LOGO_STORAGE_KEY)
    publishStorageStatus('saved')
  } catch {
    // The logo remains available in memory even when its dedicated storage
    // entry cannot fit in the browser quota.
    publishStorageStatus('partial')
  }
}

// Keep edits usable in private browsing and when a large legacy logo fills the
// browser quota. The current Zustand state remains available for the session;
// persistence is best-effort and existing stored settings are read unchanged.
const safeLocalStorage: SyncStorage = {
  getItem: (name) => {
    try {
      if (typeof window === 'undefined') return null
      const storedValue = window.localStorage.getItem(name)
      if (name !== SETTINGS_STORAGE_KEY || !storedValue) return storedValue

      // Keep the large logo payload out of the settings value that is
      // serialized on every slider/text change. Read legacy v2 values once and
      // move their logo into the dedicated entry when possible.
      const parsed = JSON.parse(storedValue) as { state?: Record<string, unknown> } & Record<string, unknown>
      const target = parsed.state && typeof parsed.state === 'object' ? parsed.state : parsed
      const separateLogo = window.localStorage.getItem(LOGO_STORAGE_KEY)
      const legacyLogo = typeof target.logoUrl === 'string' ? target.logoUrl : null

      if (separateLogo) {
        target.logoUrl = separateLogo
      } else if (legacyLogo) {
        try {
          window.localStorage.setItem(LOGO_STORAGE_KEY, legacyLogo)
        } catch {
          // Keep the legacy value in the hydrated state if migration cannot
          // write the new key.
        }
        target.logoUrl = legacyLogo
      }

      return JSON.stringify(parsed)
    } catch {
      publishStorageStatus('session')
      return null
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(name, value)
      publishStorageStatus('saved')
    } catch {
      // Keep existing settings when a legacy Base64 logo fills the quota.
      // The logo remains available in memory for the current session.
      try {
        const parsed = JSON.parse(value) as { state?: Record<string, unknown> } & Record<string, unknown>
        if (parsed.state && typeof parsed.state === 'object') {
          delete parsed.state.logoUrl
        } else {
          delete parsed.logoUrl
        }
        window.localStorage.setItem(name, JSON.stringify(parsed))
        publishStorageStatus('partial')
      } catch {
        // Do not let a storage quota error break text or logo controls.
        publishStorageStatus('session')
      }
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(name)
    } catch {
      // Storage can be unavailable in private browsing contexts.
      publishStorageStatus('session')
    }
  },
}

const deferredSettingsStorage = createDeferredStorage(safeLocalStorage, SETTINGS_WRITE_DEBOUNCE_MS)

if (typeof window !== 'undefined') {
  const flushSettings = () => deferredSettingsStorage.flush()
  const flushHiddenSettings = () => {
    if (document.visibilityState === 'hidden') flushSettings()
  }
  window.addEventListener('pagehide', flushSettings)
  document.addEventListener('visibilitychange', flushHiddenSettings)
}

export const useStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      ...createImageSlice(set, get, api),
      ...createLayoutSlice(set, get, api),
      ...createSignatureSlice(set, get, api),
      ...createCharacterSlice(set, get, api),
      resetVersion: 0,

      // The store owns the character source Blob URL. Component lifecycles
      // can end when an editor tab or responsive layout changes, so release
      // the previous URL only when the state itself replaces or clears it.
      setCharacterSourceUrl: (url) => {
        const currentUrl = get().characterSourceUrl
        if (currentUrl !== url) revokeObjectUrl(currentUrl)
        set({ characterSourceUrl: url })
      },

      // Cutout previews are Blob URLs so repeated brush edits do not retain
      // large Base64 strings. The store owns the URL and releases the
      // previous preview whenever a newer one replaces it.
      setCharacterCutoutUrl: (url) => {
        const currentUrl = get().characterCutoutUrl
        if (currentUrl !== url) revokeObjectUrl(currentUrl)
        set({ characterCutoutUrl: url })
      },

      // Persist the large logo only when the logo itself changes. Keeping it
      // out of the main persisted object prevents every style slider from
      // serializing and writing the same data URL.
      setLogoUrl: (url) => {
        set({ logoUrl: url })
        persistLogoUrl(url)
      },
      
      resetAll: () => {
        // Revoke all existing blob URLs before resetting
        const currentState = get()
        currentState.images.forEach(revokeObjectUrl)
        revokeObjectUrl(currentState.characterSourceUrl)
        revokeObjectUrl(currentState.characterCutoutUrl)
        set({
          ...initialImageState,
          ...initialLayoutState,
          ...initialSignatureState,
          ...initialCharacterState,
          resetVersion: currentState.resetVersion + 1,
        })
        persistLogoUrl(null)
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => deferredSettingsStorage),
      version: 4, // v4 names the X timeline and original-ratio profiles
      migrate: (persistedState: unknown) => {
        const state: PersistedAppState = persistedState && typeof persistedState === 'object'
          ? { ...(persistedState as PersistedAppState) }
          : {}

        // Older versions could leave ephemeral image payloads inside the
        // settings object. Drop them during hydration so a legacy Base64
        // cutout cannot reintroduce the memory and quota problem.
        delete state.images
        delete state.imagePositions
        delete state.imageScales
        delete state.characterSourceUrl
        delete state.characterCutoutUrl
        
        // Migrate legacy 'blend' preset
        if (state.layoutPreset === 'blend') {
          state.layoutPreset = 'split'
          state.imageTransition = 'soft-blend'
        }

        // v3 called the natural composition "auto" and the X-friendly
        // profile "16:9". Keep existing users on the same visual setting
        // while making the intent explicit in the current controls.
        const legacyRatio = state.canvasRatio as string | undefined
        if (legacyRatio === 'auto') {
          state.canvasRatio = 'original'
        } else if (legacyRatio === '16:9') {
          state.canvasRatio = 'x'
        } else if (legacyRatio !== undefined && !['x', 'original', '2:1'].includes(legacyRatio)) {
          delete state.canvasRatio
        }
        
        return state as AppState
      },
      partialize: (state) => {
        // Exclude ephemeral and large payload state from persistence.
        const persistedState = { ...state } as Partial<AppState> & Record<string, unknown>
        delete persistedState.images
        delete persistedState.imagePositions
        delete persistedState.imageScales
        delete persistedState.isImageLocked
        delete persistedState.selectedImageIndex
        delete persistedState.isExporting
        delete persistedState.characterSourceUrl
        delete persistedState.characterCutoutUrl
        delete persistedState.logoUrl
        delete persistedState.resetVersion
        return persistedState
      }
    }
  )
)
