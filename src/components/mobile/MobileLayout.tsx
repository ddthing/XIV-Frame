'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'
import { MobileBottomNav } from './MobileBottomNav'
import { ImageSheet } from './ImageSheet'
import { SignatureSheet } from './SignatureSheet'
import { LayoutSheet } from './LayoutSheet'
import { ExportSheet } from './ExportSheet'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'
import { EditorGuide } from '@/components/canvas/EditorGuide'
import { HistoryControls } from '@/components/canvas/HistoryControls'
import type Konva from 'konva'

export type BottomSheetType = 'image' | 'signature' | 'layout' | 'export' | null

type OpenBottomSheet = Exclude<BottomSheetType, null>

// Keep the next sheet from mounting until the current drawer has finished its
// 450ms close transition. Without this handoff, Base UI can swallow the next
// drawer's opening state when a user follows the primary step-by-step flow.
const SHEET_TRANSITION_MS = 450

export function MobileLayout({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null)
  const pendingSheetRef = useRef<number | null>(null)

  const clearPendingSheet = useCallback(() => {
    if (pendingSheetRef.current !== null) {
      window.clearTimeout(pendingSheetRef.current)
      pendingSheetRef.current = null
    }
  }, [])

  const openSheet = useCallback((sheet: BottomSheetType) => {
    clearPendingSheet()
    setActiveSheet(sheet)
  }, [clearPendingSheet])

  const moveToSheet = useCallback((sheet: OpenBottomSheet) => {
    clearPendingSheet()
    setActiveSheet(null)
    pendingSheetRef.current = window.setTimeout(() => {
      setActiveSheet(sheet)
      pendingSheetRef.current = null
    }, SHEET_TRANSITION_MS)
  }, [clearPendingSheet])

  const handleSheetSelect = useCallback((sheet: BottomSheetType) => {
    if (sheet === null || sheet === activeSheet) {
      clearPendingSheet()
      setActiveSheet(null)
      return
    }

    if (activeSheet !== null) {
      moveToSheet(sheet)
      return
    }

    openSheet(sheet)
  }, [activeSheet, clearPendingSheet, moveToSheet, openSheet])

  useEffect(() => {
    const openMobileSheet = (sheet: OpenBottomSheet) => {
      // Desktop and mobile editors are both mounted for a stable responsive
      // layout. Only the visible surface may respond to shared editor events.
      if (!window.matchMedia('(max-width: 767px)').matches) return
      openSheet(sheet)
    }
    const openLayout = () => openMobileSheet('layout')
    const openImage = () => openMobileSheet('image')
    const openSignature = () => openMobileSheet('signature')
    const openExport = () => openMobileSheet('export')

    window.addEventListener('xiv-frame:open-layout', openLayout)
    window.addEventListener('xiv-frame:open-image', openImage)
    window.addEventListener('xiv-frame:open-signature', openSignature)
    window.addEventListener('xiv-frame:open-export', openExport)
    return () => {
      window.removeEventListener('xiv-frame:open-layout', openLayout)
      window.removeEventListener('xiv-frame:open-image', openImage)
      window.removeEventListener('xiv-frame:open-signature', openSignature)
      window.removeEventListener('xiv-frame:open-export', openExport)
    }
  }, [openSheet])

  useEffect(() => () => clearPendingSheet(), [clearPendingSheet])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handleViewportChange = () => {
      if (!mediaQuery.matches) {
        clearPendingSheet()
        setActiveSheet(null)
      }
    }

    mediaQuery.addEventListener('change', handleViewportChange)
    return () => mediaQuery.removeEventListener('change', handleViewportChange)
  }, [clearPendingSheet])

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-background">
      <header className="app-header relative flex items-center gap-2 border-b border-primary-foreground/15 bg-primary px-3 text-primary-foreground">
        <div className="flex min-w-0 items-center">
          <Logo size="sm" inverse className="[&>span]:whitespace-nowrap max-[359px]:[&>span]:sr-only" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <HistoryControls inverse />
          <EditorGuide idSuffix="mobile" />
          <LanguageSwitcher inverse compact />
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <PreviewCanvas stageRef={stageRef} showDock={false} />
      </main>

      <div className="z-20 shrink-0 border-t border-border bg-background pb-[env(safe-area-inset-bottom,0px)]">
        <MobileBottomNav activeSheet={activeSheet} onSelect={handleSheetSelect} />
      </div>

      <ImageSheet
        open={activeSheet === 'image'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        onContinue={() => moveToSheet('signature')}
      />
      <SignatureSheet
        open={activeSheet === 'signature'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        onContinue={() => moveToSheet('export')}
      />
      <LayoutSheet
        open={activeSheet === 'layout'}
        onOpenChange={(open) => !open && setActiveSheet(null)}
        onContinue={() => moveToSheet('image')}
      />
      <ExportSheet open={activeSheet === 'export'} onOpenChange={(open) => !open && setActiveSheet(null)} stageRef={stageRef} />
    </div>
  )
}
