import { useEffect, useRef, useState, useMemo } from 'react'
import { Stage, Layer } from 'react-konva'
import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { BackgroundLayer } from './layers/BackgroundLayer'
import { ImageGridLayer } from './layers/ImageGridLayer'
import { CharacterLayer } from './layers/CharacterLayer'
import { SignatureLayer } from './layers/SignatureLayer'
import { LogoLayer } from './layers/LogoLayer'
import { CopyrightLayer } from './layers/CopyrightLayer'
import { NoiseLayer } from './layers/NoiseLayer'
import { getCanvasDimensions } from '@/lib/canvasGeometry'
import { loadCanvasImages } from '@/lib/canvasImages'

import type Konva from 'konva'

interface KonvaStageProps {
  stageRef: React.RefObject<Konva.Stage | null>
  onLoadError?: () => void
  onLoadStateChange?: (isLoading: boolean) => void
}

export default function KonvaStage({ stageRef, onLoadError, onLoadStateChange }: KonvaStageProps) {
  const {
    images, layoutPreset, imageGap, imageTransition, blendWidth, canvasRatio,
    borderWidth, backgroundColor, grainIntensity, showGuides, setIsCanvasLoading
  } = useStore(useShallow(state => ({
    images: state.images,
    layoutPreset: state.layoutPreset,
    imageGap: state.imageGap,
    imageTransition: state.imageTransition,
    blendWidth: state.blendWidth,
    canvasRatio: state.canvasRatio,
    borderWidth: state.borderWidth,
    backgroundColor: state.backgroundColor,
    grainIntensity: state.grainIntensity,
    showGuides: state.showGuides,
    setIsCanvasLoading: state.setIsCanvasLoading,
  })))
  
  const containerRef = useRef<HTMLDivElement>(null)
  const decodedImages = useRef(new Map<string, HTMLImageElement>())
  
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [loadedImages, setLoadedImages] = useState<{ images: HTMLImageElement[]; sources: string }>({ images: [], sources: '' })
  const imagesData = loadedImages.images
  const requestedSources = JSON.stringify(images.filter(Boolean))

  useEffect(() => {
    const container = containerRef.current
    // The active responsive editor owns loading and the export source revision.
    if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
      setIsCanvasLoading(!stageRef.current || loadedImages.sources !== requestedSources)
    }
  }, [loadedImages.sources, requestedSources, stageRef, stageSize, setIsCanvasLoading])
  
  useEffect(() => {
    let active = true
    const validImages = images.filter((url): url is string => Boolean(url))
    const batch = loadCanvasImages(validImages, decodedImages.current)
    
    const loadImages = async () => {
      onLoadStateChange?.(true)
      
      try {
        const loaded = await batch.promise
        if (active) {
          decodedImages.current = new Map(validImages.map((source, index) => [source, loaded[index]]))
          setLoadedImages({ images: loaded, sources: JSON.stringify(validImages) })
          onLoadStateChange?.(false)
        }
      } catch {
        batch.cancel()
        if (active) {
          setLoadedImages({ images: [], sources: '' })
          onLoadStateChange?.(false)
          onLoadError?.()
        }
      }
    }
    loadImages()
    return () => { 
      active = false 
      batch.cancel()
    }
  }, [images, onLoadError, onLoadStateChange])

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

  const { logicalWidth, logicalHeight, outerWidth, outerHeight } = useMemo(() => getCanvasDimensions({
    images: imagesData,
    layoutPreset,
    gap: imageTransition === 'soft-blend' ? -blendWidth : imageGap,
    canvasRatio,
    borderWidth,
  }), [imagesData, layoutPreset, imageGap, imageTransition, blendWidth, canvasRatio, borderWidth])

  const scale = Math.min(
    stageSize.width / outerWidth,
    stageSize.height / outerHeight
  ) * 0.9

  // Add a fallback if scale is invalid
  if (!scale || scale <= 0 || !outerWidth || !outerHeight) return <div ref={containerRef} className="w-full h-full" />

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {backgroundColor === 'transparent' && <div aria-hidden="true" className="canvas-transparency pointer-events-none absolute" style={{ width: outerWidth * scale, height: outerHeight * scale }} />}
      <Stage
        width={outerWidth * scale}
        height={outerHeight * scale}
        scaleX={scale}
        scaleY={scale}
        exportImageSources={loadedImages.sources === requestedSources ? requestedSources : null}
        ref={stageRef}
      >
        <Layer listening={false}>
          <BackgroundLayer 
            width={outerWidth} 
            height={outerHeight} 
            color={backgroundColor} 
          />
        </Layer>
        
        <ImageGridLayer 
          images={imagesData}
          contentWidth={logicalWidth}
          contentHeight={logicalHeight}
          gap={imageTransition === 'soft-blend' ? -blendWidth : imageGap}
          borderWidth={borderWidth}
          isSoftBlend={imageTransition === 'soft-blend'}
          blendWidth={blendWidth}
          layoutPreset={layoutPreset}
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

        {grainIntensity > 0 && <NoiseLayer
          width={outerWidth} 
          height={outerHeight} 
          intensity={grainIntensity} 
        />}
      </Stage>
      {showGuides && <svg data-canvas-guides="true" aria-hidden="true" className="pointer-events-none absolute" width={logicalWidth * scale} height={logicalHeight * scale} viewBox="0 0 3 3" preserveAspectRatio="none">
        <path d="M1 0V3 M2 0V3 M0 1H3 M0 2H3" fill="none" stroke="black" strokeOpacity="0.4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path d="M1 0V3 M2 0V3 M0 1H3 M0 2H3" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>}
    </div>
  )
}
