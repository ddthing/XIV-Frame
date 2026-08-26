export type BrowserInfo = {
  userAgent: string
  platform: string
  maxTouchPoints: number
  deviceMemory?: number
  hardwareConcurrency?: number
  crossOriginIsolated?: boolean
}

type NavigatorWithDeviceMemory = Navigator & {
  deviceMemory?: number
}

export function getBrowserInfo(): BrowserInfo | undefined {
  if (typeof navigator === 'undefined') return undefined

  const currentNavigator = navigator as NavigatorWithDeviceMemory
  return {
    userAgent: currentNavigator.userAgent,
    platform: currentNavigator.platform,
    maxTouchPoints: currentNavigator.maxTouchPoints,
    deviceMemory: currentNavigator.deviceMemory,
    hardwareConcurrency: currentNavigator.hardwareConcurrency,
    crossOriginIsolated: typeof globalThis.crossOriginIsolated === 'boolean'
      ? globalThis.crossOriginIsolated
      : false,
  }
}

export function isLikelyMobileBrowser(info: BrowserInfo | undefined = getBrowserInfo()) {
  if (!info) return false

  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(info.userAgent)
    || (info.platform === 'MacIntel' && info.maxTouchPoints > 1)
}

export function getImagePreparationConcurrency(info: BrowserInfo | undefined = getBrowserInfo()) {
  if (!info) return 2

  const isLowMemory = typeof info.deviceMemory === 'number'
    && Number.isFinite(info.deviceMemory)
    && info.deviceMemory <= 2

  return isLikelyMobileBrowser(info) || isLowMemory ? 1 : 2
}

export function getExportMaxDimension(info: BrowserInfo | undefined = getBrowserInfo()) {
  if (!info) return 4096

  const isLowMemory = typeof info.deviceMemory === 'number'
    && Number.isFinite(info.deviceMemory)
    && info.deviceMemory <= 2

  return isLikelyMobileBrowser(info) || isLowMemory ? 3072 : 4096
}

/**
 * Pick a bounded ONNX Runtime WebAssembly pool without asking browsers that
 * cannot share memory to create (and then discard) pthread workers.
 */
export function getWasmThreadCount(info: BrowserInfo | undefined = getBrowserInfo()) {
  if (!info?.crossOriginIsolated) return 1

  const hardwareConcurrency = typeof info.hardwareConcurrency === 'number'
    && Number.isFinite(info.hardwareConcurrency)
    ? Math.max(1, Math.floor(info.hardwareConcurrency))
    : 1
  const maxThreads = isLikelyMobileBrowser(info) ? 2 : 4
  return Math.min(maxThreads, Math.max(1, Math.ceil(hardwareConcurrency / 2)))
}

export function getWasmAssetPaths(info: BrowserInfo | undefined = getBrowserInfo()) {
  const runtimeName = getWasmThreadCount(info) > 1
    ? 'ort-wasm-simd-threaded'
    : 'ort-wasm-simd-threaded.asyncify'
  const assetRoot = '/vendor/onnxruntime/'

  return {
    mjs: `${assetRoot}${runtimeName}.mjs`,
    wasm: `${assetRoot}${runtimeName}.wasm`,
  }
}
