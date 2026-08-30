import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { AlertCircle, ArrowLeftRight, ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Lock, RefreshCw, Trash2, Unlock, Upload, UserRound, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { EditorFieldHeader, EditorSection } from '@/components/ui/editor'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { SketchbookTabsList, SketchbookTabsTrigger } from '@/components/ui/SketchbookTabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ImageUploadError, getImagePreparationMaxDimension, prepareImageForCanvas, revokeObjectUrl } from '@/lib/imageUpload'
import { MAX_IMAGE_COUNT } from '@/lib/imageLimits'
import { nudgeImagePosition, type ImageNudgeDirection } from '@/lib/imagePosition'
import { LazyCharacterSettings } from './LazySettings'
import { ImagePositionControls } from './ImagePositionControls'

type PendingUpload = { requestId: number; sourceUrl: string | undefined; controller: AbortController }

export function ImageUploader() {
  const {
    images,
    resetVersion,
    setImages,
    setPreparedImages,
    removeImageAt,
    swapImages,
    imagePositions,
    imageScales,
    selectedImageIndex,
    setImageScale,
    setImagePosition,
    setSelectedImageIndex,
    isImageLocked,
    setIsImageLocked,
  } = useStore(useShallow(state => ({
    images: state.images,
    resetVersion: state.resetVersion,
    setImages: state.setImages,
    setPreparedImages: state.setPreparedImages,
    removeImageAt: state.removeImageAt,
    swapImages: state.swapImages,
    imagePositions: state.imagePositions,
    imageScales: state.imageScales,
    selectedImageIndex: state.selectedImageIndex,
    setImageScale: state.setImageScale,
    setImagePosition: state.setImagePosition,
    setSelectedImageIndex: state.setSelectedImageIndex,
    isImageLocked: state.isImageLocked,
    setIsImageLocked: state.setIsImageLocked,
  })))
  const t = useTranslations('ImageUploader')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pendingUploads, setPendingUploads] = useState<Set<number>>(() => new Set())
  const uploadRequests = useRef(new Map<number, PendingUpload>())
  const mountedRef = useRef(true)

  useEffect(() => {
    const requests = uploadRequests.current
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requests.forEach((pending) => pending.controller.abort())
      requests.clear()
    }
  }, [])

  const lastResetVersionRef = useRef(resetVersion)
  useEffect(() => {
    if (lastResetVersionRef.current === resetVersion) return
    lastResetVersionRef.current = resetVersion
    uploadRequests.current.forEach((pending) => pending.controller.abort())
    uploadRequests.current.clear()
    setPendingUploads(new Set())
  }, [resetVersion])

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
        pending.controller.abort()
        uploadRequests.current.set(index, { ...pending, requestId: pending.requestId + 1 })
        setPendingUploads((current) => {
          if (!current.has(index)) return current
          const next = new Set(current)
          next.delete(index)
          return next
        })
      }
    })
  }, [images])

  const setUploadPending = (index: number, pending: boolean) => {
    setPendingUploads((current) => {
      const next = new Set(current)
      if (pending) next.add(index)
      else next.delete(index)
      return next
    })
  }

  const beginUpload = (index: number) => {
    uploadRequests.current.get(index)?.controller.abort()
    const requestId = (uploadRequests.current.get(index)?.requestId ?? 0) + 1
    const controller = new AbortController()
    uploadRequests.current.set(index, { requestId, sourceUrl: images[index], controller })
    return { requestId, signal: controller.signal }
  }

  const invalidateUpload = (index: number) => {
    const pending = uploadRequests.current.get(index)
    if (!pending) return
    pending.controller.abort()
    uploadRequests.current.set(index, {
      requestId: pending.requestId + 1,
      sourceUrl: pending.sourceUrl,
      controller: pending.controller,
    })
    setUploadPending(index, false)
  }

  const invalidateAllUploads = () => {
    uploadRequests.current.forEach((pending, index) => {
      pending.controller.abort()
      uploadRequests.current.set(index, { ...pending, requestId: pending.requestId + 1 })
    })
    setPendingUploads(new Set())
  }

  const imageCount = images.filter(Boolean).length
  const activeIndex = images[selectedImageIndex] ? selectedImageIndex : images.findIndex(Boolean)
  const activeImage = activeIndex >= 0 ? images[activeIndex] : undefined
  const activePosition = activeIndex >= 0 ? imagePositions[activeIndex] || { x: 0, y: 0 } : { x: 0, y: 0 }
  const activeScale = activeIndex >= 0 ? imageScales[activeIndex] || 1 : 1

  const handleFileUpload = (index: number) => {
    setUploadError(null)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return
      const { requestId, signal } = beginUpload(index)
      setUploadPending(index, true)
      const uploadVersion = useStore.getState().resetVersion
      const currentImages = useStore.getState().images
      const targetImageCount = currentImages.filter(Boolean).length + (currentImages[index] ? 0 : 1)
      const maxDimension = getImagePreparationMaxDimension(targetImageCount)

      void prepareImageForCanvas(file, signal, { maxDimension })
        .then((url) => {
          if (
            !mountedRef.current
            || uploadRequests.current.get(index)?.requestId !== requestId
            || useStore.getState().resetVersion !== uploadVersion
          ) {
            revokeObjectUrl(url)
            return
          }

          setPreparedImages([{ index, url }], index)
          setUploadError(null)
          uploadRequests.current.delete(index)
          setUploadPending(index, false)
        })
        .catch((error: unknown) => {
          if (
            !mountedRef.current
            || uploadRequests.current.get(index)?.requestId !== requestId
            || useStore.getState().resetVersion !== uploadVersion
          ) return
          setUploadError(error instanceof ImageUploadError && error.code === 'too-large' ? t('uploadLimit') : t('uploadError'))
          uploadRequests.current.delete(index)
          setUploadPending(index, false)
        })
    }
    input.click()
  }

  const handleMove = (event: ReactMouseEvent, index: number, direction: 'prev' | 'next') => {
    event.stopPropagation()
    const targetIndex = direction === 'prev' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length || !images[targetIndex]) return
    invalidateUpload(index)
    invalidateUpload(targetIndex)
    swapImages(index, targetIndex)
    if (selectedImageIndex === index) setSelectedImageIndex(targetIndex)
    else if (selectedImageIndex === targetIndex) setSelectedImageIndex(index)
  }

  const handleRemove = (event: ReactMouseEvent, index: number) => {
    event.stopPropagation()
    invalidateUpload(index)
    removeImageAt(index)
  }

  const handleSelect = (index: number) => {
    if (pendingUploads.has(index)) return
    if (images[index]) setSelectedImageIndex(index)
    else handleFileUpload(index)
  }

  const handleImageKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect(index)
      return
    }

    const directionByKey: Record<string, ImageNudgeDirection> = {
      ArrowUp: 'up',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowDown: 'down',
    }
    const direction = directionByKey[event.key]

    if (!direction || !images[index]) return

    event.preventDefault()
    setSelectedImageIndex(index)
    if (isImageLocked) return

    const position = imagePositions[index] || { x: 0, y: 0 }
    setImagePosition(index, nudgeImagePosition(position, direction, event.shiftKey ? 10 : 1))
  }

  return (
    <div className="space-y-6">
      {uploadError && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-xs leading-4 text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">{uploadError}</span>
          <button type="button" className="shrink-0 rounded-sm p-0.5 transition-colors hover:bg-destructive/10" onClick={() => setUploadError(null)} aria-label={t('dismissError')}>
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
      <Tabs defaultValue="frames" className="w-full">
        <SketchbookTabsList className="h-11">
          <SketchbookTabsTrigger value="frames" className="gap-2">
            <Upload className="size-3.5" aria-hidden="true" />
            {t('tabFrames')}
          </SketchbookTabsTrigger>
          <SketchbookTabsTrigger value="character" className="gap-2">
            <UserRound className="size-3.5" aria-hidden="true" />
            {t('tabCharacter')}
          </SketchbookTabsTrigger>
        </SketchbookTabsList>

        <TabsContent value="frames" className="mt-5 space-y-6 focus-visible:outline-none">
          <EditorSection title={t('sourceTitle')} description={t('sourceDescription')}>
            <div className="flex items-center justify-between rounded-md border border-border bg-surface-inset/60 px-3 py-2.5">
              <span className="text-[13px] font-semibold text-foreground">{t('imageCount')}</span>
              <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{String(imageCount).padStart(2, '0')} / {String(MAX_IMAGE_COUNT).padStart(2, '0')}</span>
            </div>
          </EditorSection>

          <EditorSection title={t('uploadTitle')} description={t('uploadDescription')}>
            <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: MAX_IMAGE_COUNT }, (_, index) => index).map((index) => {
            const image = images[index]
            if (index > 1 && !images[index - 1] && !image) return null
            const selected = Boolean(image) && activeIndex === index
            const uploading = pendingUploads.has(index)

            return (
              <div
                key={index}
                aria-busy={uploading}
                className={`group relative aspect-[4/3] overflow-hidden rounded-xl border bg-card transition-all ${
                  selected
                    ? 'border-primary shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-subtle)]'
                    : 'border-border hover:border-primary/30 hover:shadow-subtle'
                }`}
              >
                <button
                  type="button"
                  aria-label={image ? `${t('selectImage')} ${index + 1}` : `${t('uploadImage')} ${index + 1}`}
                  aria-pressed={selected}
                  aria-keyshortcuts={image ? 'ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight' : undefined}
                  onClick={() => handleSelect(index)}
                  onKeyDown={(event) => handleImageKeyDown(event, index)}
                  disabled={uploading}
                  className="absolute inset-0 z-0 flex cursor-pointer overflow-hidden rounded-[inherit] text-left focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={`${t('imagePreview')} ${index + 1}`} className={`size-full object-cover transition-[transform,filter,opacity] duration-300 group-hover:scale-[1.02] ${uploading ? 'opacity-45 blur-[1px]' : ''}`} />
                      <span className="pointer-events-none absolute inset-0 bg-primary/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
                    </>
                  ) : (
                    <span className="flex size-full flex-col items-center justify-center gap-2 border border-dashed border-primary/20 text-muted-foreground transition-colors group-hover:bg-surface-inset/60 group-hover:text-foreground">
                      <span className="grid size-9 place-items-center rounded-md bg-surface-inset text-foreground"><Upload className="size-4" aria-hidden="true" /></span>
                      <span className="text-[13px] font-semibold">{t('uploadImage')} {index + 1}</span>
                    </span>
                  )}
                </button>

                {image && (
                  <>
                    {uploading && (
                      <span role="status" className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/45 px-2 text-[11px] font-semibold text-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background/95 px-2.5 py-1.5 shadow-subtle">
                          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                          {t('changing')}
                        </span>
                      </span>
                    )}
                    <div className={`absolute inset-x-2 bottom-2 z-20 flex min-w-0 items-center justify-center gap-1.5 transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}>
                      {index > 0 && images[index - 1] && (
                        <button type="button" aria-label={t('movePrevious')} disabled={uploading} onClick={(event) => handleMove(event, index, 'prev')} className="grid size-[32px] shrink-0 place-items-center rounded-md border border-primary-foreground/20 bg-background/95 text-foreground shadow-subtle transition-colors hover:bg-background disabled:pointer-events-none disabled:opacity-50">
                          <ChevronLeft className="size-4" aria-hidden="true" />
                        </button>
                      )}
                      {index < images.length - 1 && images[index + 1] && (
                        <button type="button" aria-label={t('moveNext')} disabled={uploading} onClick={(event) => handleMove(event, index, 'next')} className="grid size-[32px] shrink-0 place-items-center rounded-md border border-primary-foreground/20 bg-background/95 text-foreground shadow-subtle transition-colors hover:bg-background disabled:pointer-events-none disabled:opacity-50">
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <span className="pointer-events-none absolute left-2 top-2 z-10 grid size-6 place-items-center rounded-md border border-primary-foreground/20 bg-background/90 font-mono text-[10px] font-bold tabular-nums text-foreground shadow-subtle" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <button type="button" data-photo-change-affordance aria-label={t('change')} title={t('change')} disabled={uploading} onClick={() => handleFileUpload(index)} className="absolute right-2 top-2 z-30 inline-flex h-7 items-center gap-1 rounded-md border border-primary-foreground/20 bg-background/95 px-2 text-[10px] font-semibold text-foreground shadow-subtle transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60">
                      <ImagePlus className="size-3.5" aria-hidden="true" />
                      {t('change')}
                    </button>
                    <button type="button" aria-label={t('deleteImage')} disabled={uploading} onClick={(event) => handleRemove(event, index)} className={`absolute right-2 top-11 z-20 grid size-7 place-items-center rounded-md border border-primary-foreground/20 bg-background/90 text-foreground shadow-subtle transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}>
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            )
          })}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-10 flex-1 rounded-md text-xs" onClick={() => swapImages(0, 1)} disabled={images.length < 2 || !images[0] || !images[1]}>
                <ArrowLeftRight className="size-3.5" /> {t('swapOrder')}
              </Button>
              <Button variant="outline" size="sm" className="h-10 flex-1 rounded-md text-xs hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={() => { if (!window.confirm(t('clearConfirm'))) return; invalidateAllUploads(); setImages([]); setSelectedImageIndex(0) }} disabled={imageCount === 0}>
                <Trash2 className="size-3.5" /> {t('clearAll')}
              </Button>
            </div>
          </EditorSection>

          {activeImage && activeIndex >= 0 && (
            <EditorSection title={t('selectedImage', { index: activeIndex + 1 })} description={t('selectedImageDescription')} className="border-t border-border pt-5">
              <div className="editor-control-surface space-y-4 p-4">
            <EditorFieldHeader label={t('imageSize', { index: activeIndex + 1 })} value={`${Math.round(activeScale * 100)}%`} htmlFor="selected-image-scale-input" />
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
                  id="selected-image-scale-input"
                  type="number"
                  className="h-9 pr-6 text-right text-xs font-semibold tabular-nums [&::-webkit-inner-spin-button]:appearance-none"
                  value={Math.round(activeScale * 100)}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    if (!Number.isNaN(value)) setImageScale(activeIndex, Math.max(0.5, Math.min(3, value / 100)))
                  }}
                  min="50"
                  max="300"
                  aria-label={t('imageSize', { index: activeIndex + 1 })}
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">%</span>
              </div>
            </div>
            <ImagePositionControls
              position={activePosition}
              onChange={(position) => setImagePosition(activeIndex, position)}
              disabled={isImageLocked}
            />
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2">
                {isImageLocked ? <Lock className="size-4 text-primary" /> : <Unlock className="size-4 text-muted-foreground" />}
                <div>
                  <p className="text-xs font-semibold text-foreground">{t('lockPosition')}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{t('lockPositionHint')}</p>
                </div>
              </div>
              <Switch checked={isImageLocked} onCheckedChange={setIsImageLocked} size="sm" aria-label={t('lockPosition')} />
            </div>
            <button type="button" onClick={() => { setImageScale(activeIndex, 1); setImagePosition(activeIndex, { x: 0, y: 0 }) }} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
              <RefreshCw className="size-3.5" /> {t('reset')}
            </button>
              </div>
            </EditorSection>
          )}
        </TabsContent>

        <TabsContent value="character" className="mt-5 space-y-4 focus-visible:outline-none">
          <LazyCharacterSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
