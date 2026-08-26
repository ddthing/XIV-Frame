// Turbopack serves Worker entries as static module files instead of bundling
// their imports. Keep the Worker entry valid in a static export and pin the
// same Transformers.js version used by the main-thread fallback. The browser
// bundle is copied to /public during dev/build so the Worker stays same-origin.
let transformersPromise = null

function getTransformers() {
  if (!transformersPromise) {
    transformersPromise = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ '/vendor/transformers.web.min.js')
  }
  return transformersPromise
}

const CHARACTER_MODEL_ID = 'onnx-community/ormbg-ONNX'
const CHARACTER_MODEL_DTYPE = 'q8'

function isLikelyMobileBrowser() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function getWasmThreadCount() {
  if (globalThis.crossOriginIsolated !== true) return 1

  const hardwareConcurrency = Number.isFinite(navigator.hardwareConcurrency)
    ? Math.max(1, Math.floor(navigator.hardwareConcurrency))
    : 1
  const maxThreads = isLikelyMobileBrowser() ? 2 : 4
  return Math.min(maxThreads, Math.max(1, Math.ceil(hardwareConcurrency / 2)))
}

function getWasmAssetPaths(threadCount) {
  const runtimeName = threadCount > 1
    ? 'ort-wasm-simd-threaded'
    : 'ort-wasm-simd-threaded.asyncify'
  const assetRoot = '/vendor/onnxruntime/'
  return {
    mjs: `${assetRoot}${runtimeName}.mjs`,
    wasm: `${assetRoot}${runtimeName}.wasm`,
  }
}

const workerScope = self
let pipelinePromise = null

function postProgress(progress) {
  workerScope.postMessage({ type: 'progress', progress })
}

async function getBackgroundRemovalPipeline() {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { env, pipeline } = await getTransformers()
      env.allowRemoteModels = true
      env.allowLocalModels = false
      env.useBrowserCache = true
      const wasmThreadCount = getWasmThreadCount()
      env.backends.onnx.wasm.numThreads = wasmThreadCount
      env.backends.onnx.wasm.wasmPaths = getWasmAssetPaths(wasmThreadCount)

      const supportsWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator && !isLikelyMobileBrowser()
      const createPipeline = (device) => pipeline('background-removal', CHARACTER_MODEL_ID, {
        device,
        dtype: CHARACTER_MODEL_DTYPE,
        progress_callback: (info) => {
          if ('progress' in info && typeof info.progress === 'number') {
            postProgress(Math.round(info.progress))
          }
        },
      })

      try {
        return await createPipeline(supportsWebGPU ? 'webgpu' : 'wasm')
      } catch (error) {
        if (!supportsWebGPU) throw error
        return createPipeline('wasm')
      }
    })().catch((error) => {
      pipelinePromise = null
      throw error
    })
  }

  return pipelinePromise
}

function toTransferableBytes(data) {
  if (data instanceof Uint8Array && data.byteOffset === 0 && data.byteLength === data.buffer.byteLength) {
    return data
  }
  return new Uint8Array(data)
}

async function handleRequest(request) {
  try {
    const segmenter = await getBackgroundRemovalPipeline()
    postProgress(100)

    if (request.type === 'warmup') {
      workerScope.postMessage({ type: 'ready', requestId: request.requestId })
      return
    }

    const output = await segmenter(request.blob)
    const data = toTransferableBytes(output.data)

    workerScope.postMessage({
      type: 'result',
      requestId: request.requestId,
      data: data.buffer,
      width: output.width,
      height: output.height,
      channels: output.channels,
    }, [data.buffer])
  } catch (error) {
    workerScope.postMessage({
      type: 'error',
      requestId: request.requestId,
      message: error instanceof Error ? error.message : '배경 제거에 실패했습니다.',
    })
  }
}

workerScope.onmessage = (event) => {
  void handleRequest(event.data)
}
