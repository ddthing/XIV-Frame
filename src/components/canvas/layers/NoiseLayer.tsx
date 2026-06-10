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
  return (
    <Layer listening={false}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fillPatternImage={noiseImage}
        fillPatternRepeat="repeat"
        opacity={intensity / 100}
        listening={false}
      />
    </Layer>
  )
}
