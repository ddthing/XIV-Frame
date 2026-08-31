import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import dynamic from 'next/dynamic'

import { AlertCircle, Eye, EyeOff, LoaderCircle, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { CanvasToolbar } from './CanvasToolbar'
import { useStore } from '@/store/useStore'
import { ImageUploadError, filterImageFiles, getImagePreparationMaxDimension, prepareImageForCanvas, revokeObjectUrl } from '@/lib/imageUpload'
import { settleWithConcurrency } from '@/lib/asyncPool'
import { getImagePreparationConcurrency } from '@/lib/browserCapabilities'
import { MAX_IMAGE_COUNT } from '@/lib/imageLimits'
import { nudgeImagePosition, type ImageNudgeDirection } from '@/lib/imagePosition'

const KonvaStage = dynamic(() => import('./KonvaStage'), { ssr: false })

import type Konva from 'konva'

export function PreviewCanvas({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const {
    images,
    imagePositions,
    selectedImageIndex,
    isImageLocked,
    zoom,
    resetVersion,
    setPreparedImages,
    setImagePosition,
    setSelectedImageIndex,
  } = useStore(useShallow(state => ({
    images: state.images,
    imagePositions: state.imagePositions,
    selectedImageIndex: state.selectedImageIndex,
    isImageLocked: state.isImageLocked,
    zoom: state.zoom,
    resetVersion: state.resetVersion,
    setPreparedImages: state.setPreparedImages,
    setImagePosition: state.setImagePosition,
    setSelectedImageIndex: state.setSelectedImageIndex,
  })))
  const t = useTranslations('ImageUploader')
  const canvasDescriptionId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const targetSlotRef = useRef<number | null>(null)
  const dragDepthRef = useRef(0)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showPreviewGuides, setShowPreviewGuides] = useState(false)
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

  const occupiedImageIndices = images.flatMap((image, index) => image ? [index] : [])
  const activeImageIndex = images[selectedImageIndex]
    ? selectedImageIndex
    : occupiedImageIndices[0] ?? -1

  const handleCanvasKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target instanceof HTMLElement ? event.target : null
    if (target?.dataset.xivFrameSelection === 'character') return
    if (target?.matches('input, textarea, select, button, [contenteditable="true"]')) return

    if (occupiedImageIndices.length === 0 && event.key === 'Enter') {
      event.preventDefault()
      fileInputRef.current?.click()
      return
    }

    const currentPosition = Math.max(0, occupiedImageIndices.indexOf(activeImageIndex))
    const selectionByKey: Partial<Record<string, number>> = {
      PageUp: Math.max(0, currentPosition - 1),
      PageDown: Math.min(occupiedImageIndices.length - 1, currentPosition + 1),
      Home: 0,
      End: occupiedImageIndices.length - 1,
    }
    const nextSelectionPosition = selectionByKey[event.key]
    if (nextSelectionPosition !== undefined && occupiedImageIndices[nextSelectionPosition] !== undefined) {
      event.preventDefault()
      setSelectedImageIndex(occupiedImageIndices[nextSelectionPosition])
      return
    }

    const directionByKey: Partial<Record<string, ImageNudgeDirection>> = {
      ArrowUp: 'up',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowDown: 'down',
    }
    const direction = directionByKey[event.key]
    if (!direction || activeImageIndex < 0) return

    event.preventDefault()
    if (isImageLocked) return
    const position = imagePositions[activeImageIndex] ?? { x: 0, y: 0 }
    setImagePosition(activeImageIndex, nudgeImagePosition(position, direction, event.shiftKey ? 10 : 1))
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isUploading ? t('uploading') : ''}
      </p>
      <CanvasToolbar className="hidden md:flex" />

      <div
        role="region"
        tabIndex={0}
        aria-label={t('canvasRegionLabel')}
        aria-describedby={canvasDescriptionId}
        aria-keyshortcuts="Enter ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight PageUp PageDown Home End"
        data-xiv-frame-canvas-region
        data-xiv-frame-selection="image"
        className="app-backdrop relative flex min-h-0 flex-1 items-center justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        onKeyDown={handleCanvasKeyDown}
        onFocus={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.dataset.xivFrameSelection = 'image'
        }}
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
        <p id={canvasDescriptionId} className="sr-only">
          {occupiedImageIndices.length === 0
            ? t('canvasEmptySummary')
            : t('canvasImageSummary', { count: occupiedImageIndices.length, selected: activeImageIndex + 1 })}
        </p>
        <div
          className="flex size-full items-center justify-center transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
        >
          <KonvaStage
            stageRef={stageRef}
            showPreviewGuides={showPreviewGuides}
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

        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
          <button
            type="button"
            aria-label={t(showPreviewGuides ? 'hidePreviewGuides' : 'showPreviewGuides')}
            aria-pressed={showPreviewGuides}
            onClick={() => setShowPreviewGuides((current) => !current)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-background/95 px-3 text-xs font-semibold text-foreground shadow-subtle transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPreviewGuides ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
            {t('previewGuides')}
          </button>
          {showPreviewGuides && (
            <span className="rounded-md border border-border bg-background/95 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-subtle">
              {t('previewGuidesNotExported')}
            </span>
          )}
        </div>

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
