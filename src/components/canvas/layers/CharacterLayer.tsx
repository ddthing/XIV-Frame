import { Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import { useShallow } from 'zustand/react/shallow'

import { useStore } from '@/store/useStore'

function CharacterLayerComponent({ contentWidth, contentHeight }: { contentWidth: number; contentHeight: number }) {
  const {
    characterCutoutUrl,
    characterPosition,
    characterScale,
    characterOpacity,
    characterFlipX,
    characterShadow,
    setCharacterPosition,
  } = useStore(useShallow((state) => ({
    characterCutoutUrl: state.characterCutoutUrl,
    characterPosition: state.characterPosition,
    characterScale: state.characterScale,
    characterOpacity: state.characterOpacity,
    characterFlipX: state.characterFlipX,
    characterShadow: state.characterShadow,
    setCharacterPosition: state.setCharacterPosition,
  })))

  const [characterImg] = useImage(characterCutoutUrl ?? '', 'anonymous')

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
  const position = characterPosition ?? {
    x: Math.max(0, (contentWidth - width) / 2),
    y: Math.max(0, contentHeight - height - Math.max(24, contentHeight * 0.06)),
  }

  return (
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
      onDragEnd={(event) => {
        setCharacterPosition({ x: event.target.x(), y: event.target.y() })
      }}
    />
  )
}

export const CharacterLayer = CharacterLayerComponent
