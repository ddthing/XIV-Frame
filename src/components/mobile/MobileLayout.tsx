'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'
import { MobileBottomNav } from './MobileBottomNav'
import { ImageSheet } from './ImageSheet'
import { SignatureSheet } from './SignatureSheet'
import { LayoutSheet } from './LayoutSheet'
import { ExportSheet } from './ExportSheet'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'
import { useLocale, useTranslations } from 'next-intl'
import { useStore } from '@/store/useStore'
import { localizedLandingPath } from '@/lib/site'
import type { ExportResult } from '@/lib/export'

export type BottomSheetType = 'image' | 'signature' | 'layout' | 'export' | null

import type Konva from 'konva'

export function MobileLayout({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null)
  const [exportNotice, setExportNotice] = useState<string | null>(null)
  const t = useTranslations('DesktopToolbar')
  const tMobile = useTranslations('MobileLayout')
  const tNav = useTranslations('Navigation')
  const locale = useLocale()
  const homeHref = localizedLandingPath(locale)
  const imageCount = useStore((state) => state.images.filter(Boolean).length)
  const hasImages = imageCount > 0

  useEffect(() => {
    if (!exportNotice) return
    const timeoutId = window.setTimeout(() => setExportNotice(null), 5_000)
    return () => window.clearTimeout(timeoutId)
  }, [exportNotice])

  const handleHomeClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasImages && !window.confirm(t('leaveConfirm'))) event.preventDefault()
  }

  const closeSheet = (sheet: Exclude<BottomSheetType, null>) => {
    setActiveSheet((current) => current === sheet ? null : current)
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col bg-background">
      <header className="app-header flex items-center gap-3 border-b border-primary-foreground/15 bg-primary px-4 text-primary-foreground">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={homeHref}
            aria-label={tNav('home')}
            title={tNav('home')}
            onClick={handleHomeClick}
            className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <Logo size="sm" inverse />
          </Link>
          <span className="hidden font-body text-[10px] text-primary-foreground/55 sm:inline">{t('savedLocally')}</span>
        </div>
        <div className="ml-auto"><LanguageSwitcher inverse touchTarget /></div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <PreviewCanvas stageRef={stageRef} />
      </div>

      {exportNotice && (
        <p role="status" aria-live="polite" className="pointer-events-none absolute inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-30 rounded-lg border border-border bg-card/95 px-3 py-2 text-center text-xs font-semibold text-foreground shadow-subtle">
          {exportNotice}
        </p>
      )}

      <div className="z-20 shrink-0 border-t border-border bg-background pb-[env(safe-area-inset-bottom,0px)]">
        <MobileBottomNav activeSheet={activeSheet} onSelect={setActiveSheet} />
      </div>

      <ImageSheet
        open={activeSheet === 'image'}
        onOpenChange={(open) => !open && closeSheet('image')}
        onNext={() => setActiveSheet(imageCount === 1 ? 'signature' : 'layout')}
        nextLabel={imageCount === 0 ? tMobile('addPhotoFirst') : imageCount === 1 ? tMobile('nextSignature') : tMobile('nextLayout')}
        nextDisabled={imageCount === 0}
      />
      <SignatureSheet
        open={activeSheet === 'signature'}
        onOpenChange={(open) => !open && closeSheet('signature')}
        onNext={() => setActiveSheet('export')}
        nextLabel={tMobile('nextExport')}
      />
      <LayoutSheet
        open={activeSheet === 'layout'}
        onOpenChange={(open) => !open && closeSheet('layout')}
        onNext={() => setActiveSheet('signature')}
        nextLabel={tMobile('nextSignature')}
      />
      <ExportSheet
        open={activeSheet === 'export'}
        onOpenChange={(open) => !open && closeSheet('export')}
        stageRef={stageRef}
        onExportComplete={(result: ExportResult) => {
          if (result.resized) setExportNotice(t('exportResized'))
          else if (result.optimizedFrom) setExportNotice(t('exportOptimized'))
        }}
      />
    </div>
  )
}
