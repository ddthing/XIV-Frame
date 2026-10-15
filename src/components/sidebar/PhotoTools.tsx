'use client'

import { useEffect, useRef, useState } from 'react'
import { Expand, FlipHorizontal2, FlipVertical2, Loader2, RotateCcw, RotateCw, Scan } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'
import { getCanvasDimensions, getImageCellSize } from '@/lib/canvasGeometry'
import { getPhotoFit, transformPhoto, type PhotoOperation } from '@/lib/photoEditing'
import { revokeObjectUrl } from '@/lib/imageUpload'

type Dimensions = { width: number; height: number }

export function PhotoTools({ index, dimensions }: { index: number; dimensions: Record<string, Dimensions> }) {
  const t = useTranslations('PhotoTools')
  const { source, sources, locked, exporting } = useStore(useShallow(state => ({ source: state.images[index], sources: state.images, locked: state.isImageLocked, exporting: state.isExporting })))
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const working = useRef(false)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const size = dimensions[source]
  const sizesReady = sources.every(source => dimensions[source])

  const fit = (mode: 'contain' | 'cover') => {
    const state = useStore.getState()
    if (working.current || state.isImageLocked || state.isExporting) return
    const sizes = state.images.map(source => dimensions[source])
    if (!sizes[index] || sizes.some(size => !size)) return
    const gap = state.imageTransition === 'soft-blend' ? -state.blendWidth : state.imageGap
    const canvas = getCanvasDimensions({ images: sizes, layoutPreset: state.layoutPreset, gap, canvasRatio: state.canvasRatio, borderWidth: state.borderWidth })
    const cell = getImageCellSize(canvas.logicalWidth, canvas.logicalHeight, sizes.length, state.layoutPreset, gap)
    const result = getPhotoFit(sizes[index], cell, mode)
    state.applyEdit({ imageScales: state.images.map((_, i) => i === index ? result.scale : state.imageScales[i] ?? 1), imagePositions: state.images.map((_, i) => i === index ? result.position : state.imagePositions[i] ?? { x: 0, y: 0 }) })
    setNotice(t(mode === 'contain' ? 'contained' : 'covered'))
  }

  const transform = async (operation: PhotoOperation) => {
    const initial = useStore.getState()
    if (working.current || initial.isImageLocked || initial.isExporting || !initial.images[index]) return
    working.current = true
    setBusy(true)
    setNotice(null)
    try {
      const url = await transformPhoto(initial.images[index], operation)
      const current = useStore.getState()
      if (!mounted.current || current.images !== initial.images || current.imagePositions !== initial.imagePositions || current.imageScales !== initial.imageScales || current.isExporting || current.isImageLocked) {
        revokeObjectUrl(url)
        if (mounted.current) setNotice(t('changed'))
        return
      }
      current.setImageAt(index, url)
      setNotice(t('transformed'))
    } catch {
      if (mounted.current) setNotice(t('error'))
    } finally {
      working.current = false
      if (mounted.current) setBusy(false)
    }
  }

  return (
    <div className="photo-tools space-y-3" aria-busy={busy}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">{t('title')}</span>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{size ? `${size.width.toLocaleString()} × ${size.height.toLocaleString()}` : '—'}</span>
      </div>
      <fieldset disabled={busy || locked || exporting} className="space-y-2">
        <legend className="sr-only">{t('title')}</legend>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-10 px-2 text-[11px]" disabled={!sizesReady} onClick={() => fit('contain')}><Scan className="size-3.5" aria-hidden="true" />{t('contain')}</Button>
          <Button variant="outline" className="h-10 px-2 text-[11px]" disabled={!sizesReady} onClick={() => fit('cover')}><Expand className="size-3.5" aria-hidden="true" />{t('cover')}</Button>
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted/65 p-1">
          {([
            ['rotate-left', RotateCcw, 'rotateLeft'], ['rotate-right', RotateCw, 'rotateRight'],
            ['flip-horizontal', FlipHorizontal2, 'flipHorizontal'], ['flip-vertical', FlipVertical2, 'flipVertical'],
          ] as const).map(([operation, Icon, label]) => <Button key={operation} type="button" variant="ghost" className="h-10 px-0" title={t(label)} aria-label={t(label)} onClick={() => void transform(operation)}><Icon className="size-4" aria-hidden="true" /></Button>)}
        </div>
      </fieldset>
      <p className="flex min-h-4 items-start gap-1.5 text-[10px] leading-4 text-muted-foreground" role="status">{busy && <Loader2 className="mt-0.5 size-3 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />}{busy ? t('processing') : notice ?? t('hint')}</p>
    </div>
  )
}
