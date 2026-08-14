import { useMemo, useRef, useState } from 'react'
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva'
import useImage from 'use-image'
import { useShallow } from 'zustand/react/shallow'

import { useStore } from '@/store/useStore'

type CanvasPosition = { x: number; y: number }

function createAlphaOutline(image: HTMLImageElement) {
  if (typeof document === 'undefined') return null

  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  if (!width || !height) return null

  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = width
  sourceCanvas.height = height
  const sourceContext = sourceCanvas.getContext('2d')
  if (!sourceContext) return null
  sourceContext.drawImage(image, 0, 0, width, height)

  const silhouetteCanvas = document.createElement('canvas')
  silhouetteCanvas.width = width
  silhouetteCanvas.height = height
  const silhouetteContext = silhouetteCanvas.getContext('2d')
  if (!silhouetteContext) return null
  silhouetteContext.drawImage(sourceCanvas, 0, 0)
  silhouetteContext.globalCompositeOperation = 'source-in'
  silhouetteContext.fillStyle = '#e7f5a5'
  silhouetteContext.fillRect(0, 0, width, height)

  const outlineCanvas = document.createElement('canvas')
  outlineCanvas.width = width
  outlineCanvas.height = height
  const outlineContext = outlineCanvas.getContext('2d')
  if (!outlineContext) return null

  const spread = Math.max(3, Math.min(18, Math.round(Math.min(width, height) * 0.01)))
  const offsets = [
    [-spread, -spread], [0, -spread], [spread, -spread],
    [-spread, 0], [spread, 0],
    [-spread, spread], [0, spread], [spread, spread],
  ]

  offsets.forEach(([x, y]) => outlineContext.drawImage(silhouetteCanvas, x, y))
  outlineContext.globalCompositeOperation = 'destination-out'
  outlineContext.drawImage(sourceCanvas, 0, 0)
  return outlineCanvas
}

function CharacterGuide({
  outlineImage,
  position,
  width,
  height,
  scale,
  imageWidth,
  imageHeight,
  flipped,
  contentWidth,
  contentHeight,
  onResizeStart,
  onResizePreview,
  onResizeEnd,
}: {
  outlineImage: HTMLCanvasElement | null
  position: CanvasPosition
  width: number
  height: number
  scale: number
  imageWidth: number
  imageHeight: number
  flipped: boolean
  contentWidth: number
  contentHeight: number
  onResizeStart: () => void
  onResizePreview: (handleX: number) => void
  onResizeEnd: () => void
}) {
  const inset = Math.max(8, Math.min(16, contentHeight * 0.012))
  const visualX = flipped ? position.x - width : position.x
  const visualY = position.y
  const labelFontSize = Math.max(22, Math.min(34, contentHeight * 0.03))
  const labelHeight = labelFontSize + 18
  const labelText = `X ${Math.round(visualX)}   Y ${Math.round(visualY)}   W ${Math.round(width)}   H ${Math.round(height)}`
  const labelWidth = Math.min(
    Math.max(220, contentWidth - 24),
    labelText.length * labelFontSize * 0.58 + 28,
  )
  const maxLabelX = Math.max(12, contentWidth - labelWidth - 12)
  const labelX = Math.min(Math.max(visualX, 12), maxLabelX)
  const labelAboveY = visualY - labelHeight - 12
  const labelBelowY = visualY + height + 12
  const maxLabelY = Math.max(12, contentHeight - labelHeight - 12)
  const labelY = labelAboveY >= 12
    ? labelAboveY
    : Math.min(labelBelowY, maxLabelY)
  const handleSize = Math.max(18, Math.min(32, contentHeight * 0.024))
  const handleX = visualX + width - handleSize / 2
  const handleY = visualY + height - handleSize / 2

  return (
    <Group>
      {outlineImage && (
        <KonvaImage
          image={outlineImage}
          x={position.x}
          y={position.y}
          width={imageWidth}
          height={imageHeight}
          scaleX={flipped ? -scale : scale}
          scaleY={scale}
          offsetX={flipped ? imageWidth : 0}
          opacity={0.95}
          listening={false}
        />
      )}
      <Rect
        x={labelX}
        y={labelY}
        width={labelWidth}
        height={labelHeight}
        fill="#173806"
        opacity={0.94}
        cornerRadius={6}
        listening={false}
      />
      <Text
        x={labelX + 14}
        y={labelY + 9}
        width={Math.max(0, labelWidth - 28)}
        height={labelFontSize}
        text={labelText}
        fontFamily="monospace"
        fontSize={labelFontSize}
        fill="#f4f7dd"
        verticalAlign="middle"
        ellipsis
        listening={false}
      />
      <Rect
        x={handleX}
        y={handleY}
        width={handleSize}
        height={handleSize}
        fill="#e7f5a5"
        stroke="#173806"
        strokeWidth={Math.max(2, inset * 0.35)}
        cornerRadius={Math.max(3, handleSize * 0.2)}
        draggable
        onMouseEnter={(event) => {
          event.target.getStage()?.container().style.setProperty('cursor', 'nwse-resize')
        }}
        onMouseLeave={(event) => {
          event.target.getStage()?.container().style.setProperty('cursor', 'default')
        }}
        onDragStart={(event) => {
          event.cancelBubble = true
          onResizeStart()
        }}
        onDragMove={(event) => {
          event.cancelBubble = true
          onResizePreview(event.target.x() + handleSize / 2)
        }}
        onDragEnd={(event) => {
          event.cancelBubble = true
          onResizeEnd()
        }}
      />
    </Group>
  )
}

function CharacterLayerComponent({ contentWidth, contentHeight }: { contentWidth: number; contentHeight: number }) {
  const {
    characterCutoutUrl,
    characterPosition,
    characterScale,
    characterOpacity,
    characterFlipX,
    characterShadow,
    setCharacterPosition,
    setCharacterScale,
    isExporting,
  } = useStore(useShallow((state) => ({
    characterCutoutUrl: state.characterCutoutUrl,
    characterPosition: state.characterPosition,
    characterScale: state.characterScale,
    characterOpacity: state.characterOpacity,
    characterFlipX: state.characterFlipX,
    characterShadow: state.characterShadow,
    setCharacterPosition: state.setCharacterPosition,
    setCharacterScale: state.setCharacterScale,
    isExporting: state.isExporting,
  })))

  const [characterImg] = useImage(characterCutoutUrl ?? '', 'anonymous')
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [livePosition, setLivePosition] = useState<CanvasPosition | null>(null)
  const [liveScale, setLiveScale] = useState<number | null>(null)
  const resizePreviewRef = useRef<{ scale: number; position: CanvasPosition } | null>(null)
  const outlineImage = useMemo(
    () => characterImg ? createAlphaOutline(characterImg) : null,
    [characterImg],
  )

  if (!characterImg || !characterImg.width || !characterImg.height) return null

  // The default footprint is intentionally portrait-friendly for full-body
  // characters, while the user can enlarge it beyond that base size.
  const baseScale = Math.min(
    (contentWidth * 0.58) / characterImg.width,
    (contentHeight * 0.86) / characterImg.height,
  )
  const renderedCharacterScale = liveScale ?? characterScale
  const scale = baseScale * renderedCharacterScale
  const width = characterImg.width * scale
  const height = characterImg.height * scale
  const position = livePosition ?? characterPosition ?? {
    x: Math.max(0, (contentWidth - width) / 2),
    y: Math.max(0, contentHeight - height - Math.max(24, contentHeight * 0.06)),
  }
  const showGuide = !isExporting && (isHovered || isDragging || isResizing)

  const handleResizePreview = (handleX: number) => {
    const visualX = characterFlipX ? position.x - width : position.x
    const nextWidth = Math.max(80, handleX - visualX)
    const nextScale = Math.max(0.25, Math.min(2.4, nextWidth / (characterImg.width * baseScale)))
    const nextPosition = characterFlipX
      ? { x: visualX + characterImg.width * baseScale * nextScale, y: position.y }
      : position

    resizePreviewRef.current = { scale: nextScale, position: nextPosition }
    setLiveScale(nextScale)
    if (characterFlipX) setLivePosition(nextPosition)
  }

  const handleResizeEnd = () => {
    const preview = resizePreviewRef.current
    if (preview) {
      setCharacterScale(preview.scale)
      setCharacterPosition(preview.position)
    }
    resizePreviewRef.current = null
    setLiveScale(null)
    setIsResizing(false)
  }

  return (
    <>
      <KonvaImage
        image={characterImg}
        x={position.x}
        y={position.y}
        width={characterImg.width}
        height={characterImg.height}
        scaleX={characterFlipX ? -scale : scale}
        scaleY={scale}
        offsetX={characterFlipX ? characterImg.width : 0}
        opacity={characterOpacity / 100}
        draggable
        shadowColor={characterShadow ? '#000000' : undefined}
        shadowBlur={characterShadow ? Math.max(12, width * 0.018) : 0}
        shadowOffset={{ x: 0, y: characterShadow ? Math.max(8, height * 0.012) : 0 }}
        shadowOpacity={characterShadow ? 0.24 : 0}
        onMouseEnter={(event) => {
          setIsHovered(true)
          event.target.getStage()?.container().style.setProperty('cursor', 'move')
        }}
        onMouseLeave={(event) => {
          if (!isDragging) setIsHovered(false)
          event.target.getStage()?.container().style.setProperty('cursor', 'default')
        }}
        onDragStart={(event) => {
          setIsDragging(true)
          setLivePosition({ x: event.target.x(), y: event.target.y() })
        }}
        onDragMove={(event) => {
          setLivePosition({ x: event.target.x(), y: event.target.y() })
        }}
        onDragEnd={(event) => {
          const nextPosition = { x: event.target.x(), y: event.target.y() }
          setCharacterPosition(nextPosition)
          setLivePosition(null)
          setIsDragging(false)
        }}
      />
      {showGuide && (
        <CharacterGuide
          outlineImage={outlineImage}
          position={position}
          width={width}
          height={height}
          scale={scale}
          imageWidth={characterImg.width}
          imageHeight={characterImg.height}
          flipped={characterFlipX}
          contentWidth={contentWidth}
          contentHeight={contentHeight}
          onResizeStart={() => {
            setIsResizing(true)
            resizePreviewRef.current = null
          }}
          onResizePreview={handleResizePreview}
          onResizeEnd={handleResizeEnd}
        />
      )}
    </>
  )
}

export const CharacterLayer = CharacterLayerComponent
