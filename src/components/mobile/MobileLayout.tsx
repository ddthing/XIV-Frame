'use client'

import React, { useState } from 'react'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'
import { MobileBottomNav } from './MobileBottomNav'
import { ImageSheet } from './ImageSheet'
import { SignatureSheet } from './SignatureSheet'
import { LayoutSheet } from './LayoutSheet'
import { ExportSheet } from './ExportSheet'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'
import { useTranslations } from 'next-intl'

export type BottomSheetType = 'image' | 'signature' | 'layout' | 'export' | null

import type Konva from 'konva'

export function MobileLayout({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null)
  const t = useTranslations('DesktopToolbar')

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-background">
      <header className="app-header flex items-center gap-3 border-b border-primary-foreground/15 bg-primary px-4 text-primary-foreground">
        <div className="flex min-w-0 items-center gap-3">
          <Logo size="md" inverse />
          <span className="hidden font-body text-[10px] text-primary-foreground/55 sm:inline">{t('savedLocally')}</span>
        </div>
        <div className="ml-auto"><LanguageSwitcher inverse /></div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <PreviewCanvas stageRef={stageRef} />
      </div>

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
