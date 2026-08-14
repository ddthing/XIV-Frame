import React from 'react'
import { Layer, Group, Image as KonvaImage, Rect } from 'react-konva'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store/useStore'
import { ImageUploadError, prepareImageForCanvas, revokeObjectUrl } from '@/lib/imageUpload'
import type Konva from 'konva'

type PendingUpload = { requestId: number; sourceUrl: string | undefined }

function ImageGridLayerComponent({ 
  images, 
  contentWidth, 
  contentHeight, 
  gap,
  borderWidth = 0,
  isSoftBlend = false,
  blendWidth = 50,
  layoutPreset
}: { 
  images: HTMLImageElement[], 
  contentWidth: number, 
  contentHeight: number, 
  gap: number,
  borderWidth?: number,
  isSoftBlend?: boolean,
  blendWidth?: number,
  layoutPreset?: string
}) {
  const imagePositions = useStore(state => state.imagePositions)
  const imageScales = useStore(state => state.imageScales)
  const imageUrls = useStore(state => state.images)
  const isImageLocked = useStore(state => state.isImageLocked)
  const setImagePosition = useStore(state => state.setImagePosition)
  const setImageAt = useStore(state => state.setImageAt)
  const setImageScale = useStore(state => state.setImageScale)
  const t = useTranslations('ImageUploader')

  const isShiftPressed = React.useRef(false)
  const dragContexts = React.useRef<{ [key: number]: { startX: number, startY: number, axis: 'x' | 'y' | null, inverseTransform?: Konva.Transform, absoluteTransform?: Konva.Transform } }>({})
  const uploadRequests = React.useRef(new Map<number, PendingUpload>())
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Shift') isShiftPressed.current = true }
    const up = (e: KeyboardEvent) => { if (e.key === 'Shift') isShiftPressed.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  React.useEffect(() => {
    const requests = uploadRequests.current
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requests.clear()
    }
  }, [])

  React.useEffect(() => {
    uploadRequests.current.forEach((pending, index) => {
      if (imageUrls[index] !== pending.sourceUrl) {
        uploadRequests.current.set(index, { ...pending, requestId: pending.requestId + 1 })
      }
    })
  }, [imageUrls])

  const beginUpload = (index: number) => {
    const requestId = (uploadRequests.current.get(index)?.requestId ?? 0) + 1
    uploadRequests.current.set(index, { requestId, sourceUrl: imageUrls[index] })
    return requestId
  }

  const handleFileUpload = (index: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const requestId = beginUpload(index)

      void prepareImageForCanvas(file)
        .then((url) => {
          if (!mountedRef.current || uploadRequests.current.get(index)?.requestId !== requestId) {
            revokeObjectUrl(url)
            return
          }

          setImageAt(index, url)
          setImageScale(index, 1)
          setImagePosition(index, { x: 0, y: 0 })
          uploadRequests.current.delete(index)
        })
        .catch((error: unknown) => {
          if (!mountedRef.current || uploadRequests.current.get(index)?.requestId !== requestId) return
          const message = error instanceof ImageUploadError && error.code === 'too-large' ? t('uploadLimit') : t('uploadError')
          window.dispatchEvent(new CustomEvent('xiv-frame:upload-error', { detail: message }))
          uploadRequests.current.delete(index)
        })
    }
    input.click()
  }

  if (images.length === 0) return null

  const isGrid = layoutPreset === 'grid' && images.length >= 3
  const isVertical = layoutPreset === 'vertical-split'

  let itemWidth = 0
  let itemHeight = 0
  
  if (isGrid) {
    itemWidth = (contentWidth - gap) / 2
    itemHeight = (contentHeight - gap) / 2
  } else if (isVertical) {
    itemWidth = contentWidth
    itemHeight = (contentHeight - (gap * (images.length - 1))) / images.length
  } else {
    itemWidth = (contentWidth - (gap * (images.length - 1))) / images.length
    itemHeight = contentHeight
  }

  return (
    <>
      {images.map((img, index) => {
        let xPos = 0
        let yPos = 0
        
        if (isGrid) {
          if (index === 0) {
            xPos = 0; yPos = 0
          } else if (index === 1) {
            xPos = itemWidth + gap; yPos = 0
          } else if (index === 2) {
            xPos = 0; yPos = itemHeight + gap
          } else if (index === 3) {
            xPos = itemWidth + gap; yPos = itemHeight + gap
          }
        } else if (isVertical) {
          yPos = index * (itemHeight + gap)
        } else {
          xPos = index * (itemWidth + gap)
        }

        const baseScale = Math.max(itemWidth / img.width, itemHeight / img.height)
        const userScale = imageScales[index] || 1
        const scale = baseScale * userScale
        
        // Use saved position or default to 0,0
        const savedPos = imagePositions[index] || { x: 0, y: 0 }
        
        return (
          <Layer key={index}>
            <Group
              x={borderWidth + xPos}
              y={borderWidth + yPos}
            >
              <Group
                clipX={0}
                clipY={0}
                clipWidth={itemWidth}
                clipHeight={itemHeight}
              >
              <KonvaImage
                image={img}
                draggable={!isImageLocked}
                scaleX={scale}
                scaleY={scale}
                x={savedPos.x}
                y={savedPos.y}
                onDragStart={(e) => {
                  const parent = e.target.parent;
                  let inverseTransform = undefined;
                  let absoluteTransform = undefined;
                  if (parent) {
                    absoluteTransform = parent.getAbsoluteTransform().copy();
                    inverseTransform = absoluteTransform.copy().invert();
                  }
                  dragContexts.current[index] = { 
                    startX: e.target.x(), 
                    startY: e.target.y(), 
                    axis: null,
                    inverseTransform,
                    absoluteTransform
                  }
                }}
                onDragEnd={(e) => {
                  setImagePosition(index, { x: e.target.x(), y: e.target.y() })
                  delete dragContexts.current[index]
                }}
                onWheel={(e) => {
                  e.evt.preventDefault()
                  const scaleBy = 1.05
                  const oldScale = imageScales[index] || 1
                  const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
                  setImageScale(index, Math.max(0.5, Math.min(3, newScale)))
                }}
                onDblClick={() => handleFileUpload(index)}
                onDblTap={() => handleFileUpload(index)}
                dragBoundFunc={function(this: Konva.Node, pos) {
                  const ctx = dragContexts.current[index];
                  if (!ctx || !ctx.inverseTransform || !ctx.absoluteTransform) return pos;
                  
                  const relativePos = ctx.inverseTransform.point(pos);
                  
                  const scaledWidth = img.width * scale;
                  const scaledHeight = img.height * scale;
                  
                  const minX = -scaledWidth + 100;
                  const maxX = itemWidth - 100;
                  const minY = -scaledHeight + 100;
                  const maxY = itemHeight - 100;
                  
                  let newX = Math.max(minX, Math.min(maxX, relativePos.x));
                  let newY = Math.max(minY, Math.min(maxY, relativePos.y));
                  
                  if (isShiftPressed.current) {
                    const ctx = dragContexts.current[index]
                    if (ctx) {
                      if (!ctx.axis) {
                        const dx = Math.abs(newX - ctx.startX)
                        const dy = Math.abs(newY - ctx.startY)
                        if (dx > 5 || dy > 5) {
                          ctx.axis = dx > dy ? 'x' : 'y'
                        }
                      }
                      if (ctx.axis === 'x') {
                        newY = ctx.startY
                      } else if (ctx.axis === 'y') {
                        newX = ctx.startX
                      }
                    }
                  }
                  
                  return ctx.absoluteTransform.point({ x: newX, y: newY });
                }}
              />
            </Group>
            {isSoftBlend && blendWidth > 0 && (
              <>
                {/* 가로 블렌드 (Left to Right) */}
                {((!isGrid && !isVertical && index > 0) || (isGrid && (index === 1 || index === 3))) && (
                  <Rect
                    listening={false}
                    x={0}
                    y={0}
                    width={itemWidth}
                    height={itemHeight}
                    globalCompositeOperation="destination-in"
                    fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                    fillLinearGradientEndPoint={{ x: itemWidth, y: 0 }}
                    fillLinearGradientColorStops={[
                      0, 'rgba(0,0,0,0)',
                      Math.min(1, blendWidth / itemWidth), 'rgba(0,0,0,1)',
                      1, 'rgba(0,0,0,1)'
                    ]}
                  />
                )}
                {/* 세로 블렌드 (Top to Bottom) */}
                {((!isGrid && isVertical && index > 0) || (isGrid && (index === 2 || index === 3))) && (
                  <Rect
                    listening={false}
                    x={0}
                    y={0}
                    width={itemWidth}
                    height={itemHeight}
                    globalCompositeOperation="destination-in"
                    fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                    fillLinearGradientEndPoint={{ x: 0, y: itemHeight }}
                    fillLinearGradientColorStops={[
                      0, 'rgba(0,0,0,0)',
                      Math.min(1, blendWidth / itemHeight), 'rgba(0,0,0,1)',
                      1, 'rgba(0,0,0,1)'
                    ]}
                  />
                )}
              </>
            )}
            </Group>
          </Layer>
        )
      })}
    </>
  )
}

export const ImageGridLayer = React.memo(ImageGridLayerComponent)
