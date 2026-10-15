'use client'

import { ArrowRight, Loader2, Plus, ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import type { CanvasRatio, LayoutPreset } from '@/store/useStore'

interface EmptyFrameStateProps {
  canvasRatio: CanvasRatio
  isUploading: boolean
  layoutPreset: LayoutPreset
  uploadError: string | null
  onAddPhotos: () => void
}

const frameGrid: Record<LayoutPreset, string> = {
  split: 'grid-cols-2', 'vertical-split': 'grid-rows-2', grid: 'grid-cols-2 grid-rows-2',
}

export function EmptyFrameState({ canvasRatio, isUploading, layoutPreset, uploadError, onAddPhotos }: EmptyFrameStateProps) {
  const t = useTranslations('CanvasPreview')
  const studio = useTranslations('Studio')
  const layout = useTranslations('LayoutSettings')
  const label = layout(layoutPreset === 'split' ? 'presetSplit' : layoutPreset === 'grid' ? 'presetGrid' : 'presetVertical')
  const [rw, rh] = (canvasRatio === 'auto' ? '16:9' : canvasRatio).split(':').map(Number)
  const ratio = rw / rh
  const cells = layoutPreset === 'grid' ? 4 : 2

  return (
    <div className="studio-empty flex size-full min-h-0 flex-col items-center justify-center overflow-y-auto px-6 py-8 text-center">
      <div className="mb-5 sm:mb-7">
        <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">XIV FRAME / YOUR CREATIVE WORKSPACE</p>
        <h2 className="mt-3 text-[clamp(23px,2.4vw,36px)] font-semibold leading-[1.3] tracking-[-0.045em]">{studio('emptyTitle')}</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-sm">{studio('emptyDescription')}</p>
      </div>
      <div className="relative mb-7 w-full max-w-[540px]">
        <div className="mx-auto flex items-center justify-center" style={{ height: 'clamp(130px,28vh,260px)' }}>
          <div className="studio-frame relative h-full max-w-full border border-foreground/15 bg-card p-3 shadow-xl sm:p-4" style={{ aspectRatio: ratio }} aria-label={`${label} · ${canvasRatio === 'auto' ? layout('ratioAuto') : canvasRatio}`}>
            <div className={`grid size-full gap-2 ${frameGrid[layoutPreset]}`} aria-hidden="true">
              {Array.from({ length: cells }, (_, index) => (
                <div key={index} className="studio-frame-cell relative grid min-h-0 min-w-0 place-items-center overflow-hidden bg-muted">
                  <span className="absolute left-2 top-2 font-mono text-[9px] text-muted-foreground/70">{String(index + 1).padStart(2, '0')}</span>
                  <Plus className="size-5 stroke-[0.7] text-muted-foreground/40" />
                  <span className="absolute bottom-2 right-2 size-2 border-b border-r border-muted-foreground/25" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-3 font-mono text-[10px] text-muted-foreground">
          <span>{label}</span><span className="h-3 w-px bg-border" /><span>{canvasRatio === 'auto' ? layout('ratioAuto') : canvasRatio}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={onAddPhotos} disabled={isUploading} className="h-11 rounded-md px-5 text-xs font-semibold">
          {isUploading ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
          {isUploading ? studio('preparing') : t('addPhotos')}
          {!isUploading && <ArrowRight className="ml-3 size-3.5" aria-hidden="true" />}
        </Button>
        <Button variant="ghost" type="button" className="h-11 px-4 text-xs text-muted-foreground" onClick={() => window.dispatchEvent(new CustomEvent('xiv-frame:open-layout'))}>{t('changeLayout')}</Button>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">{studio('dropHint')}</p>
      <p className="mt-5 inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"><ShieldCheck className="size-3" aria-hidden="true" />{studio('localOnly')}</p>
      {uploadError && <p role="alert" className="mt-4 max-w-sm text-xs leading-5 text-destructive">{uploadError}</p>}
    </div>
  )
}
