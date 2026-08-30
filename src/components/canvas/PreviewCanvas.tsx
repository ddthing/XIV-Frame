import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import { AlertCircle, LoaderCircle, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { CanvasToolbar } from './CanvasToolbar'
import { useStore } from '@/store/useStore'
import { ImageUploadError, filterImageFiles, getImagePreparationMaxDimension, prepareImageForCanvas, revokeObjectUrl } from '@/lib/imageUpload'
import { settleWithConcurrency } from '@/lib/asyncPool'
import { getImagePreparationConcurrency } from '@/lib/browserCapabilities'
import { MAX_IMAGE_COUNT } from '@/lib/imageLimits'

const KonvaStage = dynamic(() => import('./KonvaStage'), { ssr: false })

import type Konva from 'konva'

export function PreviewCanvas({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const {
    zoom,
    resetVersion,
    setPreparedImages,
  } = useStore(useShallow(state => ({
    zoom: state.zoom,
    resetVersion: state.resetVersion,
    setPreparedImages: state.setPreparedImages,
  })))
  const t = useTranslations('ImageUploader')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const targetSlotRef = useRef<number | null>(null)
  const dragDepthRef = useRef(0)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const uploadAbortRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      uploadAbortRef.current?.abort()
      uploadAbortRef.current = null
    }
  }, [])

  useEffect(() => {
    uploadAbortRef.current?.abort()
    uploadAbortRef.current = null
  }, [resetVersion])

  useEffect(() => {
    const handleCanvasUploadError = (event: Event) => {
      const message = (event as CustomEvent<string>).detail
      if (typeof message === 'string' && message) setUploadError(message)
    }
    const handleCanvasImageError = () => setUploadError(t('uploadError'))

    window.addEventListener('xiv-frame:upload-error', handleCanvasUploadError)
    window.addEventListener('xiv-frame:canvas-image-error', handleCanvasImageError)
    return () => {
      window.removeEventListener('xiv-frame:upload-error', handleCanvasUploadError)
      window.removeEventListener('xiv-frame:canvas-image-error', handleCanvasImageError)
    }
  }, [t])

  const handleFiles = async (fileList: FileList | File[], targetSlot?: number) => {
    if (isUploading) return
    const files = Array.from(fileList)
    if (files.length === 0) return

    // Some browsers leave File.type empty for local files. Keep the extension
    // fallback in imageUpload.ts as the source of truth for those uploads.
    const imageFiles = filterImageFiles(files)
    if (imageFiles.length === 0) {
      setUploadError(t('dropInvalidType'))
      return
    }

    const currentImages = useStore.getState().images
    const availableSlots = Array.from({ length: MAX_IMAGE_COUNT }, (_, index) => index)
      .filter(index => !currentImages[index])
    const targetSlots = targetSlot === undefined
      ? availableSlots
      : targetSlot >= 0 && targetSlot < MAX_IMAGE_COUNT
        ? [targetSlot]
        : []

    if (targetSlots.length === 0) {
      setUploadError(t('dropFull'))
      return
    }

    const filesToPrepare = imageFiles.slice(0, targetSlots.length)
    const uploadVersion = resetVersion
    const preparationConcurrency = getImagePreparationConcurrency()
    const replacesExistingImage = targetSlot !== undefined && Boolean(currentImages[targetSlot])
    const targetImageCount = currentImages.filter(Boolean).length + (replacesExistingImage ? 0 : filesToPrepare.length)
    const maxDimension = getImagePreparationMaxDimension(targetImageCount)
    const controller = new AbortController()
    uploadAbortRef.current = controller
    setUploadError(null)
    setIsUploading(true)

    try {
      const results = await settleWithConcurrency(
        filesToPrepare,
        (file) => prepareImageForCanvas(file, controller.signal, { maxDimension }),
        preparationConcurrency,
        () => !controller.signal.aborted && useStore.getState().resetVersion === uploadVersion,
      )
      if (
        controller.signal.aborted
        || !mountedRef.current
        || useStore.getState().resetVersion !== uploadVersion
      ) {
        results.forEach((result) => {
          if (result.status === 'fulfilled') revokeObjectUrl(result.value)
        })
        return
      }

      let uploadedCount = 0
      let hadTooLargeFile = false
      const preparedImages: { index: number; url: string }[] = []

      results.forEach((result, offset) => {
        if (result.status === 'fulfilled') {
          const slot = targetSlots[offset]
          preparedImages.push({ index: slot, url: result.value })
          uploadedCount += 1
          return
        }

        if (result.reason instanceof ImageUploadError && result.reason.code === 'too-large') {
          hadTooLargeFile = true
        }
      })

      setPreparedImages(
        preparedImages,
        targetSlot !== undefined && preparedImages.length > 0 ? preparedImages[0].index : undefined,
      )

      if (uploadedCount === 0) {
        setUploadError(hadTooLargeFile ? t('uploadLimit') : t('uploadError'))
      } else if (uploadedCount < imageFiles.length || imageFiles.length > targetSlots.length) {
        setUploadError(t('dropPartial'))
      }
    } finally {
      if (uploadAbortRef.current === controller) uploadAbortRef.current = null
      if (mountedRef.current) setIsUploading(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepthRef.current = 0
    setIsDragActive(false)
    void handleFiles(event.dataTransfer.files)
  }

  const handleSlotSelect = useCallback((index: number) => {
    if (isUploading) return
    const input = fileInputRef.current
    if (!input) return
    targetSlotRef.current = index
    input.multiple = false
    input.click()
  }, [isUploading])

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files ? Array.from(event.currentTarget.files) : []
    const targetSlot = targetSlotRef.current
    targetSlotRef.current = null
    event.currentTarget.value = ''
    event.currentTarget.multiple = true
    void handleFiles(files, targetSlot ?? undefined)
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
          <KonvaStage
            stageRef={stageRef}
            onSlotSelect={handleSlotSelect}
            emptySlotLabel={isUploading ? t('uploading') : t('emptySlotLabel')}
            emptySlotHint={isUploading ? '' : t('emptySlotHint')}
            emptySlotDisabled={isUploading}
            loadingSlotLabel={t('uploading')}
          />
        </div>

        {isUploading && (
          <div
            data-preview-upload-status
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-center"
          >
            <div className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border bg-card/95 px-3 py-2 text-xs font-semibold text-foreground shadow-subtle">
              <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" />
              <span>{t('uploading')}</span>
            </div>
          </div>
        )}

        {isDragActive && (
          <div className="pointer-events-none absolute inset-5 z-20 flex items-center justify-center rounded-lg border border-primary/45 bg-accent/45 px-6 text-center">
            <div>
              <Upload className="mx-auto size-8 text-primary" />
              <p className="mt-3 text-sm font-semibold text-primary">{t('dropActive')}</p>
            </div>
          </div>
        )}

        {uploadError && (
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
