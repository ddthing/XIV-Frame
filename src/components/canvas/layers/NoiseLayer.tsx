import React from 'react'
import { Layer, Rect } from 'react-konva'
import useImage from 'use-image'

interface NoiseLayerProps {
  width: number
  height: number
  intensity: number
}

export function NoiseLayer({ width, height, intensity }: NoiseLayerProps) {
  const [noiseImage] = useImage('/noise-pattern.png')

  if (!noiseImage || intensity <= 0) return null

  // Since the noise pattern is 256x256, we can use it as a fillPattern
  // Keep the maximum restrained so the preview remains readable while still
  // making the control's effect visible before export.
  const opacity = Math.min(0.18, Math.max(0, intensity) / 100 * 0.18)

  return (
    <Layer listening={false}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillPatternImage={noiseImage}
        fillPatternRepeat="repeat"
        opacity={opacity}
        listening={false}
      />
    </Layer>
  )
}
