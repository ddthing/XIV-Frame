import { useCallback, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

import { AlertCircle, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { CanvasDock } from './CanvasDock'
import { EmptyFrameState } from './EmptyFrameState'
import { useStore } from '@/store/useStore'
import { ImageUploadError, prepareImageForCanvas } from '@/lib/imageUpload'

const KonvaStage = dynamic(() => import('./KonvaStage'), { ssr: false })

import type Konva from 'konva'

interface PreviewCanvasProps {
  stageRef: React.MutableRefObject<Konva.Stage | null>
  isFocusMode?: boolean
  onToggleFocus?: () => void
  showDock?: boolean
}

interface PanOffset {
  x: number
  y: number
}

export function PreviewCanvas({ stageRef, isFocusMode = false, onToggleFocus, showDock = true }: PreviewCanvasProps) {
  const {
    images,
    layoutPreset,
    canvasRatio,
    zoom,
    setImageAt,
    setImageScale,
    setImagePosition,
    setZoom,
  } = useStore(useShallow(state => ({
    images: state.images,
    layoutPreset: state.layoutPreset,
    canvasRatio: state.canvasRatio,
    zoom: state.zoom,
    setImageAt: state.setImageAt,
    setImageScale: state.setImageScale,
    setImagePosition: state.setImagePosition,
    setZoom: state.setZoom,
  })))
  const t = useTranslations('ImageUploader')
  const tPreview = useTranslations('CanvasPreview')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragDepthRef = useRef(0)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isCanvasLoading, setIsCanvasLoading] = useState(true)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 })
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const panStartRef = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null)
  const hasImages = images.some(Boolean)

  const handleCanvasLoadError = useCallback(() => {
    setUploadError(t('uploadError'))
  }, [t])

  const handleFitToView = useCallback(() => {
    setZoom(100)
    setPanOffset({ x: 0, y: 0 })
  }, [setZoom])

  const handleViewportKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code !== 'Space' || event.repeat) return
    event.preventDefault()
    setIsSpacePressed(true)
  }

  const handleViewportKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code !== 'Space') return
    event.preventDefault()
    setIsSpacePressed(false)
  }

  const handleViewportPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const canPan = zoom > 100 && (event.button === 1 || (event.button === 0 && isSpacePressed))
    if (!canPan) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    viewportRef.current?.focus({ preventScroll: true })
    panStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originX: panOffset.x,
      originY: panOffset.y,
    }
    setIsPanning(true)
  }

  const handleViewportPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = panStartRef.current
    if (!start || start.pointerId !== event.pointerId) return

    setPanOffset({
      x: start.originX + event.clientX - start.x,
      y: start.originY + event.clientY - start.y,
    })
  }

  const finishPanning = (event: React.PointerEvent<HTMLDivElement>) => {
    if (panStartRef.current?.pointerId !== event.pointerId) return

    panStartRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setIsPanning(false)
  }

  const visiblePanOffset = zoom > 100 ? panOffset : { x: 0, y: 0 }

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
    <div role="region" aria-label={tPreview('regionLabel')} className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      <h1 className="sr-only">{tPreview('editorTitle')}</h1>

      <div
        ref={viewportRef}
        tabIndex={0}
        aria-keyshortcuts="Space"
        className={`app-backdrop relative flex min-h-0 flex-1 items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/70 ${isPanning ? 'cursor-grabbing' : isSpacePressed && zoom > 100 ? 'cursor-grab' : ''}`}
        onKeyDown={handleViewportKeyDown}
        onKeyUp={handleViewportKeyUp}
        onBlur={() => setIsSpacePressed(false)}
        onPointerDownCapture={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={finishPanning}
        onPointerCancel={finishPanning}
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
        {hasImages && (
          <div
            className="flex size-full items-center justify-center transition-transform duration-200 motion-reduce:transition-none"
            style={{
              transform: `translate3d(${visiblePanOffset.x}px, ${visiblePanOffset.y}px, 0) scale(${zoom / 100})`,
              transformOrigin: 'center',
            }}
          >
            <KonvaStage
              stageRef={stageRef}
              onLoadError={handleCanvasLoadError}
              onLoadStateChange={setIsCanvasLoading}
            />
          </div>
        )}

        {hasImages && isCanvasLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-background/55 backdrop-blur-[1px]">
            <p role="status" className="inline-flex items-center gap-2 rounded-md bg-background/95 px-3 py-2 text-xs font-semibold text-foreground shadow-subtle">
              <span aria-hidden="true" className="size-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground motion-reduce:animate-none" />
              {tPreview('loadingCanvas')}
            </p>
          </div>
        )}

        {isDragActive && (
          <div className="pointer-events-none absolute inset-5 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/5 px-6 text-center backdrop-blur-[2px]">
            <div>
              <Upload aria-hidden="true" className="mx-auto size-8 text-primary" />
              <p className="mt-3 text-sm font-semibold text-primary">{t('dropActive')}</p>
            </div>
          </div>
        )}

        {!hasImages && !isDragActive && (
          <EmptyFrameState
            canvasRatio={canvasRatio}
            isUploading={isUploading}
            layoutPreset={layoutPreset}
            uploadError={uploadError}
          />
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
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {hasImages && showDock && onToggleFocus && (
        <CanvasDock
          isFocusMode={isFocusMode}
          onFitToView={handleFitToView}
          onToggleFocus={onToggleFocus}
          className="hidden md:flex"
        />
      )}
    </div>
  )
}
