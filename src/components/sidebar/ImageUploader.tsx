import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronLeft, ChevronRight, Lock, RefreshCw, Trash2, Unlock, Upload, UserRound, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { EditorFieldHeader, EditorSection } from '@/components/ui/editor'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ImageUploadError, prepareImageForCanvas, revokeObjectUrl } from '@/lib/imageUpload'
import { LazyCharacterSettings } from './LazySettings'

type PendingUpload = { requestId: number; sourceUrl: string | undefined }

export function ImageUploader({ idPrefix = 'image' }: { idPrefix?: string }) {
  const {
    images,
    setImages,
    setImageAt,
    removeImageAt,
    swapImages,
    imagePositions,
    imageScales,
    setImageScale,
    setImagePosition,
    isImageLocked,
    setIsImageLocked,
  } = useStore(useShallow(state => ({
    images: state.images,
    setImages: state.setImages,
    setImageAt: state.setImageAt,
    removeImageAt: state.removeImageAt,
    swapImages: state.swapImages,
    imagePositions: state.imagePositions,
    imageScales: state.imageScales,
    setImageScale: state.setImageScale,
    setImagePosition: state.setImagePosition,
    isImageLocked: state.isImageLocked,
    setIsImageLocked: state.setIsImageLocked,
  })))
  const t = useTranslations('ImageUploader')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const uploadRequests = useRef(new Map<number, PendingUpload>())
  const mountedRef = useRef(true)

  useEffect(() => {
    const requests = uploadRequests.current
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requests.clear()
    }
  }, [])

  useEffect(() => {
    const handleCanvasUploadError = (event: Event) => {
      const message = (event as CustomEvent<string>).detail
      if (typeof message === 'string' && message) setUploadError(message)
    }

    window.addEventListener('xiv-frame:upload-error', handleCanvasUploadError)
    return () => window.removeEventListener('xiv-frame:upload-error', handleCanvasUploadError)
  }, [])

  useEffect(() => {
    uploadRequests.current.forEach((pending, index) => {
      if (images[index] !== pending.sourceUrl) {
        uploadRequests.current.set(index, { ...pending, requestId: pending.requestId + 1 })
      }
    })
  }, [images])

  const beginUpload = (index: number) => {
    const requestId = (uploadRequests.current.get(index)?.requestId ?? 0) + 1
    uploadRequests.current.set(index, { requestId, sourceUrl: images[index] })
    return requestId
  }

  const invalidateUpload = (index: number) => {
    const pending = uploadRequests.current.get(index)
    if (!pending) return
    uploadRequests.current.set(index, {
      requestId: pending.requestId + 1,
      sourceUrl: pending.sourceUrl,
    })
  }

  const invalidateAllUploads = () => {
    uploadRequests.current.forEach((pending, index) => {
      uploadRequests.current.set(index, { ...pending, requestId: pending.requestId + 1 })
    })
  }

  const imageCount = images.filter(Boolean).length
  const firstEmptyIndex = images.findIndex(image => !image)
  const nextUploadIndex = firstEmptyIndex >= 0 ? firstEmptyIndex : Math.min(images.length, 3)
  const activeIndex = images[selectedIndex] ? selectedIndex : images.findIndex(Boolean)
  const activeImage = activeIndex >= 0 ? images[activeIndex] : undefined
  const activePosition = activeIndex >= 0 ? imagePositions[activeIndex] || { x: 0, y: 0 } : { x: 0, y: 0 }
  const activeScale = activeIndex >= 0 ? imageScales[activeIndex] || 1 : 1
  const [scaleDraft, setScaleDraft] = useState<string | null>(null)

  const commitScale = () => {
    const draft = scaleDraft ?? String(Math.round(activeScale * 100))
    const value = Number(draft)
    const scale = draft.trim() && Number.isFinite(value)
      ? Math.max(0.5, Math.min(3, value / 100))
      : activeScale
    if (activeIndex >= 0) setImageScale(activeIndex, scale)
    setScaleDraft(null)
  }
  const scaleInputId = `${idPrefix}-selected-image-scale-input`
  const nudgeStep = 10

  const handleFileUpload = (index: number) => {
    setUploadError(null)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return
      const requestId = beginUpload(index)
      const sourceImages = useStore.getState().images

      void prepareImageForCanvas(file)
        .then((url) => {
          if (!mountedRef.current || uploadRequests.current.get(index)?.requestId !== requestId) {
            revokeObjectUrl(url)
            return
          }
          if (useStore.getState().images !== sourceImages) {
            revokeObjectUrl(url)
            uploadRequests.current.delete(index)
            setUploadError(t('uploadCanceled'))
            return
          }

          setImageAt(index, url)
          setSelectedIndex(index)
          setUploadError(null)
          uploadRequests.current.delete(index)
        })
        .catch((error: unknown) => {
          if (!mountedRef.current || uploadRequests.current.get(index)?.requestId !== requestId) return
          setUploadError(error instanceof ImageUploadError && error.code === 'too-large' ? t('uploadLimit') : t('uploadError'))
          uploadRequests.current.delete(index)
        })
    }
    input.click()
  }

  const handleMove = (event: React.MouseEvent, index: number, direction: 'prev' | 'next') => {
    event.stopPropagation()
    const targetIndex = direction === 'prev' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length || !images[targetIndex]) return
    invalidateUpload(index)
    invalidateUpload(targetIndex)
    swapImages(index, targetIndex)
    if (selectedIndex === index) setSelectedIndex(targetIndex)
    else if (selectedIndex === targetIndex) setSelectedIndex(index)
  }

  const handleRemove = (event: React.MouseEvent, index: number) => {
    event.stopPropagation()
    invalidateUpload(index)
    removeImageAt(index)
    setSelectedIndex((current) => {
      if (current > index) return current - 1
      if (current === index) return Math.max(0, Math.min(index, images.length - 2))
      return current
    })
  }

  const nudgePosition = (x: number, y: number) => {
    if (activeIndex < 0 || isImageLocked) return
    setImagePosition(activeIndex, {
      x: activePosition.x + x,
      y: activePosition.y + y,
    })
  }

  const handleSelect = (index: number) => {
    if (images[index]) setSelectedIndex(index)
    else handleFileUpload(index)
  }

  return (
    <div className="space-y-6">
      {uploadError && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-xs leading-4 text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">{uploadError}</span>
          <button type="button" className="grid size-10 shrink-0 place-items-center rounded-md transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40" onClick={() => setUploadError(null)} aria-label={t('dismissError')}>
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{t('imageCount')}</span>
            <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{String(imageCount).padStart(2, '0')} / 04</span>
          </div>

          <EditorSection title={t('uploadTitle')} description={t('uploadDescription')}>
            <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((index) => {
            const image = images[index]
            if (!image && index !== nextUploadIndex) return null
            const selected = Boolean(image) && activeIndex === index

            return (
              <div
                key={index}
                className={`group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border bg-card transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                  selected
                    ? 'border-primary shadow-[inset_0_0_0_2px_var(--primary),var(--shadow-subtle)]'
                    : 'border-border hover:border-primary/30 hover:shadow-subtle'
                }`}
              >
                {image ? (
                  <>
                    <button
                      type="button"
                      aria-label={`${t('selectImage')} ${index + 1}`}
                      aria-pressed={selected}
                      onClick={() => handleSelect(index)}
                      className="absolute inset-0 z-0 size-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/70"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={t('imageLabel', { index: index + 1 })} className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-primary/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    </button>
                    <div className={`absolute inset-x-2 bottom-2 z-10 flex min-w-0 items-center justify-center gap-1.5 transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}>
                      {index > 0 && images[index - 1] && (
                      <button type="button" aria-label={t('movePrevious')} onClick={(event) => handleMove(event, index, 'prev')} className="grid size-10 shrink-0 place-items-center rounded-md border border-primary-foreground/20 bg-background/95 text-foreground shadow-subtle transition-colors hover:bg-background">
                          <ChevronLeft className="size-4" aria-hidden="true" />
                        </button>
                      )}
                      {index < images.length - 1 && images[index + 1] && (
                      <button type="button" aria-label={t('moveNext')} onClick={(event) => handleMove(event, index, 'next')} className="grid size-10 shrink-0 place-items-center rounded-md border border-primary-foreground/20 bg-background/95 text-foreground shadow-subtle transition-colors hover:bg-background">
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <span aria-hidden="true" className="absolute left-2 top-2 grid size-6 place-items-center rounded-md border border-primary-foreground/20 bg-background/90 font-mono text-[10px] font-bold tabular-nums text-foreground shadow-subtle">{String(index + 1).padStart(2, '0')}</span>
                    <button type="button" aria-label={t('deleteImage')} onClick={(event) => handleRemove(event, index)} className={`absolute right-2 top-2 grid size-10 place-items-center rounded-md border border-primary-foreground/20 bg-background/90 text-foreground shadow-subtle transition-all hover:bg-destructive/10 hover:text-destructive ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}>
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    aria-label={`${t('uploadImage')} ${index + 1}`}
                    onClick={() => handleSelect(index)}
                    className="flex size-full flex-col items-center justify-center gap-2 border border-dashed border-primary/20 text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/70 group-hover:bg-surface-inset/60 group-hover:text-foreground"
                  >
                    <span aria-hidden="true" className="grid size-9 place-items-center rounded-md bg-surface-inset text-foreground"><Upload className="size-4" /></span>
                    <span className="text-[13px] font-semibold">{t('uploadImage')} {index + 1}</span>
                  </button>
                )}
              </div>
            )
          })}
            </div>

            {imageCount > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-10 min-w-0 flex-1 rounded-md text-xs" onClick={() => handleFileUpload(activeIndex)}>
                  <RefreshCw className="size-3.5" aria-hidden="true" /> {t('change')}
                </Button>
                <Button variant="outline" size="sm" className="h-10 flex-1 rounded-md text-xs hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={() => { if (!window.confirm(t('clearConfirm'))) return; invalidateAllUploads(); setImages([]); setSelectedIndex(0) }}>
                  <Trash2 className="size-3.5" aria-hidden="true" /> {t('clearAll')}
                </Button>
              </div>
            )}
          </EditorSection>

          {activeImage && activeIndex >= 0 && (
            <EditorSection title={t('selectedImage', { index: activeIndex + 1 })} description={t('selectedImageDescription')}>
              <div className="rounded-xl bg-muted/35 p-3 sm:p-4">
                <div className="space-y-4">
                  <EditorFieldHeader label={t('imageSize', { index: activeIndex + 1 })} value={`${Math.round(activeScale * 100)}%`} htmlFor={scaleInputId} />
                  <div className="flex items-center gap-3">
                    <Slider
                      value={[activeScale]}
                      onValueChange={(values) => setImageScale(activeIndex, Array.isArray(values) ? values[0] : values as number)}
                      min={0.5}
                      max={3}
                      step={0.01}
                      aria-label={t('imageSize', { index: activeIndex + 1 })}
                      className="flex-1"
                    />
                    <div className="relative w-[78px] shrink-0">
                      <Input
                        id={scaleInputId}
                        type="number"
                        className="h-10 pr-6 text-right text-xs font-semibold tabular-nums [&::-webkit-inner-spin-button]:appearance-none"
                        value={scaleDraft ?? String(Math.round(activeScale * 100))}
                        onChange={(event) => {
                          setScaleDraft(event.target.value)
                          const value = Number(event.target.value)
                          if (event.target.value.trim() && Number.isFinite(value) && value >= 50 && value <= 300) setImageScale(activeIndex, value / 100)
                        }}
                        onBlur={commitScale}
                        onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                        min="50"
                        max="300"
                        aria-label={t('imageSize', { index: activeIndex + 1 })}
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isImageLocked ? <Lock className="size-4 text-primary" /> : <Unlock className="size-4 text-muted-foreground" />}
                      <div className="min-w-0">
                        <EditorFieldHeader label={t('lockPosition')} description={t('lockPositionHint')} />
                      </div>
                    </div>
                    <Switch checked={isImageLocked} onCheckedChange={setIsImageLocked} size="sm" aria-label={t('lockPosition')} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-foreground">{t('positionNudge')}</span>
                    <div className="grid grid-cols-3 gap-1" role="group" aria-label={t('positionNudge')}>
                      <span aria-hidden="true" />
                      <Button type="button" variant="outline" size="icon" className="size-10 rounded-md" aria-label={t('nudgeUp')} onClick={() => nudgePosition(0, -nudgeStep)} disabled={isImageLocked}>
                        <ArrowUp aria-hidden="true" />
                      </Button>
                      <span aria-hidden="true" />
                      <Button type="button" variant="outline" size="icon" className="size-10 rounded-md" aria-label={t('nudgeLeft')} onClick={() => nudgePosition(-nudgeStep, 0)} disabled={isImageLocked}>
                        <ArrowLeft aria-hidden="true" />
                      </Button>
                      <Button type="button" variant="outline" size="icon" className="size-10 rounded-md" aria-label={t('nudgeDown')} onClick={() => nudgePosition(0, nudgeStep)} disabled={isImageLocked}>
                        <ArrowDown aria-hidden="true" />
                      </Button>
                      <Button type="button" variant="outline" size="icon" className="size-10 rounded-md" aria-label={t('nudgeRight')} onClick={() => nudgePosition(nudgeStep, 0)} disabled={isImageLocked}>
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <button type="button" onClick={() => { useStore.getState().resetImageTransform(activeIndex) }} className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
                    <RefreshCw className="size-3.5" /> {t('reset')}
                  </button>
                </div>
              </div>
            </EditorSection>
          )}
        <Accordion defaultValue={[]} className="gap-1" aria-label={t('tabCharacter')}>
          <AccordionItem value="character">
            <AccordionTrigger className="min-h-12 py-3 hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
                {t('tabCharacter')}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <LazyCharacterSettings idPrefix={`${idPrefix}-character`} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
