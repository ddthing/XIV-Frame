import { ImageUploadError, revokeObjectUrl, validateImageFile } from './imageUpload'

export const CHARACTER_MODEL_ID = 'onnx-community/ormbg-ONNX'
export const CHARACTER_MODEL_DTYPE = 'q8'
export const CHARACTER_MAX_DIMENSION = 1536

type BackgroundRemovalResult = {
  data: Uint8Array | Uint8ClampedArray
  width: number
  height: number
  channels: number
}

type BackgroundRemovalPipeline = (input: Blob) => Promise<BackgroundRemovalResult>
type ProgressListener = (progress: number) => void

let pipelinePromise: Promise<BackgroundRemovalPipeline> | null = null
const progressListeners = new Set<ProgressListener>()

function emitProgress(progress: number) {
  progressListeners.forEach((listener) => listener(progress))
}

function subscribeToProgress(listener?: ProgressListener) {
  if (!listener) return () => undefined
  progressListeners.add(listener)
  return () => progressListeners.delete(listener)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'))
    image.src = src
  })
}

export async function dataUrlToImageData(dataUrl: string): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  const image = await loadImage(dataUrl)
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  if (!isValidDimension(width) || !isValidDimension(height)) {
    throw new Error('이미지 크기가 올바르지 않습니다.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas context unavailable')
  context.drawImage(image, 0, 0)
  return {
    data: context.getImageData(0, 0, canvas.width, canvas.height).data,
    width: canvas.width,
    height: canvas.height,
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('이미지를 준비하지 못했습니다.'))
    }, 'image/png')
  })
}

export async function prepareCharacterImage(file: File): Promise<{ blob: Blob; dataUrl: string }> {
  validateImageFile(file)
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const sourceWidth = image.naturalWidth || image.width
    const sourceHeight = image.naturalHeight || image.height
    if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
      throw new ImageUploadError('decode', '이미지를 읽지 못했습니다.')
    }

    const scale = Math.min(1, CHARACTER_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight))
    const width = Math.max(1, Math.round(sourceWidth * scale))
    const height = Math.max(1, Math.round(sourceHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas context unavailable')

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, 0, 0, width, height)

    return {
      blob: await canvasToBlob(canvas),
      dataUrl: canvas.toDataURL('image/png'),
    }
  } catch (error) {
    if (error instanceof ImageUploadError) throw error
    throw new ImageUploadError('prepare', '이미지를 준비하지 못했습니다.')
  } finally {
    revokeObjectUrl(objectUrl)
  }
}

async function getBackgroundRemovalPipeline(): Promise<BackgroundRemovalPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { env, pipeline } = await import('@huggingface/transformers')
      env.allowRemoteModels = true
      env.allowLocalModels = false
      env.useBrowserCache = true

      const supportsWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator
      const createPipeline = (device: 'webgpu' | 'wasm') => pipeline('background-removal', CHARACTER_MODEL_ID, {
        device,
        // ORMBG's quantized ONNX weight keeps first-run downloads much smaller
        // while remaining suitable for foregrounds with more than one subject.
        dtype: CHARACTER_MODEL_DTYPE,
        progress_callback: (info) => {
          if ('progress' in info && typeof info.progress === 'number') {
            emitProgress(Math.round(info.progress))
          }
        },
      }) as unknown as BackgroundRemovalPipeline

      try {
        return await createPipeline(supportsWebGPU ? 'webgpu' : 'wasm')
      } catch (error) {
        if (!supportsWebGPU) throw error
        // A browser can expose WebGPU while the current adapter still rejects
        // this model. Keep the feature usable with the WASM fallback.
        return createPipeline('wasm')
      }
    })().catch((error) => {
      pipelinePromise = null
      throw error
    })
  }

  return pipelinePromise
}

export async function warmBackgroundRemovalModel(onProgress?: ProgressListener): Promise<void> {
  const unsubscribe = subscribeToProgress(onProgress)

  try {
    await getBackgroundRemovalPipeline()
  } finally {
    unsubscribe()
  }
}

export async function removeImageBackground(
  blob: Blob,
  onProgress?: (progress: number) => void,
): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  const unsubscribe = subscribeToProgress(onProgress)

  try {
    const segmenter = await getBackgroundRemovalPipeline()
    onProgress?.(100)
    const output = await segmenter(blob)
    const data = output.data instanceof Uint8ClampedArray
      ? output.data
      : new Uint8ClampedArray(output.data)

    if (!isValidDimension(output.width) || !isValidDimension(output.height) || output.channels !== 4 || data.length !== output.width * output.height * 4) {
      throw new Error('배경 제거 결과 형식이 올바르지 않습니다.')
    }

    return { data, width: output.width, height: output.height }
  } finally {
    unsubscribe()
  }
}

export function imageDataToDataUrl(data: Uint8ClampedArray, width: number, height: number): string {
  if (!isValidDimension(width) || !isValidDimension(height) || data.length !== width * height * 4) {
    throw new Error('픽셀 데이터 형식이 올바르지 않습니다.')
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas context unavailable')
  const imageData = new ImageData(width, height)
  imageData.data.set(data)
  context.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

function isValidDimension(value: number) {
  return Number.isSafeInteger(value) && value > 0 && value <= CHARACTER_MAX_DIMENSION
}
