import React from 'react'
import { Layer, Group, Image as KonvaImage, Rect } from 'react-konva'
import { useStore } from '@/store/useStore'
import type Konva from 'konva'

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
  const isImageLocked = useStore(state => state.isImageLocked)
  const setImagePosition = useStore(state => state.setImagePosition)

  if (images.length === 0) return null

  const isGrid = layoutPreset === 'grid' && images.length >= 3
  const itemWidth = isGrid ? (contentWidth - gap) / 2 : (contentWidth - (gap * (images.length - 1))) / images.length
  const itemHeight = isGrid ? (contentHeight - gap) / 2 : contentHeight

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
                onDragEnd={(e) => {
                  setImagePosition(index, { x: e.target.x(), y: e.target.y() })
                }}
                dragBoundFunc={function(this: Konva.Node, pos) {
                  // eslint-disable-next-line @typescript-eslint/no-this-alias
                  const node = this;
                  const parent = node.parent;
                  if (!parent) return pos;
                  
                  const transform = parent.getAbsoluteTransform().copy();
                  transform.invert();
                  
                  const relativePos = transform.point(pos);
                  
                  const scaledWidth = img.width * scale;
                  const scaledHeight = img.height * scale;
                  
                  const minX = -scaledWidth + 100;
                  const maxX = itemWidth - 100;
                  const minY = -scaledHeight + 100;
                  const maxY = itemHeight - 100;
                  
                  const newX = Math.max(minX, Math.min(maxX, relativePos.x));
                  const newY = Math.max(minY, Math.min(maxY, relativePos.y));
                  
                  return parent.getAbsoluteTransform().point({ x: newX, y: newY });
                }}
              />
            </Group>
            {isSoftBlend && !isGrid && index > 0 && blendWidth > 0 && (
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
            </Group>
          </Layer>
        )
      })}
    </>
  )
}

export const ImageGridLayer = React.memo(ImageGridLayerComponent)
