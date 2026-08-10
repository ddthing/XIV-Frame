'use client'

import React, { useState } from 'react'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'
import { MobileBottomNav } from './MobileBottomNav'
import { ImageSheet } from './ImageSheet'
import { SignatureSheet } from './SignatureSheet'
import { LayoutSheet } from './LayoutSheet'
import { ExportSheet } from './ExportSheet'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'

export type BottomSheetType = 'image' | 'signature' | 'layout' | 'export' | null

import type Konva from 'konva'

export function MobileLayout({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null)
  const t = useTranslations('DesktopToolbar')

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-primary-foreground/15 bg-primary px-4 text-primary-foreground">
        <div className="grid size-7 place-items-center rounded-md border border-accent/70 font-display text-[9px] font-bold tracking-[-0.08em] text-accent">XIV</div>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold leading-none">XIV Frame</p>
          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-primary-foreground/55">{t('savedLocally')}</p>
        </div>
        <div className="ml-auto"><LanguageSwitcher inverse /></div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <PreviewCanvas stageRef={stageRef} />
      </main>

      <div className="z-20 shrink-0 border-t border-border bg-background pb-[env(safe-area-inset-bottom,0px)]">
        <MobileBottomNav activeSheet={activeSheet} onSelect={setActiveSheet} />
      </div>

      <ImageSheet open={activeSheet === 'image'} onOpenChange={(open) => !open && setActiveSheet(null)} />
      <SignatureSheet open={activeSheet === 'signature'} onOpenChange={(open) => !open && setActiveSheet(null)} />
      <LayoutSheet open={activeSheet === 'layout'} onOpenChange={(open) => !open && setActiveSheet(null)} />
      <ExportSheet open={activeSheet === 'export'} onOpenChange={(open) => !open && setActiveSheet(null)} stageRef={stageRef} />
    </div>
  )
}
