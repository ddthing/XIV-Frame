import { useSyncExternalStore } from 'react'

const MOBILE_QUERY = '(max-width: 767px)'

function getMediaQueryList() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(MOBILE_QUERY)
    : null
}

function subscribe(onStoreChange: () => void) {
  const mediaQuery = getMediaQueryList()
  if (!mediaQuery) return () => undefined

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', onStoreChange)
    return () => mediaQuery.removeEventListener('change', onStoreChange)
  }

  mediaQuery.addListener(onStoreChange)
  return () => mediaQuery.removeListener(onStoreChange)
}

function getSnapshot() {
  return getMediaQueryList()?.matches ?? false
}

function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
