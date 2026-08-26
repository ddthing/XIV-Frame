import { ImageUploadError, revokeObjectUrl, validateImageFile } from './imageUpload'
import { CancellationError, createCancellationHub, type CancellationGate } from './cancellationGate'
import { createIdleResourceCache } from './idleResourceCache'
import { createSerialTaskQueue } from './serialTaskQueue'
import { getWasmAssetPaths, getWasmThreadCount, isLikelyMobileBrowser } from './browserCapabilities'
import { BackgroundRemovalError, shouldFallbackFromBackgroundRemovalError, toBackgroundRemovalError } from './backgroundRemovalErrors'

export const CHARACTER_MODEL_ID = 'onnx-community/ormbg-ONNX'
export const CHARACTER_MODEL_DTYPE = 'q8'
export const CHARACTER_MAX_DIMENSION = 1536
const MOBILE_CHARACTER_MAX_DIMENSION = 1024
const WORKER_IDLE_DISPOSE_MS = 30_000

type WorkerOperation = 'warmup' | 'remove'

type BackgroundRemovalResult = {
  data: Uint8Array | Uint8ClampedArray
  width: number
  height: number
  channels: number
}

type BackgroundRemovalPipeline = ((input: Blob) => Promise<BackgroundRemovalResult>) & {
  dispose?: () => void | Promise<void>
}
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

const progressListeners = new Set<ProgressListener>()
const cancellationHub = createCancellationHub()
const fallbackInferenceQueue = createSerialTaskQueue()
const fallbackPipelineCache = createIdleResourceCache<BackgroundRemovalPipeline>(createBackgroundRemovalPipeline, {
  idleMs: 30_000,
})
let backgroundRemovalWorker: Worker | null = null
let workerUnavailable = false
let workerRequestId = 0
let workerIdleTimer: ReturnType<typeof setTimeout> | null = null
const pendingWorkerRequests = new Map<number, PendingWorkerRequest>()

function getCharacterMaxDimension() {
  return isLikelyMobileBrowser() ? MOBILE_CHARACTER_MAX_DIMENSION : CHARACTER_MAX_DIMENSION
}

function getWorkerTimeoutMs(operation: WorkerOperation) {
  if (isLikelyMobileBrowser()) {
    return operation === 'warmup' ? 180_000 : 120_000
  }
  return operation === 'warmup' ? 90_000 : 60_000
}

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

function isCancellationError(error: unknown): error is CancellationError {
  return error instanceof CancellationError
}

function clearWorkerIdleTimer() {
  if (workerIdleTimer === null) return
  clearTimeout(workerIdleTimer)
  workerIdleTimer = null
}

function terminateBackgroundRemovalWorker() {
  clearWorkerIdleTimer()
  backgroundRemovalWorker?.terminate()
  backgroundRemovalWorker = null
}

function scheduleWorkerIdleDispose() {
  if (workerIdleTimer !== null || pendingWorkerRequests.size > 0 || !backgroundRemovalWorker) return

  workerIdleTimer = setTimeout(() => {
    workerIdleTimer = null
    if (pendingWorkerRequests.size === 0) terminateBackgroundRemovalWorker()
  }, WORKER_IDLE_DISPOSE_MS)
}

function disableBackgroundRemovalWorker(error: unknown) {
  workerUnavailable = true
  const workerError = toError(error)
  pendingWorkerRequests.forEach(({ reject }) => reject(workerError))
  pendingWorkerRequests.clear()
  terminateBackgroundRemovalWorker()
}

export function cancelBackgroundRemoval() {
  cancellationHub.cancel()
  fallbackPipelineCache.scheduleDispose()
  const cancellation = new CancellationError()
  pendingWorkerRequests.forEach(({ reject }) => reject(cancellation))
  pendingWorkerRequests.clear()
  terminateBackgroundRemovalWorker()
  workerUnavailable = false
}

function raceWithCancellation<T>(promise: Promise<T>, gate: CancellationGate): Promise<T> {
  if (gate.isCancelled()) {
    void promise.catch(() => undefined)
    return Promise.reject(new CancellationError())
  }
  return Promise.race([promise, gate.promise])
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
  scheduleWorkerIdleDispose()

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
  if (backgroundRemovalWorker) {
    clearWorkerIdleTimer()
    return backgroundRemovalWorker
  }

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

function withWorkerTimeout<T>(promise: Promise<T>, operation: WorkerOperation): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new BackgroundRemovalError('timeout', '배경 제거 Worker 응답 시간이 초과되었습니다.')), getWorkerTimeoutMs(operation))
  })

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })
}

async function warmWithWorker(onProgress?: ProgressListener) {
  if (!getBackgroundRemovalWorker()) return false

  try {
    await withWorkerTimeout(postWorkerRequest({ type: 'warmup' }, onProgress), 'warmup')
    return true
  } catch (error) {
    if (isCancellationError(error)) throw error
    const typedError = toBackgroundRemovalError(error)
    disableBackgroundRemovalWorker(typedError)
    if (!shouldFallbackFromBackgroundRemovalError(typedError)) throw typedError
    return false
  }
}

async function removeWithWorker(blob: Blob, onProgress?: ProgressListener): Promise<BackgroundRemovalResult | null> {
  if (!getBackgroundRemovalWorker()) return null

  try {
    return await withWorkerTimeout(postWorkerRequest({ type: 'remove', blob }, onProgress), 'remove') as BackgroundRemovalResult
  } catch (error) {
    if (isCancellationError(error)) throw error
    const typedError = toBackgroundRemovalError(error)
    disableBackgroundRemovalWorker(typedError)
    if (!shouldFallbackFromBackgroundRemovalError(typedError)) throw typedError
    return null
  }
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new CancellationError()
}

function loadImage(src: string, signal?: AbortSignal): Promise<HTMLImageElement> {
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
      reject(new CancellationError())
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
      reject(new Error('이미지를 읽지 못했습니다.'))
    }
    image.src = src
  })
}

export async function dataUrlToImageData(dataUrl: string): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  try {
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
  } catch (error) {
    if (isCancellationError(error)) throw error
    throw toBackgroundRemovalError(error, 'image-processing')
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, signal?: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false
    const cleanup = () => signal?.removeEventListener('abort', handleAbort)
    const rejectCancelled = () => {
      if (settled) return
      settled = true
      cleanup()
      reject(new CancellationError())
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
        else reject(new Error('이미지를 준비하지 못했습니다.'))
      }, 'image/png')
    } catch (error) {
      if (settled) return
      settled = true
      cleanup()
      reject(error)
    }
  })
}

export async function prepareCharacterImage(file: File, signal?: AbortSignal): Promise<{ blob: Blob; dataUrl: string }> {
  validateImageFile(file)
  throwIfAborted(signal)
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl, signal)
    throwIfAborted(signal)
    const sourceWidth = image.naturalWidth || image.width
    const sourceHeight = image.naturalHeight || image.height
    if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
      throw new ImageUploadError('decode', '이미지를 읽지 못했습니다.')
    }

    const scale = Math.min(1, getCharacterMaxDimension() / Math.max(sourceWidth, sourceHeight))
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

    const blob = await canvasToBlob(canvas, signal)
    throwIfAborted(signal)
    const dataUrl = URL.createObjectURL(blob)
    if (signal?.aborted) {
      revokeObjectUrl(dataUrl)
      throwIfAborted(signal)
    }
    return {
      blob,
      // Keep the upload as a Blob URL. Converting the same pixels to a
      // Base64 data URL blocks the main thread and adds roughly 33% memory.
      dataUrl,
    }
  } catch (error) {
    if (error instanceof ImageUploadError || error instanceof CancellationError) throw error
    throw new ImageUploadError('prepare', '이미지를 준비하지 못했습니다.')
  } finally {
    revokeObjectUrl(objectUrl)
  }
}

async function createBackgroundRemovalPipeline(): Promise<BackgroundRemovalPipeline> {
  try {
    const { env, pipeline } = await import('@huggingface/transformers')
    env.allowRemoteModels = true
    env.allowLocalModels = false
    env.useBrowserCache = true
    if (env.backends.onnx.wasm) {
      const wasmThreadCount = getWasmThreadCount()
      env.backends.onnx.wasm.numThreads = wasmThreadCount
      env.backends.onnx.wasm.wasmPaths = getWasmAssetPaths()
    }

    const supportsWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator && !isLikelyMobileBrowser()
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
  } catch (error) {
    throw toBackgroundRemovalError(error, 'model-unavailable')
  }
}

export async function warmBackgroundRemovalModel(onProgress?: ProgressListener): Promise<void> {
  // A previous explicit run may have disabled the Worker after a transient
  // network/runtime failure. Re-evaluate Worker availability for each new
  // user-triggered attempt instead of poisoning the whole tab session.
  workerUnavailable = false
  const gate = cancellationHub.begin()

  try {
    if (await raceWithCancellation(warmWithWorker(onProgress), gate)) return

    const unsubscribe = subscribeToProgress(onProgress)
    try {
      await raceWithCancellation(fallbackPipelineCache.use(() => undefined), gate)
    } finally {
      unsubscribe()
    }
  } catch (error) {
    if (isCancellationError(error)) throw error
    throw toBackgroundRemovalError(error, 'model-unavailable')
  } finally {
    gate.dispose()
  }
}

export async function removeImageBackground(
  blob: Blob,
  onProgress?: (progress: number) => void,
): Promise<{ data: Uint8ClampedArray; width: number; height: number }> {
  // Failure isolation is scoped to one attempt. A later explicit retry must
  // be able to create a fresh Worker after connectivity or browser state has
  // recovered, while the current attempt still avoids duplicate fallback.
  workerUnavailable = false
  const gate = cancellationHub.begin()

  try {
    const workerOutput = await raceWithCancellation(removeWithWorker(blob, onProgress), gate)
    if (workerOutput) {
      return normalizeBackgroundRemovalResult(workerOutput)
    }

    const unsubscribe = subscribeToProgress(onProgress)
    try {
      onProgress?.(100)
      const output = await raceWithCancellation(
        fallbackInferenceQueue.run(
          () => fallbackPipelineCache.use((segmenter) => segmenter(blob)),
          () => !gate.isCancelled(),
        ),
        gate,
      )
      return normalizeBackgroundRemovalResult(output)
    } finally {
      unsubscribe()
    }
  } catch (error) {
    if (isCancellationError(error)) throw error
    throw toBackgroundRemovalError(error)
  } finally {
    gate.dispose()
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

export async function imageDataToBlobUrl(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  signal?: AbortSignal,
): Promise<string> {
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
  const blob = await canvasToBlob(canvas, signal)
  throwIfAborted(signal)
  return URL.createObjectURL(blob)
}

function isValidDimension(value: number) {
  return Number.isSafeInteger(value) && value > 0 && value <= CHARACTER_MAX_DIMENSION
}
