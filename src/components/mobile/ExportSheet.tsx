'use client'

import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'
import { RotateCcw, Scan, ZoomIn, ZoomOut } from 'lucide-react'
import type Konva from 'konva'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ExportForm } from '@/components/canvas/ExportDialog'
import { ProjectActions } from '@/components/canvas/ProjectActions'
import { useStore } from '@/store/useStore'
import { MobileSheetHeader } from './MobileSheetHeader'
import { MobileSheetBody } from './MobileSheetBody'

export function ExportSheet({ open, onOpenChange, stageRef }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stageRef: React.MutableRefObject<Konva.Stage | null>
}) {
  const t = useTranslations('MobileLayout')
  const studio = useTranslations('Studio')
  const { zoom, setZoom, resetAll, hasImages } = useStore(useShallow(state => ({
    zoom: state.zoom, setZoom: state.setZoom, resetAll: state.resetAll, hasImages: state.images.some(Boolean),
  })))
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92dvh] rounded-t-2xl bg-background">
        <MobileSheetHeader open={open} onClose={() => onOpenChange(false)} eyebrow={t('exportEyebrow')} title={studio('export')} description={studio('exportDescription')} />
        <MobileSheetBody open={open} className="space-y-6 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,1rem)+1.5rem)] pt-5">
          <ExportForm stageRef={stageRef} />
          <div className="space-y-3 border-t border-border pt-5">
            <p className="text-xs font-semibold">{studio('projectFiles')}</p>
            <ProjectActions variant="light" />
          </div>
          <details className="rounded-lg border border-border bg-card p-3">
            <summary className="cursor-pointer py-2 text-xs font-semibold">{t('zoomSettings')}</summary>
            <div className="mt-2 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="size-10" aria-label={t('zoomOut')} onClick={() => setZoom(Math.max(10, zoom - 10))}><ZoomOut aria-hidden="true" /></Button>
              <Slider aria-label={t('zoomSettings')} value={[zoom]} onValueChange={value => setZoom(Array.isArray(value) ? value[0] : value)} min={10} max={200} step={1} />
              <Button variant="ghost" size="icon" className="size-10" aria-label={t('zoomIn')} onClick={() => setZoom(Math.min(200, zoom + 10))}><ZoomIn aria-hidden="true" /></Button>
              <span className="font-mono text-[10px]">{zoom}%</span>
            </div>
            <Button variant="ghost" className="mt-2 h-10 w-full text-xs" onClick={() => setZoom(100)}><Scan aria-hidden="true" className="size-4" />{t('fitToView')}</Button>
          </details>
          <Button variant="ghost" className="h-10 w-full text-xs text-muted-foreground" onClick={() => {
            if (hasImages && !window.confirm(t('resetConfirm'))) return
            resetAll()
            onOpenChange(false)
          }}><RotateCcw aria-hidden="true" className="size-4" />{t('resetDefault')}</Button>
        </MobileSheetBody>
      </DrawerContent>
    </Drawer>
  )
}
