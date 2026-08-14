import React, { useState } from 'react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
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
    stageRef 
  }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    stageRef: React.MutableRefObject<Konva.Stage | null>;
  }) {
  const { canvasRatio, setCanvasRatio, zoom, setZoom, resetAll, isExporting, images } = useStore()
  const t = useTranslations('MobileLayout')
  const layoutT = useTranslations('LayoutSettings')
  const [exportError, setExportError] = useState<string | null>(null)
  const hasImages = images.length > 0

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
        <MobileSheetHeader eyebrow="03 / Export" title={t('exportTitle')} description={t('exportDescription')} role={t('exportRole')} />
        <MobileSheetBody open={open} className="flex flex-col gap-7 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,1rem)+1.5rem)] pt-5">
          
          {/* Canvas Ratio */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-foreground">{t('ratioSettings')}</span>
            <div className="flex rounded-md border border-border bg-surface-inset/70 p-1">
              {['auto', '16:9', '2:1'].map((ratio) => (
                <button
                  key={ratio}
                  className={`flex-1 rounded-sm py-2 text-xs font-semibold transition-colors ${
                    canvasRatio === ratio
                      ? 'bg-card text-foreground shadow-subtle'
                        : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setCanvasRatio(ratio as CanvasRatio)}
                >
                  {ratio === 'auto' ? layoutT('ratioAuto') : ratio.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-foreground">{t('zoomSettings')}</span>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-subtle">
              <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('zoomOut')} onClick={() => setZoom(Math.max(10, zoom - 10))}>
                <ZoomOut />
              </Button>
              <div className="flex-1 px-2">
                <Slider 
                  value={[zoom]} 
                  onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)} 
                  min={10} max={200} step={1} 
                />
              </div>
              <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('zoomIn')} onClick={() => setZoom(Math.min(200, zoom + 10))}>
                <ZoomIn />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button 
              variant="outline" 
              onClick={() => {
                if (hasImages && !window.confirm(t('resetConfirm'))) return
                resetAll()
                onOpenChange(false)
              }} 
              className="h-11 flex-1 rounded-md border-border bg-card text-xs font-semibold text-foreground"
            >
              <RefreshCw className="w-5 h-5 mr-2" /> {t('resetDefault')}
            </Button>
            <Button 
              className="h-11 flex-[2] rounded-md text-xs font-bold shadow-subtle"
              disabled={!hasImages || isExporting}
              onClick={() => void handleSave()}
            >
              {isExporting ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" /> : <Download className="w-5 h-5 mr-2" aria-hidden="true" />} {isExporting ? t('saving') : t('savePhoto')}
            </Button>
          </div>

          {exportError && (
            <p role="alert" className="inline-flex items-start gap-1.5 text-xs leading-4 text-destructive">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{exportError}</span>
            </p>
          )}
          
        </MobileSheetBody>
      </DrawerContent>
    </Drawer>
  )
}
