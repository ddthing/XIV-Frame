'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import ko from '@/messages/ko.json'
import en from '@/messages/en.json'
import ja from '@/messages/ja.json'

type EditorLocale = 'ko' | 'en' | 'ja'
const messages = { ko, en, ja }
const isEditorLocale = (value: string | null): value is EditorLocale => value === 'ko' || value === 'en' || value === 'ja'
const EditorLocaleContext = createContext<((locale: string) => void) | null>(null)

export function useEditorLocaleChange() {
  return useContext(EditorLocaleContext)
}

/** Keep session-only image URLs and undo history alive across language changes. */
export function EditorLocaleProvider({ initialLocale, children }: { initialLocale: string; children: React.ReactNode }) {
  const [locale, setLocale] = useState<EditorLocale>(isEditorLocale(initialLocale) ? initialLocale : 'ko')
  const changeLocale = useCallback((next: string) => {
    if (!isEditorLocale(next)) return
    setLocale(next)
    document.documentElement.lang = next
    window.history.replaceState(null, '', `${next === 'ko' ? '/' : `/${next}`}${window.location.search}${window.location.hash}`)
    try { localStorage.setItem('locale', next) } catch { /* Language remains usable without storage. */ }
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem('locale')
        if (isEditorLocale(saved) && saved !== initialLocale) changeLocale(saved)
      } catch { /* Keep the requested page language when storage is unavailable. */ }
    })
    return () => cancelAnimationFrame(frame)
  }, [changeLocale, initialLocale])

  return (
    <EditorLocaleContext.Provider value={changeLocale}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </EditorLocaleContext.Provider>
  )
}
