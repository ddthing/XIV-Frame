'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'
import {
  Brush,
  Eraser,
  FlipHorizontal,
  Loader2,
  Moon,
  RotateCcw,
  Trash2,
  Undo2,
  Upload,
  WandSparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EditorChoice, EditorFieldHeader, EditorSection } from '@/components/ui/editor'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { imageDataToDataUrl, dataUrlToImageData, prepareCharacterImage, removeImageBackground, warmBackgroundRemovalModel } from '@/lib/backgroundRemoval'
import { ImageUploadError } from '@/lib/imageUpload'
import { useStore } from '@/store/useStore'

const MAX_UNDO_STEPS = 8

type BrushMode = 'erase' | 'restore'
type PixelState = { data: Uint8ClampedArray; width: number; height: number }
type PointerPosition = { clientX: number; clientY: number }

function drawPixels(canvas: HTMLCanvasElement | null, pixels: PixelState | null) {
  if (!canvas || !pixels) return
  canvas.width = pixels.width
  canvas.height = pixels.height
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, pixels.width, pixels.height)
  const imageData = new ImageData(pixels.width, pixels.height)
  imageData.data.set(pixels.data)
  context.putImageData(imageData, 0, 0)
}

function drawPixelsRegion(canvas: HTMLCanvasElement | null, pixels: PixelState, x: number, y: number, width: number, height: number) {
  if (!canvas || width <= 0 || height <= 0) return
  const context = canvas.getContext('2d')
  if (!context) return
  const imageData = new ImageData(pixels.data as unknown as Uint8ClampedArray<ArrayBuffer>, pixels.width, pixels.height)
  context.putImageData(imageData, 0, 0, x, y, width, height)
}

export function CharacterSettings() {
  const {
    characterSourceUrl,
    setCharacterSourceUrl,
    characterCutoutUrl,
    setCharacterCutoutUrl,
    setCharacterPosition,
    characterScale,
    setCharacterScale,
    characterOpacity,
    setCharacterOpacity,
    characterFlipX,
    setCharacterFlipX,
    characterShadow,
    setCharacterShadow,
  } = useStore(useShallow((state) => ({
    characterSourceUrl: state.characterSourceUrl,
    setCharacterSourceUrl: state.setCharacterSourceUrl,
    characterCutoutUrl: state.characterCutoutUrl,
    setCharacterCutoutUrl: state.setCharacterCutoutUrl,
    setCharacterPosition: state.setCharacterPosition,
    characterScale: state.characterScale,
    setCharacterScale: state.setCharacterScale,
    characterOpacity: state.characterOpacity,
    setCharacterOpacity: state.setCharacterOpacity,
    characterFlipX: state.characterFlipX,
    setCharacterFlipX: state.setCharacterFlipX,
    characterShadow: state.characterShadow,
    setCharacterShadow: state.setCharacterShadow,
  })))
  const t = useTranslations('SignatureSettings')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sourceBlobRef = useRef<Blob | null>(null)
  const originalPixelsRef = useRef<PixelState | null>(null)
  const workingPixelsRef = useRef<PixelState | null>(null)
  const undoStackRef = useRef<Uint8ClampedArray[]>([])
  const paintingRef = useRef(false)
  const paintFrameRef = useRef<number | null>(null)
  const lastPointerRef = useRef<PointerPosition | null>(null)
  const fileRequestRef = useRef(0)
  const processingRequestRef = useRef(0)
  const sourcePreview = characterSourceUrl
  const [workingPixels, setWorkingPixels] = useState<PixelState | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [brushMode, setBrushMode] = useState<BrushMode>('erase')
  const [brushSize, setBrushSize] = useState(72)
  const [isPreparing, setIsPreparing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [undoCount, setUndoCount] = useState(0)

  useEffect(() => {
    if (!editorOpen) return
    drawPixels(canvasRef.current, workingPixels)
  }, [editorOpen, workingPixels])

  useEffect(() => () => {
    fileRequestRef.current += 1
    processingRequestRef.current += 1
    if (paintFrameRef.current !== null) {
      window.cancelAnimationFrame(paintFrameRef.current)
      paintFrameRef.current = null
    }
  }, [])

  const syncWorkingPixels = (next: PixelState) => {
    workingPixelsRef.current = next
    setWorkingPixels(next)
    drawPixels(canvasRef.current, next)
  }

  const openEditorFromCutout = async () => {
    if (workingPixelsRef.current || !characterCutoutUrl) {
      setEditorOpen(true)
      return
    }

    try {
      const pixels = await dataUrlToImageData(characterCutoutUrl)
      const next = { data: pixels.data.slice(), width: pixels.width, height: pixels.height }
      originalPixelsRef.current = next
      undoStackRef.current = []
      syncWorkingPixels(next)
      setEditorOpen(true)
    } catch {
      setError(t('characterEditorError'))
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    const requestId = ++fileRequestRef.current
    processingRequestRef.current += 1

    setError(null)

    try {
      const prepared = await prepareCharacterImage(file)
      if (requestId !== fileRequestRef.current) return

      sourceBlobRef.current = prepared.blob
      void warmBackgroundRemovalModel().catch(() => undefined)
      setCharacterSourceUrl(prepared.dataUrl)
      setCharacterCutoutUrl(null)
      setCharacterPosition(null)
      originalPixelsRef.current = null
      workingPixelsRef.current = null
      setWorkingPixels(null)
      setEditorOpen(false)
      undoStackRef.current = []
      setUndoCount(0)
    } catch (cause) {
      if (requestId !== fileRequestRef.current) return
      if (cause instanceof ImageUploadError && cause.code === 'invalid-type') {
        setError(t('characterFileTypeError'))
      } else if (cause instanceof ImageUploadError && cause.code === 'too-large') {
        setError(t('characterFileTooLarge'))
      } else {
        setError(t('characterEditorError'))
      }
    }
  }

  const handleRemoveBackground = async () => {
    if (!sourcePreview || isPreparing) return
    const requestId = ++processingRequestRef.current
    const sourceUrl = sourcePreview
    const sourceBlob = sourceBlobRef.current

    setIsPreparing(true)
    setProgress(3)
    setError(null)

    try {
      const blob = sourceBlob ?? await (async () => {
        const response = await fetch(sourceUrl)
        if (!response.ok) throw new Error('이미지를 읽지 못했습니다.')
        return response.blob()
      })()
      const result = await removeImageBackground(blob, (nextProgress) => {
        if (requestId === processingRequestRef.current) setProgress(nextProgress)
      })
      if (requestId !== processingRequestRef.current) return

      const original = { data: result.data.slice(), width: result.width, height: result.height }
      originalPixelsRef.current = original
      undoStackRef.current = []
      setUndoCount(0)
      syncWorkingPixels({ data: result.data.slice(), width: result.width, height: result.height })
      setCharacterCutoutUrl(imageDataToDataUrl(result.data, result.width, result.height))
      setCharacterPosition(null)
      setEditorOpen(true)
    } catch (cause) {
      if (requestId !== processingRequestRef.current) return
      console.error('Background removal failed', cause)
      setError(t('characterProcessingError'))
    } finally {
      if (requestId === processingRequestRef.current) {
        setIsPreparing(false)
        setProgress(0)
      }
    }
  }

  const saveWorkingPixels = (pixels: PixelState | null) => {
    if (!pixels) return
    setCharacterCutoutUrl(imageDataToDataUrl(pixels.data, pixels.width, pixels.height))
  }

  const paintAt = (point: PointerPosition) => {
    const canvas = canvasRef.current
    const working = workingPixelsRef.current
    const original = originalPixelsRef.current
    if (!canvas || !working || !original) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / Math.max(1, rect.width)
    const scaleY = canvas.height / Math.max(1, rect.height)
    const centerX = Math.max(0, Math.min(canvas.width - 1, (point.clientX - rect.left) * scaleX))
    const centerY = Math.max(0, Math.min(canvas.height - 1, (point.clientY - rect.top) * scaleY))
    const radius = brushSize * Math.max(scaleX, scaleY) * 0.5
    const radiusSquared = radius * radius
    const inverseRadius = 1 / Math.max(1, radius)
    const minX = Math.max(0, Math.floor(centerX - radius))
    const maxX = Math.min(canvas.width - 1, Math.ceil(centerX + radius))
    const minY = Math.max(0, Math.floor(centerY - radius))
    const maxY = Math.min(canvas.height - 1, Math.ceil(centerY + radius))
    const workingData = working.data
    const originalData = original.data
    const mode = brushMode

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const deltaX = x - centerX
        const deltaY = y - centerY
        const distanceSquared = (deltaX * deltaX) + (deltaY * deltaY)
        if (distanceSquared > radiusSquared) continue
        const influence = Math.max(0, 1 - Math.sqrt(distanceSquared) * inverseRadius)
        const alphaIndex = (y * canvas.width + x) * 4 + 3
        const currentAlpha = workingData[alphaIndex]
        const originalAlpha = originalData[alphaIndex]
        workingData[alphaIndex] = mode === 'erase'
          ? Math.round(currentAlpha * (1 - influence))
          : Math.max(currentAlpha, Math.round(originalAlpha * influence))
      }
    }

    drawPixelsRegion(canvas, working, minX, minY, maxX - minX + 1, maxY - minY + 1)
  }

  const schedulePaint = (event: PointerEvent<HTMLCanvasElement>) => {
    lastPointerRef.current = { clientX: event.clientX, clientY: event.clientY }
    if (paintFrameRef.current !== null) return

    paintFrameRef.current = window.requestAnimationFrame(() => {
      paintFrameRef.current = null
      const point = lastPointerRef.current
      if (paintingRef.current && point) paintAt(point)
    })
  }

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const working = workingPixelsRef.current
    if (!working) return
    event.currentTarget.setPointerCapture(event.pointerId)
    paintingRef.current = true
    undoStackRef.current = [...undoStackRef.current.slice(-(MAX_UNDO_STEPS - 1)), working.data.slice()]
    setUndoCount(undoStackRef.current.length)
    schedulePaint(event)
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (paintingRef.current) schedulePaint(event)
  }

  const handlePointerUp = () => {
    if (!paintingRef.current) return
    const pendingFrame = paintFrameRef.current
    if (pendingFrame !== null) {
      window.cancelAnimationFrame(pendingFrame)
      paintFrameRef.current = null
      const point = lastPointerRef.current
      if (point) paintAt(point)
    }
    paintingRef.current = false
    lastPointerRef.current = null
    saveWorkingPixels(workingPixelsRef.current)
  }

  const handleUndo = () => {
    const previous = undoStackRef.current.pop()
    const working = workingPixelsRef.current
    if (!previous || !working) return
    setUndoCount(undoStackRef.current.length)
    syncWorkingPixels({ data: previous.slice(), width: working.width, height: working.height })
    saveWorkingPixels(workingPixelsRef.current)
  }

  const handleRestoreModelResult = () => {
    const original = originalPixelsRef.current
    if (!original) return
    undoStackRef.current = [...undoStackRef.current.slice(-(MAX_UNDO_STEPS - 1)), workingPixelsRef.current?.data.slice() ?? original.data.slice()]
    setUndoCount(undoStackRef.current.length)
    const next = { data: original.data.slice(), width: original.width, height: original.height }
    syncWorkingPixels(next)
    saveWorkingPixels(next)
  }

  const handleClear = () => {
    fileRequestRef.current += 1
    processingRequestRef.current += 1
    setCharacterSourceUrl(null)
    setCharacterCutoutUrl(null)
    sourceBlobRef.current = null
    originalPixelsRef.current = null
    workingPixelsRef.current = null
    setWorkingPixels(null)
    paintingRef.current = false
    lastPointerRef.current = null
    setEditorOpen(false)
    setCharacterPosition(null)
    undoStackRef.current = []
    setUndoCount(0)
  }

  return (
    <div className="space-y-6 font-sans">
      <EditorSection title={t('characterTitle')} description={t('characterDescription')}>
        <div className="space-y-4">
          <div className="rounded-xl border border-primary/15 bg-sticky-note-mint/35 px-4 py-3">
            <div className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-card text-primary shadow-subtle">
                <WandSparkles className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{t('characterPrivacyTitle')}</p>
                <p className="mt-1 font-body text-[12px] leading-5 text-muted-foreground">{t('characterPrivacyDescription')}</p>
              </div>
            </div>
          </div>

          {!sourcePreview ? (
            <label htmlFor="character-file-input" className="relative flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/25 bg-card px-4 text-center transition-colors hover:bg-surface-inset/70 focus-within:ring-2 focus-within:ring-ring/50">
              <span className="grid size-8 place-items-center rounded-md bg-surface-inset text-foreground"><Upload className="size-3.5" aria-hidden="true" /></span>
              <span className="text-xs font-semibold text-foreground">{t('characterUploadLabel')}</span>
              <span className="font-body text-[11px] text-muted-foreground">{t('characterUploadHint')}</span>
              <input ref={fileInputRef} id="character-file-input" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 z-10 size-full cursor-pointer opacity-0" aria-label={t('characterUploadLabel')} />
            </label>
          ) : (
            <div className="space-y-3">
              <input ref={fileInputRef} id="character-file-input" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" aria-label={t('characterUploadLabel')} />
              <div className="grid grid-cols-2 gap-2">
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t('characterOriginal')}</div>
                  <img src={sourcePreview} alt={t('characterOriginal')} className="aspect-square w-full object-contain bg-surface-inset/70 p-2" />
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{t('characterResult')}</div>
                  {characterCutoutUrl ? (
                    <img src={characterCutoutUrl} alt={t('characterResult')} className="checkerboard aspect-square w-full object-contain p-2" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-surface-inset/70 p-2 text-center font-body text-[11px] leading-4 text-muted-foreground">{t('characterResultEmpty')}</div>
                  )}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" size="sm" className="h-10 rounded-md" onClick={() => fileInputRef.current?.click()} disabled={isPreparing}>
                  <Upload className="size-3.5" aria-hidden="true" /> {t('characterChange')}
                </Button>
                <Button type="button" size="sm" className="h-10 rounded-md" onClick={handleRemoveBackground} disabled={isPreparing}>
                  {isPreparing ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <WandSparkles className="size-3.5" aria-hidden="true" />}
                  {isPreparing ? t('characterProcessing') : t('characterRemoveBackground')}
                </Button>
              </div>

              {isPreparing && (
                <div className="space-y-2 rounded-lg border border-border bg-card px-3 py-3">
                  <div className="flex items-center justify-between gap-3 font-body text-[11px] text-muted-foreground">
                    <span>{t('characterProcessingHint')}</span>
                    <span className="font-mono tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-[width]" style={{ width: `${Math.max(4, progress)}%` }} /></div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-full rounded-md border-destructive/35 text-destructive hover:border-destructive/50 hover:bg-destructive/10"
                onClick={handleClear}
                disabled={isPreparing}
              >
                <Trash2 className="size-3.5" aria-hidden="true" /> {t('characterDelete')}
              </Button>
            </div>
          )}
        </div>
      </EditorSection>

      {characterCutoutUrl && (
        <EditorSection title={t('characterRefineTitle')} description={t('characterRefineDescription')} className="border-t border-border pt-5">
          <div className="space-y-3">
            <div className="checkerboard overflow-hidden rounded-xl border border-border bg-card p-3">
              {editorOpen ? (
                <canvas
                  ref={canvasRef}
                  aria-label={t('characterEditorLabel')}
                  className="mx-auto block max-h-[360px] w-full max-w-full cursor-crosshair touch-none object-contain"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                />
              ) : (
                <img src={characterCutoutUrl} alt={t('characterResult')} className="mx-auto block max-h-[360px] w-full object-contain" />
              )}
            </div>

            {editorOpen ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <EditorChoice active={brushMode === 'erase'} onClick={() => setBrushMode('erase')}>
                    <Eraser className="size-3.5" aria-hidden="true" /> {t('characterErase')}
                  </EditorChoice>
                  <EditorChoice active={brushMode === 'restore'} onClick={() => setBrushMode('restore')}>
                    <Brush className="size-3.5" aria-hidden="true" /> {t('characterRestore')}
                  </EditorChoice>
                </div>
                <div className="space-y-2 rounded-lg border border-border bg-card p-3">
                  <EditorFieldHeader label={t('characterBrushSize')} value={`${brushSize}px`} htmlFor="character-brush-size" />
                  <Slider id="character-brush-size" value={[brushSize]} min={16} max={220} step={1} onValueChange={(values) => setBrushSize(Array.isArray(values) ? values[0] : values)} />
                  <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('characterBrushHint')}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="h-10 flex-1 rounded-md" onClick={handleUndo} disabled={undoCount === 0}>
                    <Undo2 className="size-3.5" aria-hidden="true" /> {t('characterUndo')}
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-10 flex-1 rounded-md" onClick={handleRestoreModelResult}>
                    <RotateCcw className="size-3.5" aria-hidden="true" /> {t('characterResetMask')}
                  </Button>
                </div>
              </>
            ) : (
              <Button type="button" variant="outline" size="sm" className="h-10 w-full rounded-md" onClick={() => void openEditorFromCutout()}>
                <Brush className="size-3.5" aria-hidden="true" /> {t('characterOpenEditor')}
              </Button>
            )}
          </div>
        </EditorSection>
      )}

      {characterCutoutUrl && (
        <EditorSection title={t('characterPlacementTitle')} description={t('characterPlacementDescription')} className="border-t border-border pt-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <EditorFieldHeader label={t('characterScale')} value={`${Math.round(characterScale * 100)}%`} htmlFor="character-scale" />
              <Slider id="character-scale" value={[characterScale]} min={0.25} max={2.4} step={0.01} onValueChange={(values) => setCharacterScale(Array.isArray(values) ? values[0] : values)} />
            </div>
            <div className="space-y-2">
              <EditorFieldHeader label={t('opacity')} value={`${characterOpacity}%`} htmlFor="character-opacity" />
              <Slider id="character-opacity" value={[characterOpacity]} min={0} max={100} step={1} onValueChange={(values) => setCharacterOpacity(Array.isArray(values) ? values[0] : values)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <EditorChoice active={characterFlipX} onClick={() => setCharacterFlipX(!characterFlipX)}>
                <FlipHorizontal className="size-3.5" aria-hidden="true" /> {t('characterFlip')}
              </EditorChoice>
              <div className="flex min-h-10 items-center justify-between rounded-md border border-border bg-card px-3">
                <span className="inline-flex items-center gap-2 text-xs font-semibold"><Moon className="size-3.5" aria-hidden="true" />{t('characterShadow')}</span>
                <Switch checked={characterShadow} onCheckedChange={setCharacterShadow} size="sm" aria-label={t('characterShadow')} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('characterDragHint')}</p>
              <button type="button" className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground" onClick={() => setCharacterPosition(null)}>
                <RotateCcw className="size-3.5" aria-hidden="true" /> {t('characterResetPosition')}
              </button>
            </div>
          </div>
        </EditorSection>
      )}

      {error && <p role="alert" className="font-body text-[11px] leading-4 text-destructive">{error}</p>}
      <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('characterModelNote')}</p>
    </div>
  )
}
