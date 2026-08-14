import { useState } from 'react'
import { ArrowLeftRight, ChevronLeft, ChevronRight, Lock, RefreshCw, Trash2, Unlock, Upload, UserRound, X } from 'lucide-react'
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
import { ImageUploadError, prepareImageForCanvas } from '@/lib/imageUpload'
import { LazyCharacterSettings } from './LazySettings'

export function ImageUploader() {
  const {
    images,
    setImages,
    setImageAt,
    removeImageAt,
    swapImages,
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
    imageScales: state.imageScales,
    setImageScale: state.setImageScale,
    setImagePosition: state.setImagePosition,
    isImageLocked: state.isImageLocked,
    setIsImageLocked: state.setIsImageLocked,
  })))
  const t = useTranslations('ImageUploader')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const imageCount = images.filter(Boolean).length
  const activeIndex = images[selectedIndex] ? selectedIndex : images.findIndex(Boolean)
  const activeImage = activeIndex >= 0 ? images[activeIndex] : undefined
  const activeScale = activeIndex >= 0 ? imageScales[activeIndex] || 1 : 1

  const handleFileUpload = (index: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      void prepareImageForCanvas(file)
        .then((url) => {
          setImageAt(index, url)
          setImageScale(index, 1)
          setImagePosition(index, { x: 0, y: 0 })
          setSelectedIndex(index)
        })
        .catch((error: unknown) => {
          alert(error instanceof ImageUploadError && error.code === 'too-large' ? t('uploadLimit') : t('uploadError'))
        })
    }
    input.click()
  }

  const handleMove = (event: React.MouseEvent, index: number, direction: 'prev' | 'next') => {
    event.stopPropagation()
    const targetIndex = direction === 'prev' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length || !images[targetIndex]) return
    swapImages(index, targetIndex)
    if (selectedIndex === index) setSelectedIndex(targetIndex)
    else if (selectedIndex === targetIndex) setSelectedIndex(index)
  }

  const handleRemove = (event: React.MouseEvent, index: number) => {
    event.stopPropagation()
    removeImageAt(index)
    setSelectedIndex((current) => Math.max(0, Math.min(current, images.length - 2)))
  }

  const handleSelect = (index: number) => {
    if (images[index]) setSelectedIndex(index)
    else handleFileUpload(index)
  }

  return (
    <div className="space-y-6">
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
              <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{String(imageCount).padStart(2, '0')} / 04</span>
            </div>
          </EditorSection>

          <EditorSection title={t('uploadTitle')} description={t('uploadDescription')}>
            <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((index) => {
            const image = images[index]
            if (index > 1 && !images[index - 1] && !image) return null
            const selected = Boolean(image) && activeIndex === index

            return (
              <div
                key={index}
                role="button"
                tabIndex={0}
                aria-label={image ? `${t('selectImage')} ${index + 1}` : `${t('uploadImage')} ${index + 1}`}
                aria-pressed={selected}
                onClick={() => handleSelect(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleSelect(index)
                  }
                }}
                className={`group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border bg-card transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                  selected
                    ? 'border-primary shadow-[inset_0_0_0_2px_var(--color-highlighter-yellow),var(--shadow-subtle)]'
                    : 'border-border hover:border-primary/30 hover:shadow-subtle'
                }`}
              >
                {image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`${t('uploadImage')} ${index + 1}`} className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    <div className="pointer-events-none absolute inset-0 bg-primary/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    <div className={`absolute inset-x-2 bottom-2 flex min-w-0 items-center justify-center gap-1.5 transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}>
                      {index > 0 && images[index - 1] && (
                        <button type="button" aria-label={t('movePrevious')} onClick={(event) => handleMove(event, index, 'prev')} className="grid size-[32px] shrink-0 place-items-center rounded-md border border-primary-foreground/20 bg-background/95 text-foreground shadow-subtle transition-colors hover:bg-background">
                          <ChevronLeft className="size-4" />
                        </button>
                      )}
                      <button type="button" aria-label={t('change')} onClick={(event) => { event.stopPropagation(); handleFileUpload(index) }} className="h-[32px] min-h-[32px] min-w-0 flex-1 truncate rounded-md border border-primary-foreground/20 bg-background/95 px-2 text-[11px] font-semibold leading-none whitespace-nowrap text-foreground shadow-subtle transition-colors hover:bg-background">
                        {t('change')}
                      </button>
                      {index < images.length - 1 && images[index + 1] && (
                        <button type="button" aria-label={t('moveNext')} onClick={(event) => handleMove(event, index, 'next')} className="grid size-[32px] shrink-0 place-items-center rounded-md border border-primary-foreground/20 bg-background/95 text-foreground shadow-subtle transition-colors hover:bg-background">
                          <ChevronRight className="size-4" />
                        </button>
                      )}
                    </div>
                    <span className="absolute left-2 top-2 grid size-6 place-items-center rounded-md border border-primary-foreground/20 bg-background/90 font-mono text-[10px] font-bold tabular-nums text-foreground shadow-subtle">{String(index + 1).padStart(2, '0')}</span>
                    <button type="button" aria-label={t('deleteImage')} onClick={(event) => handleRemove(event, index)} className="absolute right-2 top-2 grid size-7 place-items-center rounded-md border border-primary-foreground/20 bg-background/90 text-foreground opacity-0 shadow-subtle transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 group-focus-within:opacity-100">
                      <X className="size-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 border border-dashed border-primary/20 text-muted-foreground transition-colors group-hover:bg-surface-inset/60 group-hover:text-foreground">
                    <span className="grid size-9 place-items-center rounded-md bg-surface-inset text-foreground"><Upload className="size-4" /></span>
                    <span className="text-[13px] font-semibold">{t('uploadImage')} {index + 1}</span>
                  </div>
                )}
              </div>
            )
          })}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-10 flex-1 rounded-md text-xs" onClick={() => swapImages(0, 1)} disabled={images.length < 2 || !images[0] || !images[1]}>
                <ArrowLeftRight className="size-3.5" /> {t('swapOrder')}
              </Button>
              <Button variant="outline" size="sm" className="h-10 flex-1 rounded-md text-xs hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={() => { setImages([]); setSelectedIndex(0) }} disabled={imageCount === 0}>
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
