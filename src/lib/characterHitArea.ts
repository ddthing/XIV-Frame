type CharacterHitContext = {
  drawImage: (image: CanvasImageSource, dx: number, dy: number, dWidth: number, dHeight: number) => void
  fillRect: (x: number, y: number, width: number, height: number) => void
  globalCompositeOperation: GlobalCompositeOperation
  fillStyle: string | CanvasGradient | CanvasPattern
}

type CharacterHitShape = { colorKey: string }

export function drawCharacterHitArea(
  context: CharacterHitContext,
  shape: CharacterHitShape,
  image: CanvasImageSource,
  width: number,
  height: number,
) {
  context.drawImage(image, 0, 0, width, height)
  context.globalCompositeOperation = 'source-in'
  context.fillStyle = shape.colorKey
  context.fillRect(0, 0, width, height)
}
