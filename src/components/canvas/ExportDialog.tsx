'use client'

import { useEffect, useId, useState, type RefObject } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { AlertCircle, ArrowDownToLine, Check, ImageIcon, Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'
import type Konva from 'konva'

import { Button } from '@/components/ui/button'
import { EditorRadio } from '@/components/ui/editor'
import { Input } from '@/components/ui/input'
import { canExportOriginal, getExportDimensions, type ExportFormat, type ExportSize } from '@/lib/canvasGeometry'
import { exportCanvas, getStageDimensions, isStageReady } from '@/lib/export'
import { useStore } from '@/store/useStore'

interface ExportFormProps {
  stageRef: RefObject<Konva.Stage | null>
}

/** Shared by the desktop dialog and mobile save sheet. */
export function ExportForm({ stageRef }: ExportFormProps) {
  const t = useTranslations('ExportSettings')
  const id = useId()
  const state = useStore(useShallow(store => ({
    images: store.images,
    canvasRatio: store.canvasRatio,
    layoutPreset: store.layoutPreset,
    imageGap: store.imageGap,
    imageTransition: store.imageTransition,
    blendWidth: store.blendWidth,
    borderWidth: store.borderWidth,
    backgroundColor: store.backgroundColor,
    isExporting: store.isExporting,
    isCanvasLoading: store.isCanvasLoading,
  })))
  const [format, setFormat] = useState<ExportFormat>('png')
  const [size, setSize] = useState<ExportSize>(4096)
  const [filename, setFilename] = useState('xiv-frame')
  const [logicalSize, setLogicalSize] = useState<{ width: number; height: number } | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const hasImages = state.images.some(Boolean)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stage = stageRef.current
      setLogicalSize(stage && isStageReady(stage, state.images) ? getStageDimensions(stage) : null)
    })
    return () => cancelAnimationFrame(frame)
  }, [stageRef, state])

  const allowOriginal = logicalSize ? canExportOriginal(logicalSize.width, logicalSize.height) : false
  const effectiveSize = size === 'original' && !allowOriginal ? 4096 : size
  const dimensions = logicalSize ? getExportDimensions(logicalSize.width, logicalSize.height, effectiveSize) : null
  const disabled = !hasImages || state.isCanvasLoading || !dimensions || state.isExporting

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (disabled) return
    setStatus(null)
    try {
      const result = await exportCanvas(stageRef, { format, size: effectiveSize, filename })
      setStatus({ type: 'success', message: t('success', { filename: result.filename }) })
    } catch {
      setStatus({ type: 'error', message: t('error') })
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5" aria-busy={state.isExporting}>
      <fieldset className="space-y-5" disabled={state.isExporting}>
        <div>
          <p id={`${id}-format`} className="mb-2 text-xs font-semibold">{t('format')}</p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby={`${id}-format`}>
            {(['png', 'jpeg'] as const).map(value => (
              <EditorRadio
                key={value}
                checked={format === value}
                onClick={() => { setFormat(value); setStatus(null) }}
                className={`flex min-h-20 flex-col items-start justify-center rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${format === value ? 'border-primary bg-muted' : 'border-border bg-background hover:bg-muted/50'}`}
              >
                <span className="flex w-full items-center justify-between text-sm font-semibold">
                  {value.toUpperCase()}
                  {format === value && <Check aria-hidden="true" className="size-4" />}
                </span>
                <span className="mt-1 text-[11px] leading-4 text-muted-foreground">{t(value === 'png' ? 'pngDescription' : 'jpegDescription')}</span>
              </EditorRadio>
            ))}
          </div>
        </div>

        <div>
          <p id={`${id}-size`} className="mb-2 text-xs font-semibold">{t('size')}</p>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1" role="radiogroup" aria-labelledby={`${id}-size`}>
            {([2048, 4096, 'original'] as const).map(value => (
              <EditorRadio
                key={value}
                checked={effectiveSize === value}
                disabled={value === 'original' && !allowOriginal}
                onClick={() => { setSize(value); setStatus(null) }}
                className={`min-h-12 rounded-md px-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 ${effectiveSize === value ? 'bg-card text-foreground shadow-subtle' : 'text-muted-foreground hover:bg-background/60'}`}
              >
                {value === 'original' ? t('original') : value === 2048 ? '2K' : '4K'}
                {value !== 'original' && <span className="mt-0.5 block font-mono text-[10px] font-normal text-muted-foreground">{value} px</span>}
              </EditorRadio>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{logicalSize && !allowOriginal ? t('originalLimit') : t('sizeHint')}</p>
        </div>

        <div>
          <label htmlFor={`${id}-filename`} className="mb-2 block text-xs font-semibold">{t('filename')}</label>
          <div className="flex items-center gap-2">
            <Input
              id={`${id}-filename`}
              value={filename}
              onChange={event => { setFilename(event.target.value); setStatus(null) }}
              maxLength={100}
              placeholder="xiv-frame"
              autoComplete="off"
              className="h-11 rounded-md text-sm"
            />
            <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">.{format === 'jpeg' ? 'jpg' : 'png'}</span>
          </div>
        </div>
      </fieldset>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-card"><ImageIcon aria-hidden="true" className="size-4 text-muted-foreground" /></span>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">{t('output')}</p>
          <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums" aria-live="polite">
            {dimensions ? `${dimensions.width.toLocaleString()} × ${dimensions.height.toLocaleString()} px` : t('preparing')}
          </p>
        </div>
        <span className="ml-auto text-[10px] font-semibold text-muted-foreground">{format.toUpperCase()}</span>
      </div>

      <p className="text-[11px] leading-5 text-muted-foreground">
        {format === 'jpeg' && state.backgroundColor === 'transparent' ? t('jpegBackground') : t('previewHint')}
      </p>

      {!hasImages && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{t('empty')}</p>}
      {hasImages && state.isCanvasLoading && <p id={`${id}-hint`} role="status" className="text-xs text-muted-foreground">{t('loading')}</p>}
      {status && (
        <p role={status.type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 text-xs leading-5 ${status.type === 'error' ? 'text-destructive' : 'text-foreground'}`}>
          {status.type === 'error' ? <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
          <span className="min-w-0 break-words">{status.message}</span>
        </p>
      )}

      <Button type="submit" disabled={disabled} aria-describedby={!hasImages || state.isCanvasLoading ? `${id}-hint` : undefined} className="h-12 w-full rounded-lg text-sm font-semibold">
        {state.isExporting ? <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <ArrowDownToLine aria-hidden="true" className="size-4" />}
        {state.isExporting ? t('saving') : t('download', { format: format.toUpperCase() })}
      </Button>
    </form>
  )
}

export function ExportDialog({ open, onOpenChange, stageRef }: ExportFormProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('ExportSettings')
  const isExporting = useStore(state => state.isExporting)

  return (
    <Dialog.Root open={open} onOpenChange={next => { if (!useStore.getState().isExporting) onOpenChange(next) }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-xl outline-none sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="mb-2 font-mono text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">EXPORT STUDIO</p>
              <Dialog.Title className="font-display text-xl font-semibold tracking-tight">{t('title')}</Dialog.Title>
              <Dialog.Description className="mt-2 text-xs leading-5 text-muted-foreground">{t('description')}</Dialog.Description>
            </div>
            <Dialog.Close disabled={isExporting} aria-label={t('close')} className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40">
              <X aria-hidden="true" className="size-4" />
            </Dialog.Close>
          </div>
          <ExportForm stageRef={stageRef} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
