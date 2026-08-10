'use client'

import { ZoomIn, ZoomOut } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useCanvasActions } from '@/hooks/useCanvasActions'
import type { CanvasRatio } from '@/store/useStore'

export function CanvasToolbar({ className = '' }: { className?: string }) {
  const {
    zoom,
    canvasRatio,
    handleZoomIn,
    handleZoomOut,
    handleZoomChange,
    handleRatioChange,
  } = useCanvasActions()
  const t = useTranslations('DesktopToolbar')
  const layoutT = useTranslations('LayoutSettings')

  return (
    <div className={`flex min-h-[76px] shrink-0 items-end justify-between gap-6 border-b border-border bg-background px-7 py-4 ${className}`}>
      <div className="min-w-0">
        <p className="editor-meta">01 / Live preview</p>
        <h1 className="mt-1 truncate font-display text-2xl font-bold tracking-[0.01em] text-foreground">
          Your frame, in focus.
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <div className="hidden items-center gap-3 lg:flex">
          <span className="text-xs font-semibold text-muted-foreground">{t('ratio')}</span>
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface-inset/70 p-1" role="group" aria-label={t('ratio')}>
            {(['auto', '16:9', '2:1'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                aria-pressed={canvasRatio === ratio}
                onClick={() => handleRatioChange(ratio as CanvasRatio)}
                className={`min-w-12 rounded-sm px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  canvasRatio === ratio
                    ? 'bg-card text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {ratio === 'auto' ? layoutT('ratioAuto') : ratio}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 shadow-subtle">
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('zoomOut')} onClick={handleZoomOut}>
            <ZoomOut />
          </Button>
          <div className="w-24 px-1">
            <Slider value={[zoom]} onValueChange={handleZoomChange} min={10} max={200} step={1} aria-label={`${t('zoom')} ${zoom}%`} />
          </div>
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('zoomIn')} onClick={handleZoomIn}>
            <ZoomIn />
          </Button>
          <span className="w-11 text-center font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{zoom}%</span>
        </div>
      </div>
    </div>
  )
}
