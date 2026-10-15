'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'
import { HistoryControls } from './HistoryControls'
import { ExportDialog } from './ExportDialog'
import { ProjectActions } from './ProjectActions'
import type Konva from 'konva'

export function DesktopToolbar({ stageRef, className = '' }: { stageRef: React.MutableRefObject<Konva.Stage | null>; className?: string }) {
  const t = useTranslations('DesktopToolbar')
  const studio = useTranslations('Studio')
  const hasImages = useStore(state => state.images.some(Boolean))
  const isExporting = useStore(state => state.isExporting)
  const resetAll = useStore(state => state.resetAll)
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => {
    const open = () => {
      if (window.matchMedia('(min-width: 768px)').matches && useStore.getState().images.some(Boolean)) setExportOpen(true)
    }
    const media = window.matchMedia('(min-width: 768px)')
    const resize = () => { if (!media.matches) setExportOpen(false) }
    window.addEventListener('xiv-frame:open-export', open)
    media.addEventListener('change', resize)
    return () => {
      window.removeEventListener('xiv-frame:open-export', open)
      media.removeEventListener('change', resize)
    }
  }, [])

  return (
    <>
      <header className={`app-header studio-header relative flex items-center gap-4 bg-primary px-5 text-primary-foreground ${className}`}>
        <div className="flex min-w-0 items-center gap-4">
          <Logo size="md" inverse />
          <span className="hidden border-l border-primary-foreground/20 pl-4 font-mono text-[9px] tracking-[0.2em] text-primary-foreground/50 xl:block">SCREENSHOT STUDIO</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <HistoryControls inverse />
          <span className="mx-1 h-5 w-px bg-primary-foreground/15" aria-hidden="true" />
          <ProjectActions compact />
          <Button variant="ghost" size="icon" aria-label={t('reset')} title={t('reset')}
            onClick={() => { if (!hasImages || window.confirm(t('resetConfirm'))) resetAll() }}
            className="size-10 text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <RotateCcw className="size-4" aria-hidden="true" />
          </Button>
          <LanguageSwitcher inverse />
          <Button disabled={!hasImages || isExporting} onClick={() => setExportOpen(true)} aria-keyshortcuts="Control+Shift+S Meta+Shift+S"
            className="ml-2 h-10 rounded-md bg-primary-foreground px-4 text-xs font-semibold text-primary hover:bg-primary-foreground/90">
            {studio('export')}<ArrowUpRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </header>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} stageRef={stageRef} />
    </>
  )
}
