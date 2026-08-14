import { useState } from 'react'
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva'
import useImage from 'use-image'
import { useShallow } from 'zustand/react/shallow'

import { useStore } from '@/store/useStore'

type CanvasPosition = { x: number; y: number }

function CharacterGuide({
  position,
  width,
  height,
  contentWidth,
  contentHeight,
  flipped,
}: {
  position: CanvasPosition
  width: number
  height: number
  contentWidth: number
  contentHeight: number
  flipped: boolean
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
  const strokeWidth = Math.max(4, Math.min(8, contentHeight * 0.004))
  const dashSize = Math.max(14, Math.min(28, contentHeight * 0.018))

  return (
    <Group listening={false}>
      <Rect
        x={visualX - inset}
        y={visualY - inset}
        width={width + inset * 2}
        height={height + inset * 2}
        stroke="#e7f5a5"
        strokeWidth={strokeWidth}
        dash={[dashSize, dashSize * 0.7]}
        shadowColor="#122404"
        shadowBlur={8}
        shadowOpacity={0.55}
      />
      <Rect
        x={labelX}
        y={labelY}
        width={labelWidth}
        height={labelHeight}
        fill="#173806"
        opacity={0.94}
        cornerRadius={6}
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
    isExporting,
  } = useStore(useShallow((state) => ({
    characterCutoutUrl: state.characterCutoutUrl,
    characterPosition: state.characterPosition,
    characterScale: state.characterScale,
    characterOpacity: state.characterOpacity,
    characterFlipX: state.characterFlipX,
    characterShadow: state.characterShadow,
    setCharacterPosition: state.setCharacterPosition,
    isExporting: state.isExporting,
  })))

  const [characterImg] = useImage(characterCutoutUrl ?? '', 'anonymous')
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [livePosition, setLivePosition] = useState<CanvasPosition | null>(null)

  if (!characterImg || !characterImg.width || !characterImg.height) return null

  // The default footprint is intentionally portrait-friendly for full-body
  // characters, while the user can enlarge it beyond that base size.
  const baseScale = Math.min(
    (contentWidth * 0.58) / characterImg.width,
    (contentHeight * 0.86) / characterImg.height,
  )
  const scale = baseScale * characterScale
  const width = characterImg.width * scale
  const height = characterImg.height * scale
  const position = livePosition ?? characterPosition ?? {
    x: Math.max(0, (contentWidth - width) / 2),
    y: Math.max(0, contentHeight - height - Math.max(24, contentHeight * 0.06)),
  }
  const showGuide = !isExporting && (isHovered || isDragging)

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
          position={position}
          width={width}
          height={height}
          contentWidth={contentWidth}
          contentHeight={contentHeight}
          flipped={characterFlipX}
        />
      )}
    </>
  )
}

export const CharacterLayer = CharacterLayerComponent
