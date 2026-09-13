import React, { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { EditorFieldHeader, EditorRadio, editorSegmentedGroupClass, editorSegmentedOptionClass } from '@/components/ui/editor'
import { AlertCircle, Download, RefreshCw, Scan, ZoomIn, ZoomOut } from 'lucide-react'
import { useStore, CanvasRatio } from '@/store/useStore'
import { exportCanvas } from '@/lib/export'
import { Slider } from '@/components/ui/slider'
import type Konva from 'konva'

import { useTranslations } from 'next-intl'
import { MobileSheetHeader } from './MobileSheetHeader'
import { MobileSheetBody } from './MobileSheetBody'

export function ExportSheet({
  open,
  onOpenChange,
  stageRef,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stageRef: React.MutableRefObject<Konva.Stage | null>
}) {
  const { canvasRatio, setCanvasRatio, zoom, setZoom, resetAll, isExporting, hasImages } = useStore(useShallow(state => ({
    canvasRatio: state.canvasRatio,
    setCanvasRatio: state.setCanvasRatio,
    zoom: state.zoom,
    setZoom: state.setZoom,
    resetAll: state.resetAll,
    isExporting: state.isExporting,
    hasImages: state.images.some(Boolean),
  })))
  const t = useTranslations('MobileLayout')
  const layoutT = useTranslations('LayoutSettings')
  const [exportError, setExportError] = useState<string | null>(null)
  const emptyExportHintId = 'mobile-export-empty-hint'

  const handleSave = async () => {
    if (!hasImages || isExporting) return
    setExportError(null)
    try {
      await exportCanvas(stageRef, 'png')
      onOpenChange(false)
    } catch {
      setExportError(t('exportError'))
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh] rounded-t-2xl bg-background">
        <MobileSheetHeader open={open} onClose={() => onOpenChange(false)} eyebrow={t('exportEyebrow')} title={t('exportTitle')} description={t('exportDescription')} />
        <MobileSheetBody open={open} className="flex flex-col gap-7 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,1rem)+1.5rem)] pt-5">
          <div className="space-y-5 rounded-xl bg-muted/35 p-3 sm:p-4">
            <div className="space-y-3">
              <EditorFieldHeader label={t('ratioSettings')} />
              <div className={`flex gap-0.5 ${editorSegmentedGroupClass}`} role="radiogroup" aria-label={t('ratioSettings')}>
                {['auto', '16:9', '2:1'].map((ratio) => (
                  <EditorRadio
                    key={ratio}
                    checked={canvasRatio === ratio}
                    className={`${editorSegmentedOptionClass(canvasRatio === ratio)} flex-1 px-2`}
                    onClick={() => setCanvasRatio(ratio as CanvasRatio)}
                  >
                    {ratio === 'auto' ? layoutT('ratioAuto') : ratio.toUpperCase()}
                  </EditorRadio>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <EditorFieldHeader label={t('zoomSettings')} value={`${zoom}%`} />
              <div className="flex items-center gap-2 rounded-lg bg-background/70 px-1.5 py-1">
                <Button type="button" variant="ghost" size="icon" className="size-10 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('zoomOut')} onClick={() => setZoom(Math.max(10, zoom - 10))}>
                  <ZoomOut aria-hidden="true" />
                </Button>
                <div className="flex-1 px-2">
                  <Slider
                    aria-label={t('zoomSettings')}
                    value={[zoom]}
                    onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
                    min={10} max={200} step={1}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" className="size-10 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('zoomIn')} onClick={() => setZoom(Math.min(200, zoom + 10))}>
                  <ZoomIn aria-hidden="true" />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full rounded-md bg-background/70 text-xs font-semibold hover:bg-background"
                aria-label={t('fitToView')}
                onClick={() => setZoom(100)}
              >
                <Scan aria-hidden="true" className="size-4" />
                {t('fitToView')}
              </Button>
            </div>
          </div>

          {!hasImages && (
            <p id={emptyExportHintId} className="font-body text-xs leading-5 text-muted-foreground">
              {t('emptyExportHint')}
            </p>
          )}

          {exportError && (
            <p id="mobile-export-error" role="alert" className="inline-flex items-start gap-1.5 text-xs leading-4 text-destructive">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{exportError}</span>
            </p>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 z-10 -mx-5 flex gap-2 bg-background/95 px-5 pb-1 pt-4 backdrop-blur-sm">
            <Button 
              type="button"
              variant="ghost"
              onClick={() => {
                if (hasImages && !window.confirm(t('resetConfirm'))) return
                resetAll()
                onOpenChange(false)
              }} 
              className="h-11 flex-1 rounded-md bg-muted/65 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <RefreshCw className="w-5 h-5 mr-2" aria-hidden="true" /> {t('resetDefault')}
            </Button>
            <Button 
              type="button"
              className="h-11 flex-[2] rounded-md text-xs font-bold shadow-subtle"
               disabled={!hasImages || isExporting}
               aria-describedby={!hasImages ? emptyExportHintId : exportError ? 'mobile-export-error' : undefined}
               onClick={() => void handleSave()}
            >
              {isExporting ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" /> : <Download className="w-5 h-5 mr-2" aria-hidden="true" />} {isExporting ? t('saving') : t('savePhoto')}
            </Button>
          </div>
        </MobileSheetBody>
      </DrawerContent>
    </Drawer>
  )
}
