import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import { exportCanvas } from '@/lib/export'
import { Slider } from '@/components/ui/slider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'

import { CanvasRatio } from '@/store/useStore'
import type Konva from 'konva'

export function DesktopToolbar({ stageRef, className = '' }: { stageRef: React.MutableRefObject<Konva.Stage | null>, className?: string }) {
  const { canvasRatio, setCanvasRatio, zoom, setZoom, resetAll } = useStore()
  const t = useTranslations('DesktopToolbar')
  const layoutT = useTranslations('LayoutSettings')
  const locale = useLocale()

  return (
    <div className={`flex items-center justify-between h-[60px] px-4 bg-white border-b border-slate-200 z-10 shrink-0 ${className}`}>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{t('ratio')}</span>
        <div className="flex bg-slate-100 p-1 rounded-full">
          {['auto', '16:9', '2:1'].map((ratio) => (
            <button
              key={ratio}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                canvasRatio === ratio ? 'bg-white shadow-sm font-medium text-primary' : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
              onClick={() => setCanvasRatio(ratio as CanvasRatio)}
            >
              {ratio === 'auto' ? layoutT('ratioAuto') : ratio.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full">
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" aria-label={t('zoomOut')} onClick={() => setZoom(Math.max(10, zoom - 10))}>
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <div className="w-24 px-2">
          <Slider 
            value={[zoom]} 
            onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)}
            min={10} max={200} step={1} 
          />
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" aria-label={t('zoomIn')} onClick={() => setZoom(Math.min(200, zoom + 10))}>
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs font-medium w-12 text-center text-slate-500">{zoom}%</span>
      </div>

      <div className="flex items-center gap-4">
        <Link href={`/${locale}/blog`} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Blog
        </Link>
        <LanguageSwitcher />
        <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
          <Button variant="outline" size="sm" onClick={resetAll} className="h-8 rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" /> {t('reset')}
          </Button>
          <Button size="sm" className="h-8 rounded-full px-4" onClick={() => exportCanvas(stageRef, 'png')}>
            <Download className="w-4 h-4 mr-2" /> {t('export')} (PNG)
          </Button>
        </div>
      </div>
    </div>
  )
}
