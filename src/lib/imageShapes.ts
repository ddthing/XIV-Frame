export type ImageShape = 'rectangle' | 'circle' | 'heart' | 'star'

export const DEFAULT_IMAGE_SHAPE: ImageShape = 'rectangle'

interface ImageShapeContext {
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void
  beginPath(): void
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void
  closePath(): void
  clip(): void
  lineTo(x: number, y: number): void
  moveTo(x: number, y: number): void
  rect(x: number, y: number, width: number, height: number): void
}

/**
 * Adds a centered image mask path to a 2D canvas context.
 * The caller owns beginPath/clip so this helper can be reused by Konva.
 */
export function drawImageShapePath(
  context: ImageShapeContext,
  shape: Exclude<ImageShape, 'rectangle'>,
  width: number,
  height: number,
) {
  const size = Math.min(width, height) * 0.84
  const centerX = width / 2
  const centerY = height / 2
  const radius = size / 2

  if (shape === 'circle') {
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    return
  }

  if (shape === 'heart') {
    const topY = centerY - radius * 0.28
    const bottomY = centerY + radius * 0.9

    context.moveTo(centerX, bottomY)
    context.bezierCurveTo(
      centerX - radius * 0.52,
      centerY + radius * 0.5,
      centerX - radius,
      centerY + radius * 0.12,
      centerX - radius,
      topY,
    )
    context.bezierCurveTo(
      centerX - radius,
      centerY - radius * 0.24,
      centerX - radius * 0.56,
      centerY - radius * 0.58,
      centerX,
      centerY - radius * 0.14,
    )
    context.bezierCurveTo(
      centerX + radius * 0.56,
      centerY - radius * 0.58,
      centerX + radius,
      centerY - radius * 0.24,
      centerX + radius,
      topY,
    )
    context.bezierCurveTo(
      centerX + radius,
      centerY + radius * 0.12,
      centerX + radius * 0.52,
      centerY + radius * 0.5,
      centerX,
      bottomY,
    )
    return
  }

  const points = 10
  for (let index = 0; index < points; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5
    const pointRadius = index % 2 === 0 ? radius : radius * 0.44
    const x = centerX + Math.cos(angle) * pointRadius
    const y = centerY + Math.sin(angle) * pointRadius

    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
}

export function clipImageShape(
  context: ImageShapeContext,
  shape: ImageShape,
  width: number,
  height: number,
) {
  context.beginPath()
  if (shape === 'rectangle') context.rect(0, 0, width, height)
  else drawImageShapePath(context, shape, width, height)
  context.closePath()
  context.clip()
}
