import { Rect } from 'react-konva'
import type { BackgroundColor } from '@/store/useStore'

const DEFAULT_CUSTOM_BACKGROUND = '#e6e8e4'

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value)
}

export function BackgroundLayer({
  width,
  height,
  color,
  customColor = DEFAULT_CUSTOM_BACKGROUND,
}: {
  width: number
  height: number
  color: BackgroundColor
  customColor?: string
}) {
  if (color === 'transparent') return null

  const bgColor = color === 'white'
    ? '#ffffff'
    : color === 'black'
      ? '#171918'
      : color === 'custom' && isHexColor(customColor)
        ? customColor
        : '#f1f5f9'

  return <Rect width={width} height={height} fill={bgColor} />
}
