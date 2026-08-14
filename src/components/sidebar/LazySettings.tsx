'use client'

import dynamic from 'next/dynamic'

function SettingsLoading() {
  return (
    <div aria-busy="true" className="space-y-4">
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="h-20 animate-pulse rounded-xl border border-border bg-surface-inset/60" />
      <div className="h-28 animate-pulse rounded-xl border border-border bg-surface-inset/60" />
    </div>
  )
}

export const LazySignatureSettings = dynamic(
  () => import('./SignatureSettings').then((module) => module.SignatureSettings),
  { ssr: false, loading: () => <SettingsLoading /> },
)

export const LazyLayoutSettings = dynamic(
  () => import('./LayoutSettings').then((module) => module.LayoutSettings),
  { ssr: false, loading: () => <SettingsLoading /> },
)

export const LazyCharacterSettings = dynamic(
  () => import('./signature/CharacterSettings').then((module) => module.CharacterSettings),
  { ssr: false, loading: () => <SettingsLoading /> },
)
