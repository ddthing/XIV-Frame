export type PhotoOperation = 'rotate-left' | 'rotate-right' | 'flip-horizontal' | 'flip-vertical'

export function getPhotoTransform(width: number, height: number, operation: PhotoOperation) {
  const quarterTurn = operation === 'rotate-left' || operation === 'rotate-right'
  return {
    width: quarterTurn ? height : width,
    height: quarterTurn ? width : height,
    matrix: operation === 'rotate-right' ? [0, 1, -1, 0, height, 0]
      : operation === 'rotate-left' ? [0, -1, 1, 0, 0, width]
      : operation === 'flip-horizontal' ? [-1, 0, 0, 1, width, 0]
      : [1, 0, 0, -1, 0, height],
  }
}

/** PNG keeps alpha and avoids cumulative JPEG compression during editing. */
export async function transformPhoto(source: string, operation: PhotoOperation): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image decode failed'))
    image.src = source
  })
  const transform = getPhotoTransform(image.naturalWidth, image.naturalHeight, operation)
  const canvas = document.createElement('canvas')
  canvas.width = transform.width
  canvas.height = transform.height
  try {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas unavailable')
    context.setTransform(...transform.matrix as [number, number, number, number, number, number])
    context.drawImage(image, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Image encoding failed'))
    }, 'image/png'))
    return URL.createObjectURL(blob)
  } finally {
    canvas.width = canvas.height = 0
    image.src = ''
  }
}

export function getPhotoFit(image: { width: number; height: number }, cell: { width: number; height: number }, mode: 'contain' | 'cover') {
  const cover = Math.max(cell.width / image.width, cell.height / image.height)
  const scale = mode === 'cover' ? cover : Math.min(cell.width / image.width, cell.height / image.height)
  return {
    scale: scale / cover,
    position: { x: (cell.width - image.width * scale) / 2, y: (cell.height - image.height * scale) / 2 },
  }
}
