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

import type Konva from 'konva'

interface KonvaStageProps {
  stageRef: React.RefObject<Konva.Stage | null>
  onLoadError?: () => void
  onLoadStateChange?: (isLoading: boolean) => void
}

export default function KonvaStage({ stageRef, onLoadError, onLoadStateChange }: KonvaStageProps) {
  const {
    images, layoutPreset, imageGap, imageTransition, blendWidth, canvasRatio,
    borderWidth, backgroundColor, grainIntensity, setIsCanvasLoading
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
    setIsCanvasLoading: state.setIsCanvasLoading,
  })))
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [loadedImages, setLoadedImages] = useState<{ images: HTMLImageElement[]; sources: string }>({ images: [], sources: '' })
  const imagesData = loadedImages.images
  const requestedSources = JSON.stringify(images.filter(Boolean))

  useEffect(() => {
    const container = containerRef.current
    // Both responsive editors are mounted. Only the visible one owns the
    // shared loading indicator; each stage also carries its own source revision.
    if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
      setIsCanvasLoading(!stageRef.current || loadedImages.sources !== requestedSources)
    }
  }, [loadedImages.sources, requestedSources, stageRef, stageSize, setIsCanvasLoading])
  
  useEffect(() => {
    let active = true
    const imgInstances: HTMLImageElement[] = []
    
    const loadImages = async () => {
      const validImages = images.filter((url): url is string => Boolean(url))
      onLoadStateChange?.(true)
      const promises = validImages.map(url => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image()
          imgInstances.push(img)
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = url
        })
      })
      
      try {
        const loaded = await Promise.all(promises)
        if (active) {
          setLoadedImages({ images: loaded, sources: JSON.stringify(validImages) })
          onLoadStateChange?.(false)
        }
      } catch {
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
      imgInstances.forEach(img => {
        img.onload = null
        img.onerror = null
        img.src = ''
      })
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
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <Stage
        width={outerWidth * scale}
        height={outerHeight * scale}
        scaleX={scale}
        scaleY={scale}
        exportImageSources={loadedImages.sources === requestedSources ? requestedSources : null}
        ref={stageRef}
      >
        <Layer>
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

        <NoiseLayer 
          width={outerWidth} 
          height={outerHeight} 
          intensity={grainIntensity} 
        />
      </Stage>
    </div>
  )
}
