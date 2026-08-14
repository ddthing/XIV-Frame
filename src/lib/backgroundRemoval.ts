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
type WorkerRequest =
  | { type: 'warmup' }
  | { type: 'remove'; blob: Blob }
type WorkerResponse =
  | { type: 'progress'; progress: number }
  | { type: 'ready'; requestId: number }
  | { type: 'result'; requestId: number; data: ArrayBuffer; width: number; height: number; channels: number }
  | { type: 'error'; requestId: number; message: string }
type PendingWorkerRequest = {
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
  onProgress?: ProgressListener
}

let pipelinePromise: Promise<BackgroundRemovalPipeline> | null = null
const progressListeners = new Set<ProgressListener>()
let backgroundRemovalWorker: Worker | null = null
let workerUnavailable = false
let workerRequestId = 0
const pendingWorkerRequests = new Map<number, PendingWorkerRequest>()
const WORKER_REQUEST_TIMEOUT_MS = 20_000

function emitProgress(progress: number) {
  progressListeners.forEach((listener) => listener(progress))
}

function subscribeToProgress(listener?: ProgressListener) {
  if (!listener) return () => undefined
  progressListeners.add(listener)
  return () => progressListeners.delete(listener)
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error('배경 제거 Worker를 사용할 수 없습니다.')
}

function disableBackgroundRemovalWorker(error: unknown) {
  workerUnavailable = true
  const workerError = toError(error)
  pendingWorkerRequests.forEach(({ reject }) => reject(workerError))
  pendingWorkerRequests.clear()
  backgroundRemovalWorker?.terminate()
  backgroundRemovalWorker = null
}

function handleWorkerMessage(event: MessageEvent<WorkerResponse>) {
  const response = event.data
  if (response.type === 'progress') {
    pendingWorkerRequests.forEach(({ onProgress }) => onProgress?.(response.progress))
    return
  }

  const pending = pendingWorkerRequests.get(response.requestId)
  if (!pending) return
  pendingWorkerRequests.delete(response.requestId)

  if (response.type === 'error') {
    pending.reject(new Error(response.message))
    return
  }

  if (response.type === 'ready') {
    pending.resolve(undefined)
    return
  }

  pending.resolve({
    data: new Uint8ClampedArray(response.data),
    width: response.width,
    height: response.height,
    channels: response.channels,
  })
}

function getBackgroundRemovalWorker(): Worker | null {
  if (workerUnavailable || typeof Worker === 'undefined') return null
  if (backgroundRemovalWorker) return backgroundRemovalWorker

  try {
    const worker = new Worker(new URL('./backgroundRemoval.worker.js', import.meta.url), { type: 'module' })
    worker.addEventListener('message', handleWorkerMessage)
    worker.addEventListener('error', (event) => disableBackgroundRemovalWorker(event.error ?? new Error(event.message)))
    worker.addEventListener('messageerror', (event) => disableBackgroundRemovalWorker(event))
    backgroundRemovalWorker = worker
    return worker
  } catch (error) {
    disableBackgroundRemovalWorker(error)
    return null
  }
}

function postWorkerRequest(request: WorkerRequest, onProgress?: ProgressListener): Promise<unknown> {
  const worker = getBackgroundRemovalWorker()
  if (!worker) return Promise.reject(new Error('배경 제거 Worker를 사용할 수 없습니다.'))

  const requestId = ++workerRequestId
  return new Promise((resolve, reject) => {
    pendingWorkerRequests.set(requestId, { resolve, reject, onProgress })
    try {
      worker.postMessage({ ...request, requestId })
    } catch (error) {
      pendingWorkerRequests.delete(requestId)
      disableBackgroundRemovalWorker(error)
      reject(error)
    }
  })
}

function withWorkerTimeout<T>(promise: Promise<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('배경 제거 Worker 응답 시간이 초과되었습니다.')), WORKER_REQUEST_TIMEOUT_MS)
  })

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })
}

async function warmWithWorker(onProgress?: ProgressListener) {
  if (!getBackgroundRemovalWorker()) return false

  try {
    await withWorkerTimeout(postWorkerRequest({ type: 'warmup' }, onProgress))
    return true
  } catch {
    disableBackgroundRemovalWorker(new Error('배경 제거 Worker 초기화에 실패했습니다.'))
    return false
  }
}

async function removeWithWorker(blob: Blob, onProgress?: ProgressListener): Promise<BackgroundRemovalResult | null> {
  if (!getBackgroundRemovalWorker()) return null

  try {
    return await withWorkerTimeout(postWorkerRequest({ type: 'remove', blob }, onProgress)) as BackgroundRemovalResult
  } catch {
    disableBackgroundRemovalWorker(new Error('배경 제거 Worker 실행에 실패했습니다.'))
    return null
  }
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

    const blob = await canvasToBlob(canvas)
    return {
      blob,
      // Keep the upload as a Blob URL. Converting the same pixels to a
      // Base64 data URL blocks the main thread and adds roughly 33% memory.
      dataUrl: URL.createObjectURL(blob),
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
  if (await warmWithWorker(onProgress)) return

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
  const workerOutput = await removeWithWorker(blob, onProgress)
  if (workerOutput) {
    return normalizeBackgroundRemovalResult(workerOutput)
  }

  const unsubscribe = subscribeToProgress(onProgress)

  try {
    const segmenter = await getBackgroundRemovalPipeline()
    onProgress?.(100)
    const output = await segmenter(blob)
    return normalizeBackgroundRemovalResult(output)
  } finally {
    unsubscribe()
  }
}

function normalizeBackgroundRemovalResult(output: BackgroundRemovalResult) {
  const data = output.data instanceof Uint8ClampedArray
    ? output.data
    : new Uint8ClampedArray(output.data)

  if (!isValidDimension(output.width) || !isValidDimension(output.height) || output.channels !== 4 || data.length !== output.width * output.height * 4) {
    throw new Error('배경 제거 결과 형식이 올바르지 않습니다.')
  }

  return { data, width: output.width, height: output.height }
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
