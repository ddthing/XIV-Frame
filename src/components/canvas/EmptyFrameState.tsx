'use client'

import { Loader2, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import type { CanvasRatio, LayoutPreset } from '@/store/useStore'

interface EmptyFrameStateProps {
  canvasRatio: CanvasRatio
  isUploading: boolean
  layoutPreset: LayoutPreset
  uploadError: string | null
}

const FRAME_CELLS: Record<LayoutPreset, number> = {
  split: 2,
  'vertical-split': 2,
  grid: 4,
}

const FRAME_GRID: Record<LayoutPreset, string> = {
  split: 'grid-cols-2',
  'vertical-split': 'grid-rows-2',
  grid: 'grid-cols-2 grid-rows-2',
}

export function EmptyFrameState({ canvasRatio, isUploading, layoutPreset, uploadError }: EmptyFrameStateProps) {
  const t = useTranslations('CanvasPreview')
  const layoutT = useTranslations('LayoutSettings')
  const imageT = useTranslations('ImageUploader')

  const layoutLabel = layoutPreset === 'split'
    ? layoutT('presetSplit')
    : layoutPreset === 'vertical-split'
      ? layoutT('presetVertical')
      : layoutT('presetGrid')
  const layoutDescription = layoutPreset === 'split'
    ? layoutT('presetSplitDescription')
    : layoutPreset === 'vertical-split'
      ? layoutT('presetVerticalDescription')
      : layoutT('presetGridDescription')
  const ratioLabel = canvasRatio === 'auto' ? layoutT('ratioAuto') : canvasRatio
  const aspectRatio = canvasRatio === '2:1' ? '2 / 1' : '16 / 9'

  return (
    <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center bg-background px-4 py-6 sm:px-8">
      <div className="grid w-full max-w-5xl items-center gap-6 md:grid-cols-[minmax(0,1fr)_14rem] lg:gap-9 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="editor-meta">{t('framePreview')}</span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{ratioLabel}</span>
          </div>

          <div
            className="relative w-full overflow-hidden rounded-xl border border-line-strong bg-card p-2 shadow-xl sm:p-3"
            style={{ aspectRatio }}
            aria-hidden="true"
          >
            <div className={`grid size-full gap-2 ${FRAME_GRID[layoutPreset]}`}>
              {Array.from({ length: FRAME_CELLS[layoutPreset] }, (_, index) => (
                <span key={index} className="relative min-h-0 min-w-0 overflow-hidden rounded-md bg-muted/75">
                  <span className="absolute left-3 top-3 font-mono text-[10px] font-semibold tabular-nums text-muted-foreground/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="absolute bottom-3 right-3 size-2 rounded-sm border border-foreground/15" />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col items-start">
          <span className="editor-meta">{t('selectedLayout')}</span>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">{layoutLabel}</h2>
          <p className="mt-2 max-w-[28rem] text-sm leading-6 text-muted-foreground">{layoutDescription}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-10 rounded-md px-4 text-xs font-bold"
              onClick={() => window.dispatchEvent(new CustomEvent('xiv-frame:open-image'))}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <Upload aria-hidden="true" className="size-4" />}
              {isUploading ? imageT('uploading') : t('addPhotos')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 rounded-md px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => window.dispatchEvent(new CustomEvent('xiv-frame:open-layout'))}
              disabled={isUploading}
            >
              {t('changeLayout')}
            </Button>
          </div>

          <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{imageT('dropHint')}</span>
          {uploadError && (
            <p role="alert" className="mt-4 text-xs leading-5 text-destructive">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
