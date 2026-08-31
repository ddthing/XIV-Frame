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
  const ratioOptions = [
    { value: 'x' as const, label: layoutT('ratioX'), compactLabel: 'X · 16:9' },
    { value: 'original' as const, label: layoutT('ratioOriginal'), compactLabel: layoutT('ratioOriginalShort') },
    { value: '2:1' as const, label: layoutT('ratio2_1'), compactLabel: '2:1' },
  ]

  return (
    <div className={`flex min-h-[76px] shrink-0 flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-border bg-background px-7 py-4 ${className}`}>
      <div className="min-w-0">
        <p className="editor-meta">{t('previewEyebrow')}</p>
        <h1 className="mt-1 truncate font-display text-xl font-bold tracking-[0.01em] text-foreground">
          {t('previewTitle')}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <div className="hidden items-center gap-3 lg:flex">
          <span className="text-xs font-semibold text-muted-foreground">{t('ratio')}</span>
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface-inset/70 p-1" role="group" aria-label={t('ratio')}>
            {ratioOptions.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                aria-label={ratio.label}
                title={ratio.label}
                aria-pressed={canvasRatio === ratio.value}
                onClick={() => handleRatioChange(ratio.value as CanvasRatio)}
                className={`min-h-11 min-w-12 rounded-sm px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  canvasRatio === ratio.value
                    ? 'bg-card text-foreground shadow-subtle'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {ratio.compactLabel}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 lg:hidden">
          <span className="sr-only">{t('ratio')}</span>
          <select
            value={canvasRatio}
            onChange={(event) => handleRatioChange(event.target.value as CanvasRatio)}
            aria-label={t('ratio')}
            className="h-11 rounded-md border border-border bg-surface-inset/70 px-2 text-[11px] font-semibold text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {ratioOptions.map((ratio) => <option key={ratio.value} value={ratio.value}>{ratio.label}</option>)}
          </select>
        </label>

        <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 shadow-subtle">
          <Button variant="ghost" size="icon-xs" className="size-11 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('zoomOut')} onClick={handleZoomOut}>
            <ZoomOut />
          </Button>
          <div className="w-24 px-1">
            <Slider value={[zoom]} onValueChange={handleZoomChange} min={10} max={200} step={1} aria-label={`${t('zoom')} ${zoom}%`} />
          </div>
          <Button variant="ghost" size="icon-xs" className="size-11 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t('zoomIn')} onClick={handleZoomIn}>
            <ZoomIn />
          </Button>
          <span className="w-11 text-center font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{zoom}%</span>
        </div>
      </div>
    </div>
  )
}
