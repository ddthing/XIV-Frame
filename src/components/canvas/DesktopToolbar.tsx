import { Button, buttonVariants } from '@/components/ui/button'
import { RefreshCw, ZoomIn, ZoomOut, BookOpen } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { useCanvasActions } from '@/hooks/useCanvasActions'

import { CanvasRatio } from '@/store/useStore'
import type Konva from 'konva'

interface DesktopToolbarProps {
  stageRef: React.MutableRefObject<Konva.Stage | null>
  className?: string
}

export function DesktopToolbar({ stageRef, className = '' }: DesktopToolbarProps) {
  const { zoom, canvasRatio, handleZoomIn, handleZoomOut, handleZoomChange, handleRatioChange, handleReset, handleExport } = useCanvasActions()
  const t = useTranslations('DesktopToolbar')
  const tNav = useTranslations('Navigation')
  const layoutT = useTranslations('LayoutSettings')
  const locale = useLocale()

  return (
    <div className={`flex items-center justify-between h-14 px-6 bg-background border-b border-border z-10 shrink-0 ${className}`}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{t('ratio')}</span>
        <div className="flex bg-muted/50 p-1 rounded-[8px]">
          {['auto', '16:9', '2:1'].map((ratio) => (
            <button
              key={ratio}
              className={`px-4 py-1.5 text-sm rounded-[6px] transition-all ${
                canvasRatio === ratio ? 'bg-background text-primary font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground font-medium'
              }`}
              onClick={() => handleRatioChange(ratio as CanvasRatio)}
            >
              {ratio === 'auto' ? layoutT('ratioAuto') : ratio.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-[8px]">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[6px] text-muted-foreground hover:bg-background hover:text-foreground" aria-label={t('zoomOut')} onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="w-24 px-2">
          <Slider 
            value={[zoom]} 
            onValueChange={handleZoomChange}
            min={10} max={200} step={1} 
          />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[6px] text-muted-foreground hover:bg-background hover:text-foreground" aria-label={t('zoomIn')} onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium w-12 text-center text-muted-foreground">{zoom}%</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href={`/${locale}/blog`} aria-label={tNav('blog')} className="inline-flex items-center justify-center h-[40px] rounded-[6px] px-[16px] text-[14px] font-medium text-primary bg-transparent hover:bg-sticky-note-mint transition-colors">
            <BookOpen className="w-4 h-4 mr-2" />
            {tNav('blog')}
          </Link>
          <Button variant="sketchbookOutline" size="sm" aria-label={t('reset')} onClick={handleReset} className="h-[40px] rounded-[6px] px-[16px] text-[14px]">
            <RefreshCw className="w-4 h-4 mr-2" /> {t('reset')}
          </Button>
          <Button variant="sketchbookPrimary" size="sm" aria-label="Export Canvas" className="h-[40px] rounded-[6px] px-[20px] text-[14px] text-accent" onClick={() => handleExport(stageRef, 'png')}>
            <span className="mr-2">→</span> {t('export')} PNG
          </Button>
        </div>
      </div>
    </div>
  )
}
