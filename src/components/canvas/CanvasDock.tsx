'use client'

import { useEffect, useRef } from 'react'
import { Grid3X3, Keyboard, Maximize2, Minimize2, Scan, ZoomIn, ZoomOut } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useCanvasActions } from '@/hooks/useCanvasActions'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { EditorHelpPopover } from '@/components/ui/EditorHelpPopover'
import { useStore } from '@/store/useStore'

interface CanvasDockProps {
  isFocusMode: boolean
  onFitToView: () => void
  onToggleFocus: () => void
  className?: string
}

export function CanvasDock({ isFocusMode, onFitToView, onToggleFocus, className = '' }: CanvasDockProps) {
  const { zoom, handleZoomIn, handleZoomOut, handleZoomChange } = useCanvasActions()
  const t = useTranslations('DesktopToolbar')
  const studio = useTranslations('Studio')
  const imageCount = useStore(state => state.images.filter(Boolean).length)
  const showGuides = useStore(state => state.showGuides)
  const focusButtonRef = useRef<HTMLButtonElement>(null)
  const hasMountedRef = useRef(false)

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    focusButtonRef.current?.focus({ preventScroll: true })
  }, [isFocusMode])

  return (
    <div
      role="toolbar"
      aria-label={t('canvasControls')}
      className={`relative flex min-h-14 shrink-0 items-center justify-between gap-2 border-t border-border bg-card px-4 py-2 ${className}`}
    >
      <div className="flex shrink-0 items-center gap-3">
        <Button type="button" variant={showGuides ? 'secondary' : 'ghost'} size="icon" className="size-10" aria-label={studio('guides')} title={studio('guidesHint')} aria-pressed={showGuides} onClick={() => useStore.getState().setShowGuides(!showGuides)}><Grid3X3 className="size-4" aria-hidden="true" /></Button>
        <span className="hidden font-mono text-[10px] text-muted-foreground lg:inline">{String(imageCount).padStart(2, '0')} / 04</span>
        <details className="relative">
          <summary aria-label={studio('shortcuts')} title={studio('shortcuts')} className="grid size-10 cursor-pointer list-none place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"><Keyboard className="size-4" aria-hidden="true" /></summary>
          <div className="absolute bottom-12 left-0 z-30 w-64 rounded-xl border border-border bg-card p-4 text-xs shadow-xl">
            <p className="mb-3 font-semibold">{studio('shortcuts')}</p>
            {[[studio('undo'), 'Ctrl / ⌘ Z'], [studio('redo'), 'Ctrl / ⌘ ⇧ Z'], [studio('saveProject'), 'Ctrl / ⌘ S'], [studio('export'), 'Ctrl / ⌘ ⇧ S'], [studio('switchStep'), '1 · 2 · 3'], [studio('guides'), 'G'], [studio('focus'), 'F / Esc']].map(([label, key]) => <p key={key} className="flex justify-between gap-3 py-1.5 text-muted-foreground"><span>{label}</span><kbd className="font-mono text-[10px]">{key}</kbd></p>)}
          </div>
        </details>
      </div>
      <div className="flex min-w-0 items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-10 gap-1.5 px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={t('fitToView')}
          title={t('fitToView')}
          onClick={onFitToView}
        >
          <Scan aria-hidden="true" className="size-4" />
          <span className="hidden xl:inline">{t('fitToView')}</span>
        </Button>

        <div className="flex min-w-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t('zoomOut')}
            title={t('zoomOut')}
            onClick={handleZoomOut}
          >
            <ZoomOut aria-hidden="true" className="size-4" />
          </Button>
          <div className="w-[clamp(6rem,12vw,11rem)] px-2">
            <Slider
              value={[zoom]}
              onValueChange={handleZoomChange}
              min={10}
              max={200}
              step={1}
              aria-label={`${t('zoom')} ${zoom}%`}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t('zoomIn')}
            title={t('zoomIn')}
            onClick={handleZoomIn}
          >
            <ZoomIn aria-hidden="true" className="size-4" />
          </Button>
          <output className="min-w-12 px-1 text-center font-mono text-[11px] font-semibold tabular-nums text-muted-foreground" aria-live="polite">
            {zoom}%
          </output>
        </div>

        <Button
          ref={focusButtonRef}
          type="button"
          variant={isFocusMode ? 'secondary' : 'ghost'}
          size="lg"
          className="h-10 gap-1.5 px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-pressed={isFocusMode}
          aria-label={isFocusMode ? t('exitFocusMode') : t('focusMode')}
          title={isFocusMode ? t('exitFocusMode') : t('focusMode')}
          onClick={onToggleFocus}
        >
          {isFocusMode ? <Minimize2 aria-hidden="true" className="size-4" /> : <Maximize2 aria-hidden="true" className="size-4" />}
          <span className="hidden xl:inline">{isFocusMode ? t('exitFocusMode') : t('focusMode')}</span>
        </Button>
        <EditorHelpPopover description={t('canvasHelp')} className="hidden md:inline-grid" />
      </div>
    </div>
  )
}
