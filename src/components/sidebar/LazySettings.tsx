'use client'

import dynamic from 'next/dynamic'

function SettingsLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <div className="h-4 w-28 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-[122px] animate-pulse rounded-xl border border-border bg-surface-inset/60 motion-reduce:animate-none" />
        ))}
      </div>
      <div className="h-20 animate-pulse rounded-xl border border-border bg-surface-inset/60 motion-reduce:animate-none" />
      <div className="h-24 animate-pulse rounded-xl border border-border bg-surface-inset/60 motion-reduce:animate-none" />
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
