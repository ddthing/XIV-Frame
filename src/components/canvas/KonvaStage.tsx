import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Group } from 'react-konva'
import { useStore } from '@/store/useStore'
import { BackgroundLayer } from './layers/BackgroundLayer'
import { ImageGridLayer } from './layers/ImageGridLayer'
import { SignatureLayer } from './layers/SignatureLayer'
import { LogoLayer } from './layers/LogoLayer'
import { CopyrightLayer } from './layers/CopyrightLayer'

import type Konva from 'konva'

export default function KonvaStage({ stageRef }: { stageRef: React.RefObject<Konva.Stage | null> }) {
  const state = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [imagesData, setImagesData] = useState<HTMLImageElement[]>([])
  
  useEffect(() => {
    let active = true
    const imgInstances: HTMLImageElement[] = []
    
    const loadImages = async () => {
      const promises = state.images.map(url => {
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
  }, [state.images])

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  let logicalWidth = 1920
  let logicalHeight = 1080

  if (imagesData.length > 0) {
    const baseHeight = imagesData[0].height
    let totalWidth = 0
    let gridHeight = baseHeight
    
    if (state.layoutPreset === 'grid' && imagesData.length >= 3) {
      // 2x2 grid calculation
      const cellWidth = imagesData[0].width
      totalWidth = (cellWidth * 2) + state.imageGap
      gridHeight = (baseHeight * 2) + state.imageGap
    } else {
      // Horizontal layout calculation
      imagesData.forEach(img => {
        totalWidth += img.width * (baseHeight / img.height)
      })
      
      if (state.imageTransition === 'soft-blend') {
        totalWidth -= Math.max(0, imagesData.length - 1) * state.blendWidth
      } else {
        totalWidth += Math.max(0, imagesData.length - 1) * state.imageGap
      }
    }

    if (state.canvasRatio === '16:9') {
      logicalWidth = Math.max(totalWidth, gridHeight * (16 / 9))
      logicalHeight = logicalWidth * (9 / 16)
    } else if (state.canvasRatio === '2:1') {
      logicalWidth = Math.max(totalWidth, gridHeight * 2)
      logicalHeight = logicalWidth / 2
    } else {
      logicalWidth = totalWidth
      logicalHeight = gridHeight
    }
  }

  const outerWidth = logicalWidth + (state.borderWidth * 2)
  const outerHeight = logicalHeight + (state.borderWidth * 2)

  const scale = Math.min(
    stageSize.width / outerWidth,
    stageSize.height / outerHeight
  ) * (state.zoom / 100) * 0.9

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
            color={state.backgroundColor} 
          />
        </Layer>
        
        <ImageGridLayer 
          images={imagesData}
          contentWidth={logicalWidth}
          contentHeight={logicalHeight}
          gap={state.imageTransition === 'soft-blend' ? -state.blendWidth : state.imageGap}
          borderWidth={state.borderWidth}
          isSoftBlend={state.imageTransition === 'soft-blend'}
          blendWidth={state.blendWidth}
          layoutPreset={state.layoutPreset}
        />

        {imagesData.length > 0 && (
          <Layer x={state.borderWidth} y={state.borderWidth}>
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
      </Stage>
    </div>
  )
}
