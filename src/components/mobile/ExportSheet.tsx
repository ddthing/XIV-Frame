import React from 'react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import { useStore, CanvasRatio } from '@/store/useStore'
import { exportCanvas } from '@/lib/export'
import { Slider } from '@/components/ui/slider'

  import type Konva from 'konva'

import { useTranslations } from 'next-intl'

  export function ExportSheet({ 
    open, 
    onOpenChange, 
    stageRef 
  }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    stageRef: React.MutableRefObject<Konva.Stage | null>;
  }) {
  const { canvasRatio, setCanvasRatio, zoom, setZoom, resetAll } = useStore()
  const t = useTranslations('MobileLayout')
  const layoutT = useTranslations('LayoutSettings')

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-background">
        <DrawerTitle className="sr-only">{t('sheetTitle')}</DrawerTitle>
        <div className="p-6 pb-[calc(env(safe-area-inset-bottom,1rem)+1.5rem)] flex flex-col gap-8">
          
          {/* Canvas Ratio */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-foreground">{t('ratioSettings')}</span>
            <div className="flex bg-muted/50 p-1.5 rounded-full">
              {['auto', '16:9', '2:1'].map((ratio) => (
                <button
                  key={ratio}
                  className={`flex-1 py-2.5 text-sm rounded-full transition-colors ${
                    canvasRatio === ratio 
                      ? 'bg-card shadow-sm font-bold text-primary' 
                      : 'text-muted-foreground hover:text-foreground font-medium'
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
            <span className="text-sm font-semibold text-foreground">{t('zoomSettings')}</span>
            <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-full">
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full text-muted-foreground" aria-label={t('zoomOut')} onClick={() => setZoom(Math.max(10, zoom - 10))}>
                <ZoomOut className="w-5 h-5" />
              </Button>
              <div className="flex-1 px-2">
                <Slider 
                  value={[zoom]} 
                  onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)} 
                  min={10} max={200} step={1} 
                />
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full text-muted-foreground" aria-label={t('zoomIn')} onClick={() => setZoom(Math.min(200, zoom + 10))}>
                <ZoomIn className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                resetAll()
                onOpenChange(false)
              }} 
              className="h-14 flex-1 rounded-3xl border-border bg-card font-semibold text-foreground"
            >
              <RefreshCw className="w-5 h-5 mr-2" /> {t('resetDefault')}
            </Button>
            <Button 
              className="h-14 flex-[2] rounded-3xl font-bold text-base shadow-lg shadow-primary/20" 
              onClick={() => {
                exportCanvas(stageRef, 'png')
                onOpenChange(false)
              }}
            >
              <Download className="w-5 h-5 mr-2" /> {t('savePhoto')}
            </Button>
          </div>
          
        </div>
      </DrawerContent>
    </Drawer>
  )
}
