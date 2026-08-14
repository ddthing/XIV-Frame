export const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024
export const MAX_CANVAS_IMAGE_DIMENSION = 4096

type ImageUploadErrorCode = 'invalid-type' | 'too-large' | 'decode' | 'prepare'

export class ImageUploadError extends Error {
  readonly code: ImageUploadErrorCode

  constructor(code: ImageUploadErrorCode, message: string) {
    super(message)
    this.name = 'ImageUploadError'
    this.code = code
  }
}

function isSupportedImage(file: File) {
  return file.type.startsWith('image/') || /\.(avif|bmp|gif|jpe?g|png|webp)$/i.test(file.name)
}

function loadImage(objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new ImageUploadError('decode', '이미지를 읽지 못했습니다.'))
    image.src = objectUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new ImageUploadError('prepare', '이미지를 최적화하지 못했습니다.'))
    }, type, quality)
  })
}

/**
 * Accept larger originals without keeping their full file size in the editor.
 * The canvas only retains a blob URL for the optimized result, so the upload
 * does not get serialized into localStorage.
 */
export async function prepareImageForCanvas(file: File): Promise<string> {
  if (!isSupportedImage(file)) {
    throw new ImageUploadError('invalid-type', '이미지 파일만 추가할 수 있습니다.')
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE) {
    throw new ImageUploadError('too-large', '이미지 파일은 50MB 이하만 가능합니다.')
  }

  const shouldOptimize = file.size > 8 * 1024 * 1024
  const objectUrl = URL.createObjectURL(file)

  if (!shouldOptimize) return objectUrl

  try {
    const image = await loadImage(objectUrl)
    const sourceWidth = image.naturalWidth || image.width
    const sourceHeight = image.naturalHeight || image.height
    const scale = Math.min(1, MAX_CANVAS_IMAGE_DIMENSION / Math.max(sourceWidth, sourceHeight))
    const width = Math.max(1, Math.round(sourceWidth * scale))
    const height = Math.max(1, Math.round(sourceHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) throw new ImageUploadError('prepare', '이미지를 최적화하지 못했습니다.')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, 0, 0, width, height)

    const webpBlob = await canvasToBlob(canvas, 'image/webp', 0.9)
    const optimizedBlob = webpBlob.type === 'image/webp'
      ? webpBlob
      : await canvasToBlob(canvas, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.9)

    return URL.createObjectURL(optimizedBlob)
  } catch (error) {
    if (error instanceof ImageUploadError) throw error
    throw new ImageUploadError('prepare', '이미지를 최적화하지 못했습니다.')
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
