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
import { getLayoutGeometry } from '@/lib/layoutTemplates'

import type Konva from 'konva'

export default function KonvaStage({ stageRef }: { stageRef: React.RefObject<Konva.Stage | null> }) {
  const {
    images, layoutPreset, imageGap, imageTransition, blendWidth, canvasRatio,
    borderWidth, backgroundColor, customBackgroundColor, grainIntensity, imageShape
  } = useStore(useShallow(state => ({
    images: state.images,
    layoutPreset: state.layoutPreset,
    imageGap: state.imageGap,
    imageTransition: state.imageTransition,
    blendWidth: state.blendWidth,
    canvasRatio: state.canvasRatio,
    borderWidth: state.borderWidth,
    backgroundColor: state.backgroundColor,
    customBackgroundColor: state.customBackgroundColor,
    grainIntensity: state.grainIntensity,
    imageShape: state.imageShape,
  })))
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [imagesData, setImagesData] = useState<HTMLImageElement[]>([])
  
  useEffect(() => {
    let active = true
    const imgInstances: HTMLImageElement[] = []
    
    const loadImages = async () => {
      const promises = images.map(url => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image()
          imgInstances.push(img)
          img.src = url
          img.onload = () => resolve(img)
          img.onerror = reject
        })
      })
      
      try {
        const loaded = await Promise.all(promises)
        if (active) setImagesData(loaded)
      } catch (e) {
        console.error('Failed to load image', e)
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
  }, [images])

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

  const { logicalWidth, logicalHeight } = useMemo(() => {
    let width = 1920
    let height = 1080

    if (imagesData.length > 0) {
      const baseHeight = imagesData[0].height
      let totalWidth = 0
      let gridHeight = baseHeight
      const geometry = getLayoutGeometry(layoutPreset, imagesData.length)

      if (geometry.effectivePreset === 'grid') {
        const cellWidth = imagesData[0].width
        totalWidth = (cellWidth * geometry.columns) + (imageGap * (geometry.columns - 1))
        gridHeight = (baseHeight * geometry.rows) + (imageGap * (geometry.rows - 1))
      } else if (geometry.effectivePreset === 'vertical-split') {
        const baseWidth = imagesData[0].width
        totalWidth = baseWidth
        gridHeight = 0
        imagesData.forEach(img => {
          gridHeight += img.height * (baseWidth / img.width)
        })
        gridHeight += Math.max(0, imagesData.length - 1) * imageGap
      } else if (geometry.effectivePreset === 'split') {
        imagesData.forEach(img => {
          totalWidth += img.width * (baseHeight / img.height)
        })
        
        if (imageTransition === 'soft-blend') {
          totalWidth -= Math.max(0, imagesData.length - 1) * blendWidth
        } else {
          totalWidth += Math.max(0, imagesData.length - 1) * imageGap
        }
      } else {
        const cellWidth = imagesData[0].width
        const cellHeight = imagesData[0].height
        const layoutGap = imageTransition === 'soft-blend' ? -blendWidth : imageGap
        totalWidth = (cellWidth * geometry.columns) + (layoutGap * (geometry.columns - 1))
        gridHeight = (cellHeight * geometry.rows) + (layoutGap * (geometry.rows - 1))
      }

      if (canvasRatio === '16:9') {
        width = Math.max(totalWidth, gridHeight * (16 / 9))
        height = width * (9 / 16)
      } else if (canvasRatio === '2:1') {
        width = Math.max(totalWidth, gridHeight * 2)
        height = width / 2
      } else {
        width = totalWidth
        height = gridHeight
      }
    }
    return { logicalWidth: width, logicalHeight: height }
  }, [imagesData, layoutPreset, imageGap, imageTransition, blendWidth, canvasRatio])

  const outerWidth = logicalWidth + (borderWidth * 2)
  const outerHeight = logicalHeight + (borderWidth * 2)
  const activeImageShape = imagesData.length === 1 && canvasRatio === '2:1' ? imageShape : 'rectangle'

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
        
        <ImageGridLayer 
          images={imagesData}
          contentWidth={logicalWidth}
          contentHeight={logicalHeight}
          gap={imageTransition === 'soft-blend' ? -blendWidth : imageGap}
          borderWidth={borderWidth}
          isSoftBlend={imageTransition === 'soft-blend'}
          blendWidth={blendWidth}
          layoutPreset={layoutPreset}
          imageShape={activeImageShape}
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
