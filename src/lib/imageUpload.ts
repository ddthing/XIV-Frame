export const MAX_UPLOAD_FILE_SIZE = 50 * 1024 * 1024
export const MAX_CANVAS_IMAGE_DIMENSION = 4096
const IMAGE_OPTIMIZATION_FILE_SIZE = 8 * 1024 * 1024

export function getImagePreparationMaxDimension(imageCount: number) {
  const normalizedImageCount = Number.isFinite(imageCount)
    ? Math.max(0, Math.floor(imageCount))
    : 0

  if (normalizedImageCount <= 1) return MAX_CANVAS_IMAGE_DIMENSION
  if (normalizedImageCount === 2) return 3072
  if (normalizedImageCount <= 4) return 2048
  return 1536
}

const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  'image/avif',
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const SUPPORTED_IMAGE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|webp)$/i

type ImageUploadErrorCode = 'invalid-type' | 'too-large' | 'decode' | 'prepare' | 'cancelled'

export class ImageUploadError extends Error {
  readonly code: ImageUploadErrorCode

  constructor(code: ImageUploadErrorCode, message: string) {
    super(message)
    this.name = 'ImageUploadError'
    this.code = code
  }
}

export function isSupportedImageFile(file: File) {
  const mimeType = file.type.toLowerCase()
  return SUPPORTED_IMAGE_MIME_TYPES.has(mimeType) || SUPPORTED_IMAGE_EXTENSION.test(file.name)
}

export function filterImageFiles(files: readonly File[]) {
  return files.filter((file) => file.type.startsWith('image/') || isSupportedImageFile(file))
}

export function validateImageFile(file: File, maxFileSize = MAX_UPLOAD_FILE_SIZE) {
  if (!isSupportedImageFile(file)) {
    throw new ImageUploadError('invalid-type', '이미지 파일만 추가할 수 있습니다.')
  }

  if (file.size > maxFileSize) {
    throw new ImageUploadError('too-large', `이미지 파일은 ${Math.round(maxFileSize / (1024 * 1024))}MB 이하만 가능합니다.`)
  }
}

export function revokeObjectUrl(url: string | null | undefined) {
  if (typeof URL === 'undefined' || !url?.startsWith('blob:')) return
  URL.revokeObjectURL(url)
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new ImageUploadError('cancelled', '이미지 업로드가 취소되었습니다.')
  }
}

function loadImage(objectUrl: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    let settled = false
    const cleanup = () => {
      signal?.removeEventListener('abort', handleAbort)
      image.onload = null
      image.onerror = null
    }
    const rejectCancelled = () => {
      if (settled) return
      settled = true
      cleanup()
      image.src = ''
      reject(new ImageUploadError('cancelled', '이미지 업로드가 취소되었습니다.'))
    }
    const handleAbort = () => rejectCancelled()

    if (signal?.aborted) {
      rejectCancelled()
      return
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
    image.onload = () => {
      if (settled) return
      settled = true
      cleanup()
      resolve(image)
    }
    image.onerror = () => {
      if (settled) return
      settled = true
      cleanup()
      reject(new ImageUploadError('decode', '이미지를 읽지 못했습니다.'))
    }
    image.src = objectUrl
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number, signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false
    const cleanup = () => signal?.removeEventListener('abort', handleAbort)
    const rejectCancelled = () => {
      if (settled) return
      settled = true
      cleanup()
      reject(new ImageUploadError('cancelled', '이미지 업로드가 취소되었습니다.'))
    }
    const handleAbort = () => rejectCancelled()

    if (signal?.aborted) {
      rejectCancelled()
      return
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
    try {
      canvas.toBlob((blob) => {
        if (settled) return
        settled = true
        cleanup()
        if (blob) resolve(blob)
        else reject(new ImageUploadError('prepare', '이미지를 최적화하지 못했습니다.'))
      }, type, quality)
    } catch (error) {
      if (settled) return
      settled = true
      cleanup()
      reject(error)
    }
  })
}

/**
 * Accept larger originals without keeping their full file size in the editor.
 * The canvas only retains a blob URL for the optimized result, so the upload
 * does not get serialized into localStorage.
 */
export async function prepareImageForCanvas(
  file: File,
  signal?: AbortSignal,
  options: { maxDimension?: number } = {},
): Promise<string> {
  throwIfAborted(signal)
  validateImageFile(file)
  const objectUrl = URL.createObjectURL(file)
  let keepObjectUrl = false
  const maxDimension = Math.max(
    1,
    Math.min(
      MAX_CANVAS_IMAGE_DIMENSION,
      Math.floor(options.maxDimension ?? MAX_CANVAS_IMAGE_DIMENSION),
    ),
  )

  try {
    const image = await loadImage(objectUrl, signal)
    throwIfAborted(signal)
    const sourceWidth = image.naturalWidth || image.width
    const sourceHeight = image.naturalHeight || image.height

    if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
      throw new ImageUploadError('decode', '이미지를 읽지 못했습니다.')
    }

    const shouldOptimize = file.size > IMAGE_OPTIMIZATION_FILE_SIZE
      || Math.max(sourceWidth, sourceHeight) > maxDimension

    if (!shouldOptimize) {
      throwIfAborted(signal)
      keepObjectUrl = true
      return objectUrl
    }

    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight))
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

    const webpBlob = await canvasToBlob(canvas, 'image/webp', 0.9, signal)
    const optimizedBlob = webpBlob.type === 'image/webp'
      ? webpBlob
      : await canvasToBlob(canvas, file.type === 'image/png' || /\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg', 0.9, signal)

    throwIfAborted(signal)
    const optimizedUrl = URL.createObjectURL(optimizedBlob)
    if (signal?.aborted) {
      revokeObjectUrl(optimizedUrl)
      throwIfAborted(signal)
    }
    return optimizedUrl
  } catch (error) {
    if (error instanceof ImageUploadError) throw error
    throw new ImageUploadError('prepare', '이미지를 최적화하지 못했습니다.')
  } finally {
    if (!keepObjectUrl) revokeObjectUrl(objectUrl)
  }
}
