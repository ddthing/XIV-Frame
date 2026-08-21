export type ImagePosition = { x: number; y: number }
export type ImageNudgeDirection = 'up' | 'left' | 'right' | 'down'

const directionDelta: Record<ImageNudgeDirection, ImagePosition> = {
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
}

export function nudgeImagePosition(position: ImagePosition, direction: ImageNudgeDirection, amount = 1): ImagePosition {
  const delta = directionDelta[direction]
  return {
    x: position.x + delta.x * amount,
    y: position.y + delta.y * amount,
  }
}
