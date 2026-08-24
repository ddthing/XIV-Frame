import React from 'react'
import { Layer, Group, Image as KonvaImage, Rect } from 'react-konva'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '@/store/useStore'
import { ImageUploadError, prepareImageForCanvas, revokeObjectUrl } from '@/lib/imageUpload'
import { getLayoutGeometry } from '@/lib/layoutTemplates'
import { clipImageShape, type ImageShape } from '@/lib/imageShapes'
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
  layoutPreset,
  imageShape = 'rectangle',
}: { 
  images: HTMLImageElement[], 
  contentWidth: number, 
  contentHeight: number, 
  gap: number,
  borderWidth?: number,
  isSoftBlend?: boolean,
  blendWidth?: number,
  layoutPreset?: string
  imageShape?: ImageShape
}) {
  const { imagePositions, imageScales, imageUrls, isImageLocked, setImagePosition, setImageAt, setImageScale } = useStore(useShallow(state => ({
    imagePositions: state.imagePositions,
    imageScales: state.imageScales,
    imageUrls: state.images,
    isImageLocked: state.isImageLocked,
    setImagePosition: state.setImagePosition,
    setImageAt: state.setImageAt,
    setImageScale: state.setImageScale,
  })))
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

  const geometry = getLayoutGeometry(layoutPreset, images.length)
  const isAspectRow = geometry.effectivePreset === 'split'
  const isAspectColumn = geometry.effectivePreset === 'vertical-split'

  let unitWidth = 0
  let unitHeight = 0
  
  if (isAspectColumn) {
    unitWidth = contentWidth
    unitHeight = (contentHeight - (gap * (images.length - 1))) / images.length
  } else if (isAspectRow) {
    unitWidth = (contentWidth - (gap * (images.length - 1))) / images.length
    unitHeight = contentHeight
  } else {
    unitWidth = (contentWidth - (gap * (geometry.columns - 1))) / geometry.columns
    unitHeight = (contentHeight - (gap * (geometry.rows - 1))) / geometry.rows
  }

  return (
    <>
      {images.map((img, index) => {
        const cell = geometry.cells[index] || { column: index, row: 0 }
        const columnSpan = cell.columnSpan ?? 1
        const rowSpan = cell.rowSpan ?? 1
        const itemWidth = isAspectRow ? unitWidth : unitWidth * columnSpan + (gap * (columnSpan - 1))
        const itemHeight = isAspectColumn ? unitHeight : unitHeight * rowSpan + (gap * (rowSpan - 1))
        let xPos = 0
        let yPos = 0
        
        if (isAspectColumn) {
          yPos = index * (itemHeight + gap)
        } else if (isAspectRow) {
          xPos = index * (itemWidth + gap)
        } else {
          xPos = cell.column * (unitWidth + gap)
          yPos = cell.row * (unitHeight + gap)
        }

        const baseScale = Math.max(itemWidth / img.width, itemHeight / img.height)
        const userScale = imageScales[index] || 1
        const scale = baseScale * userScale
        const hasShapeMask = images.length === 1 && imageShape !== 'rectangle'
        
        // Use saved position or default to 0,0
        const savedPos = imagePositions[index] || { x: 0, y: 0 }
        
        return (
          <Layer key={index}>
            <Group
              x={borderWidth + xPos}
              y={borderWidth + yPos}
            >
              <Group
                {...(hasShapeMask
                  ? {
                      clipFunc: (context) => {
                        clipImageShape(context, imageShape, itemWidth, itemHeight)
                      },
                    }
                  : {
                      clipX: 0,
                      clipY: 0,
                      clipWidth: itemWidth,
                      clipHeight: itemHeight,
                    })}
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
                {cell.column > 0 && (
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
                {cell.row > 0 && (
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
