import { useEffect, useRef, useState, useMemo } from 'react'
import { Stage, Layer } from 'react-konva'
import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { BackgroundLayer } from './layers/BackgroundLayer'
import { ImageGridLayer, type LoadedCanvasImage } from './layers/ImageGridLayer'
import { EmptySlotLayer } from './layers/EmptySlotLayer'
import { CharacterLayer } from './layers/CharacterLayer'
import { SignatureLayer } from './layers/SignatureLayer'
import { LogoLayer } from './layers/LogoLayer'
import { CopyrightLayer } from './layers/CopyrightLayer'
import { NoiseLayer } from './layers/NoiseLayer'
import { getLayoutGeometry, getLayoutGeometryImageCount } from '@/lib/layoutTemplates'
import { getCanvasLogicalSize } from '@/lib/canvasGeometry'

import type Konva from 'konva'

type PendingImageLoad = {
  promise: Promise<HTMLImageElement>
  cancel: () => void
}

function clearImageElement(image: HTMLImageElement) {
  image.onload = null
  image.onerror = null
  image.src = ''
}

export default function KonvaStage({
  stageRef,
  onSlotSelect,
  emptySlotLabel = 'Add photo',
  emptySlotHint = 'Click or drop',
  emptySlotDisabled = false,
  loadingSlotLabel = 'Preparing photo…',
  loadingSlotHint = '',
}: {
  stageRef: React.RefObject<Konva.Stage | null>
  onSlotSelect?: (index: number) => void
  emptySlotLabel?: string
  emptySlotHint?: string
  emptySlotDisabled?: boolean
  loadingSlotLabel?: string
  loadingSlotHint?: string
}) {
  const {
    images, layoutPreset, hasChosenLayout, imageGap, imageTransition, blendWidth, canvasRatio,
    borderWidth, backgroundColor, customBackgroundColor, grainIntensity, imageShape, isExporting, zoom,
  } = useStore(useShallow(state => ({
    images: state.images,
    layoutPreset: state.layoutPreset,
    hasChosenLayout: state.hasChosenLayout,
    imageGap: state.imageGap,
    imageTransition: state.imageTransition,
    blendWidth: state.blendWidth,
    canvasRatio: state.canvasRatio,
    borderWidth: state.borderWidth,
    backgroundColor: state.backgroundColor,
    customBackgroundColor: state.customBackgroundColor,
    grainIntensity: state.grainIntensity,
    imageShape: state.imageShape,
    isExporting: state.isExporting,
    zoom: state.zoom,
  })))
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [imagesData, setImagesData] = useState<LoadedCanvasImage[]>([])
  const imageCacheRef = useRef(new Map<string, HTMLImageElement>())
  const pendingImageLoadsRef = useRef(new Map<string, PendingImageLoad>())
  const activeUrlsRef = useRef(new Set<string>())
  const activeRef = useRef(true)
  
  useEffect(() => {
    let effectActive = true
    let syncFrame: number | null = null
    const imageCache = imageCacheRef.current
    const pendingLoads = pendingImageLoadsRef.current
    const imageEntries = images.flatMap((url, sourceIndex) => (
      url ? [{ url, sourceIndex }] : []
    ))
    const imageUrls = imageEntries.map(({ url }) => url)
    const activeUrls = new Set(imageUrls)
    activeUrlsRef.current = activeUrls

    imageCache.forEach((image, url) => {
      if (!activeUrls.has(url)) {
        clearImageElement(image)
        imageCache.delete(url)
      }
    })

    pendingLoads.forEach((pending, url) => {
      if (!activeUrls.has(url)) {
        pending.cancel()
        pendingLoads.delete(url)
      }
    })

    const loadImage = (url: string) => {
      const cachedImage = imageCache.get(url)
      if (cachedImage) return Promise.resolve(cachedImage)

      const pendingLoad = pendingLoads.get(url)
      if (pendingLoad) return pendingLoad.promise

      let cancelLoad: () => void = () => undefined
      const nextLoad = new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image()
        let settled = false
        const cleanup = () => {
          image.onload = null
          image.onerror = null
        }

        cancelLoad = () => {
          if (settled) return
          settled = true
          cleanup()
          image.src = ''
          reject(new Error(`Cancelled image load: ${url}`))
        }

        image.onload = () => {
          if (settled) return
          settled = true
          cleanup()
          resolve(image)
        }
        image.onerror = () => {
          if (settled) return
          settled = true
          cleanup()
          reject(new Error(`Failed to load image: ${url}`))
        }
        image.src = url
      })

      const pendingRecord: PendingImageLoad = { promise: nextLoad, cancel: () => cancelLoad() }
      pendingLoads.set(url, pendingRecord)
      void nextLoad.then(
        (image) => {
          if (pendingLoads.get(url) === pendingRecord) pendingLoads.delete(url)
          if (activeRef.current && activeUrlsRef.current.has(url)) imageCache.set(url, image)
        },
        () => {
          if (pendingLoads.get(url) === pendingRecord) pendingLoads.delete(url)
        },
      )
      return nextLoad
    }

    const syncLoadedImages = () => {
      if (!effectActive) return

      const loaded = imageEntries.flatMap(({ url, sourceIndex }) => {
        const image = imageCache.get(url)
        return image ? [{ image, sourceIndex }] : []
      })

      setImagesData((current) => {
        if (
          current.length === loaded.length
          && current.every((entry, index) => entry.image === loaded[index]?.image && entry.sourceIndex === loaded[index]?.sourceIndex)
        ) {
          return current
        }
        return loaded
      })
    }

    const scheduleLoadedImageSync = () => {
      if (!effectActive || syncFrame !== null) return
      syncFrame = window.requestAnimationFrame(() => {
        syncFrame = null
        syncLoadedImages()
      })
    }

    const imageLoadPromises = imageEntries.map(({ url }) => {
      const promise = loadImage(url)
      void promise.then(scheduleLoadedImageSync, scheduleLoadedImageSync)
      return promise
    })

    // Paint already-cached images immediately, then reveal each successful
    // decode as it arrives instead of waiting for the slowest image.
    syncLoadedImages()

    void Promise.allSettled(imageLoadPromises).then((results) => {
      if (!effectActive) return
      const failures: PromiseRejectedResult[] = []
      results.forEach((result) => {
        if (result.status === 'rejected') failures.push(result)
      })

      failures.forEach((failure) => console.error('Failed to load image', failure.reason))
      if (failures.length > 0) {
        window.setTimeout(() => {
          if (effectActive) window.dispatchEvent(new Event('xiv-frame:canvas-image-error'))
        }, 0)
      }
    })

    return () => {
      effectActive = false
      if (syncFrame !== null) {
        window.cancelAnimationFrame(syncFrame)
        syncFrame = null
      }
    }
  }, [images])

  useEffect(() => {
    const imageCache = imageCacheRef.current
    const pendingLoads = pendingImageLoadsRef.current
    activeRef.current = true
    return () => {
      activeRef.current = false
      activeUrlsRef.current.clear()
      imageCache.forEach(clearImageElement)
      imageCache.clear()
      pendingLoads.forEach((pending) => pending.cancel())
      pendingLoads.clear()
    }
  }, [])

  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current
      if (!container) return

      setStageSize((current) => {
        const next = {
          width: container.offsetWidth,
          height: container.offsetHeight,
        }

        return current.width === next.width && current.height === next.height
          ? current
          : next
      })
    }

    updateSize()

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateSize)
      : null

    if (containerRef.current) resizeObserver?.observe(containerRef.current)
    window.addEventListener('resize', updateSize)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  const occupiedSlotIndices = images.flatMap((url, index) => url ? [index] : [])
  const imageSlotCount = occupiedSlotIndices.length > 0
    ? Math.max(...occupiedSlotIndices) + 1
    : 0
  const loadedSlotSet = new Set(imagesData.map(({ sourceIndex }) => sourceIndex))
  const loadingSlotIndices = occupiedSlotIndices.filter((index) => !loadedSlotSet.has(index))

  const geometryImageCount = getLayoutGeometryImageCount(layoutPreset, imageSlotCount, hasChosenLayout)
  const { logicalWidth, logicalHeight, geometry, effectiveLayoutPreset } = useMemo(() => {
    const geometry = getLayoutGeometry(layoutPreset, geometryImageCount)
    const canvasSize = getCanvasLogicalSize(imagesData.map(({ image }) => image), geometry, {
      imageGap,
      imageTransition,
      blendWidth,
      canvasRatio,
    })

    return { ...canvasSize, geometry, effectiveLayoutPreset: geometry.effectivePreset }
  }, [imagesData, geometryImageCount, layoutPreset, imageGap, imageTransition, blendWidth, canvasRatio])

  const outerWidth = logicalWidth + (borderWidth * 2)
  const outerHeight = logicalHeight + (borderWidth * 2)
  const activeImageShape = imagesData.length === 1 && canvasRatio === '2:1' ? imageShape : 'rectangle'
  const emptySlotCount = Math.max(0, geometry.cells.length - occupiedSlotIndices.length)

  const scale = Math.min(
    stageSize.width / outerWidth,
    stageSize.height / outerHeight
  ) * 0.9

  // Add a fallback if scale is invalid
  if (!scale || scale <= 0 || !outerWidth || !outerHeight) return <div ref={containerRef} className="w-full h-full" />

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      data-layout-effective-preset={effectiveLayoutPreset}
      data-layout-image-count={occupiedSlotIndices.length}
      data-layout-loaded-image-count={imagesData.length}
      data-layout-loading-slot-count={loadingSlotIndices.length}
      data-layout-slot-count={geometry.cells.length}
      data-layout-empty-slot-count={emptySlotCount}
    >
      <Stage
        width={outerWidth * scale}
        height={outerHeight * scale}
        scaleX={scale}
        scaleY={scale}
        ref={stageRef}
      >
        <Layer>
          <BackgroundLayer 
            width={outerWidth} 
            height={outerHeight} 
            color={backgroundColor} 
            customColor={customBackgroundColor}
          />
        </Layer>
        
        {!isExporting && (emptySlotCount > 0 || loadingSlotIndices.length > 0) && (
          <EmptySlotLayer
            geometry={geometry}
            contentWidth={logicalWidth}
            contentHeight={logicalHeight}
            gap={imageTransition === 'soft-blend' ? -blendWidth : imageGap}
            borderWidth={borderWidth}
            occupiedSlotIndices={occupiedSlotIndices}
            backgroundColor={backgroundColor}
            primaryLabel={emptySlotLabel}
            primaryHint={emptySlotHint}
            onSlotSelect={onSlotSelect}
            disabled={emptySlotDisabled}
            loadingSlotIndices={loadingSlotIndices}
            loadingLabel={loadingSlotLabel}
            loadingHint={loadingSlotHint}
            displayScale={scale * (zoom / 100)}
          />
        )}

        <ImageGridLayer 
          images={imagesData}
          contentWidth={logicalWidth}
          contentHeight={logicalHeight}
          gap={imageTransition === 'soft-blend' ? -blendWidth : imageGap}
          borderWidth={borderWidth}
          isSoftBlend={imageTransition === 'soft-blend'}
          blendWidth={blendWidth}
          layoutPreset={layoutPreset}
          layoutImageCount={geometryImageCount}
          imageShape={activeImageShape}
          renderScale={isExporting ? 1 : Math.min(1, Math.max(0.1, scale * (zoom / 100)))}
          onImageSlotSelect={onSlotSelect}
        />

        {imagesData.length > 0 && (
          <Layer x={borderWidth} y={borderWidth}>
            <CharacterLayer
              contentWidth={logicalWidth}
              contentHeight={logicalHeight}
            />
            <SignatureLayer 
              contentWidth={logicalWidth}
              contentHeight={logicalHeight}
            />
            <LogoLayer 
              contentWidth={logicalWidth}
              contentHeight={logicalHeight}
            />
            <CopyrightLayer 
              contentWidth={logicalWidth}
              contentHeight={logicalHeight}
            />
          </Layer>
        )}

        <NoiseLayer 
          width={outerWidth} 
          height={outerHeight} 
          intensity={grainIntensity} 
        />
      </Stage>
    </div>
  )
}
