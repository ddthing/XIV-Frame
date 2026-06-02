'use client'

import React, { useState } from 'react'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'
import { MobileBottomNav } from './MobileBottomNav'
import { ImageSheet } from './ImageSheet'
import { SignatureSheet } from './SignatureSheet'
import { LayoutSheet } from './LayoutSheet'
import { ExportSheet } from './ExportSheet'

export type BottomSheetType = 'image' | 'signature' | 'layout' | 'export' | null

import type Konva from 'konva'

export function MobileLayout({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null)

  return (
    <div className="flex flex-col w-full h-full relative bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-center gap-2 h-12 bg-white border-b border-slate-200 shrink-0 z-10">
        <img src="/logo.png" alt="XIV Frame Logo" className="w-5 h-5 rounded-md object-cover" />
        <h1 className="text-sm font-bold text-slate-800 tracking-tight">XIV Frame</h1>
      </header>

      {/* Canvas Area */}
      <main className="flex-1 relative overflow-hidden">
        <PreviewCanvas stageRef={stageRef} />
      </main>

      {/* Bottom Navigation */}
      <div className="shrink-0 z-20 pb-[env(safe-area-inset-bottom,0px)] bg-white border-t border-slate-200">
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
