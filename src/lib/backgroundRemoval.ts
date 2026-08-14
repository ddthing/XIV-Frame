export const CHARACTER_MODEL_ID = 'onnx-community/BEN2-ONNX'
export const CHARACTER_MAX_DIMENSION = 1536

type BackgroundRemovalResult = {
  data: Uint8Array | Uint8ClampedArray
  width: number
  height: number
  channels: number
}

type BackgroundRemovalPipeline = (input: Blob) => Promise<BackgroundRemovalResult>

let pipelinePromise: Promise<BackgroundRemovalPipeline> | null = null

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
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height
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
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const sourceWidth = image.naturalWidth || image.width
    const sourceHeight = image.naturalHeight || image.height
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
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

async function getBackgroundRemovalPipeline(onProgress?: (progress: number) => void): Promise<BackgroundRemovalPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { env, pipeline } = await import('@huggingface/transformers')
      env.allowRemoteModels = true
      env.allowLocalModels = false
      env.useBrowserCache = true

      const supportsWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator
      const createPipeline = (device: 'webgpu' | 'wasm') => pipeline('background-removal', CHARACTER_MODEL_ID, {
        device,
        // BEN2 currently publishes an fp16 ONNX weight for this browser-ready mirror.
        dtype: 'fp16',
        progress_callback: (info) => {
          if ('progress' in info && typeof info.progress === 'number') {
            onProgress?.(Math.round(info.progress))
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

export async function removeImageBackground(
  blob: Blob,
  onProgress?: (progress: number) => void,
): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  const segmenter = await getBackgroundRemovalPipeline(onProgress)
  const output = await segmenter(blob)
  const data = output.data instanceof Uint8ClampedArray
    ? output.data
    : new Uint8ClampedArray(output.data)

  if (output.channels !== 4 || data.length !== output.width * output.height * 4) {
    throw new Error('배경 제거 결과 형식이 올바르지 않습니다.')
  }

  return { data, width: output.width, height: output.height }
}

export function imageDataToDataUrl(data: Uint8ClampedArray, width: number, height: number): string {
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
