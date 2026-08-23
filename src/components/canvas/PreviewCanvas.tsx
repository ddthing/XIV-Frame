import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import { AlertCircle, ImagePlus, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { CanvasToolbar } from './CanvasToolbar'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { ImageUploadError, prepareImageForCanvas } from '@/lib/imageUpload'

const KonvaStage = dynamic(() => import('./KonvaStage'), { ssr: false })

import type Konva from 'konva'

export function PreviewCanvas({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const {
    images,
    zoom,
    setImageAt,
    setImageScale,
    setImagePosition,
  } = useStore(useShallow(state => ({
    images: state.images,
    zoom: state.zoom,
    setImageAt: state.setImageAt,
    setImageScale: state.setImageScale,
    setImagePosition: state.setImagePosition,
  })))
  const t = useTranslations('ImageUploader')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragDepthRef = useRef(0)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const hasImages = images.some(Boolean)

  const handleFiles = async (fileList: FileList | File[]) => {
    if (isUploading) return
    const files = Array.from(fileList)
    if (files.length === 0) return

    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      setUploadError(t('dropInvalidType'))
      return
    }

    const currentImages = useStore.getState().images
    const availableSlots = Array.from({ length: 4 }, (_, index) => index)
      .filter(index => !currentImages[index])

    if (availableSlots.length === 0) {
      setUploadError(t('dropFull'))
      return
    }

    const filesToPrepare = imageFiles.slice(0, availableSlots.length)
    setUploadError(null)
    setIsUploading(true)

    try {
      const results = await Promise.allSettled(filesToPrepare.map(prepareImageForCanvas))
      let uploadedCount = 0
      let hadTooLargeFile = false

      results.forEach((result, offset) => {
        if (result.status === 'fulfilled') {
          const slot = availableSlots[offset]
          setImageAt(slot, result.value)
          setImageScale(slot, 1)
          setImagePosition(slot, { x: 0, y: 0 })
          uploadedCount += 1
          return
        }

        if (result.reason instanceof ImageUploadError && result.reason.code === 'too-large') {
          hadTooLargeFile = true
        }
      })

      if (uploadedCount === 0) {
        setUploadError(hadTooLargeFile ? t('uploadLimit') : t('uploadError'))
      } else if (uploadedCount < imageFiles.length || imageFiles.length > availableSlots.length) {
        setUploadError(t('dropPartial'))
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepthRef.current = 0
    setIsDragActive(false)
    void handleFiles(event.dataTransfer.files)
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files ? Array.from(event.currentTarget.files) : []
    event.currentTarget.value = ''
    void handleFiles(files)
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isUploading ? t('uploading') : ''}
      </p>
      <CanvasToolbar className="hidden md:flex" />

      <div
        className="app-backdrop relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        onDragEnter={(event) => {
          event.preventDefault()
          dragDepthRef.current += 1
          setIsDragActive(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault()
          dragDepthRef.current -= 1
          if (dragDepthRef.current <= 0) {
            dragDepthRef.current = 0
            setIsDragActive(false)
          }
        }}
        onDrop={handleDrop}
      >
        <div
          className="flex size-full items-center justify-center transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
        >
          <KonvaStage stageRef={stageRef} />
        </div>

        {isDragActive && (
          <div className="pointer-events-none absolute inset-5 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-accent/45 px-6 text-center backdrop-blur-[2px]">
            <div>
              <Upload className="mx-auto size-8 text-primary" />
              <p className="mt-3 text-sm font-semibold text-primary">{t('dropActive')}</p>
            </div>
          </div>
        )}

        {!hasImages && !isDragActive && (
          <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center bg-background/88 px-6 backdrop-blur-[2px]">
            <div className="flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-primary/25 bg-card/90 px-8 py-8 text-center shadow-subtle">
              <div className="grid size-14 place-items-center rounded-xl bg-accent text-accent-foreground">
                <ImagePlus className="size-6" />
              </div>
              <p className="mt-5 font-display text-lg font-bold tracking-[0.01em] text-foreground">{isUploading ? t('uploading') : t('dropTitle')}</p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">{t('dropDescription')}</p>
              <Button type="button" size="sm" className="mt-5 h-10 rounded-md px-4 text-xs" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Upload className="size-3.5" />
                {isUploading ? t('uploading') : t('chooseFiles')}
              </Button>
              <span className="mt-4 editor-meta">{t('dropHint')}</span>
              {uploadError && (
                <p role="alert" className="mt-4 inline-flex items-start gap-1.5 text-left text-xs leading-4 text-destructive">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {uploadError && hasImages && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 max-w-[min(90%,28rem)] -translate-x-1/2">
            <p role="alert" className="inline-flex items-start gap-1.5 rounded-md border border-destructive/25 bg-background/95 px-3 py-2 text-left text-xs leading-4 text-destructive shadow-subtle">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span>{uploadError}</span>
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="sr-only"
          aria-label={t('chooseFiles')}
        />
      </div>
    </div>
  )
}
