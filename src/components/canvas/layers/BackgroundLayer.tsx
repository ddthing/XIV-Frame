import { Rect } from 'react-konva'
import { BackgroundColor } from '@/store/useStore'

export function BackgroundLayer({ width, height, color }: { width: number, height: number, color: BackgroundColor }) {
  if (color === 'transparent') return null
  
  const bgColor = color === 'white' ? '#ffffff' : '#f1f5f9'
  
  return <Rect width={width} height={height} fill={bgColor} />
}
