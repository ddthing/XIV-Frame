import { useStore } from '@/store/useStore'
import { Button, buttonVariants } from '@/components/ui/button'
import { RefreshCw, ZoomIn, ZoomOut, ChevronDown, BookOpen } from 'lucide-react'
import { exportCanvas } from '@/lib/export'
import { Slider } from '@/components/ui/slider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

import { CanvasRatio } from '@/store/useStore'
import type Konva from 'konva'

interface DesktopToolbarProps {
  stageRef: React.MutableRefObject<Konva.Stage | null>
  className?: string
}

export function DesktopToolbar({ stageRef, className = '' }: DesktopToolbarProps) {
  const { canvasRatio, setCanvasRatio, zoom, setZoom, resetAll } = useStore()
  const t = useTranslations('DesktopToolbar')
  const tNav = useTranslations('Navigation')
  const layoutT = useTranslations('LayoutSettings')
  const locale = useLocale()

  return (
    <div className={`flex items-center justify-between h-14 px-6 bg-background border-b border-border z-10 shrink-0 ${className}`}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{t('ratio')}</span>
        <div className="flex bg-muted p-1 rounded-sm">
          {['auto', '16:9', '2:1'].map((ratio) => (
            <button
              key={ratio}
              className={`px-3 py-1 text-xs rounded-sm transition-colors ${
                canvasRatio === ratio ? 'bg-card shadow-sm font-medium text-foreground' : 'text-muted-foreground hover:text-foreground font-medium hover:bg-card/50'
              }`}
              onClick={() => setCanvasRatio(ratio as CanvasRatio)}
            >
              {ratio === 'auto' ? layoutT('ratioAuto') : ratio.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-muted p-1 rounded-sm">
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm text-muted-foreground hover:bg-card/50 hover:text-foreground" aria-label={t('zoomOut')} onClick={() => setZoom(Math.max(10, zoom - 10))}>
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <div className="w-24 px-2">
          <Slider 
            value={[zoom]} 
            onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
            min={10} max={200} step={1} 
          />
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm text-muted-foreground hover:bg-card/50 hover:text-foreground" aria-label={t('zoomIn')} onClick={() => setZoom(Math.min(200, zoom + 10))}>
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs font-medium w-12 text-center text-muted-foreground">{zoom}%</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href={`/${locale}/blog`} aria-label={tNav('blog')} className={buttonVariants({ variant: 'ghost', size: 'sm', className: "h-9 rounded-sm px-3 text-muted-foreground hover:text-foreground" })}>
            <BookOpen className="w-4 h-4 mr-2" />
            {tNav('blog')}
          </Link>
          <Button variant="outline" size="sm" aria-label={t('reset')} onClick={resetAll} className="h-9 rounded-sm px-4 text-muted-foreground hover:text-foreground hover:bg-muted border-border transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" /> {t('reset')}
          </Button>
          <Button size="sm" aria-label="Export Canvas" className="h-9 rounded-sm px-5 bg-primary text-primary-foreground font-normal transition-opacity hover:opacity-90 shadow-none border border-transparent" onClick={() => exportCanvas(stageRef, 'png')}>
            {t('export')} PNG <ChevronDown className="w-3.5 h-3.5 ml-1.5 opacity-70" />
          </Button>
        </div>
      </div>
    </div>
  )
}
