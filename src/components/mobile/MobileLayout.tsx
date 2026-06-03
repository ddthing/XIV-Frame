'use client'

import React, { useState } from 'react'
import { Logo } from '@/components/ui/Logo'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'
import { MobileBottomNav } from './MobileBottomNav'
import { ImageSheet } from './ImageSheet'
import { SignatureSheet } from './SignatureSheet'
import { LayoutSheet } from './LayoutSheet'
import { ExportSheet } from './ExportSheet'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export type BottomSheetType = 'image' | 'signature' | 'layout' | 'export' | null

import type Konva from 'konva'

export function MobileLayout({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null)

  return (
    <div className="flex flex-col w-full h-full relative bg-background">
      {/* Header removed: using global SiteHeader from PageShell */}

      {/* Canvas Area */}
      <main className="flex-1 relative overflow-hidden">
        <PreviewCanvas stageRef={stageRef} />
      </main>

      {/* Bottom Navigation */}
      <div className="shrink-0 z-20 pb-[env(safe-area-inset-bottom,0px)] bg-card border-t border-border">
        <MobileBottomNav activeSheet={activeSheet} onSelect={setActiveSheet} />
      </div>

      {/* Bottom Sheets */}
      <ImageSheet open={activeSheet === 'image'} onOpenChange={(open) => !open && setActiveSheet(null)} />
      <SignatureSheet open={activeSheet === 'signature'} onOpenChange={(open) => !open && setActiveSheet(null)} />
      <LayoutSheet open={activeSheet === 'layout'} onOpenChange={(open) => !open && setActiveSheet(null)} />
      <ExportSheet open={activeSheet === 'export'} onOpenChange={(open) => !open && setActiveSheet(null)} stageRef={stageRef} />
    </div>
  )
}
