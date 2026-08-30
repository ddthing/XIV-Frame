import fs from 'node:fs'
import path from 'node:path'

const sourcePath = path.join(process.cwd(), 'src', 'components', 'canvas', 'layers', 'ImageGridLayer.tsx')
const source = fs.readFileSync(sourcePath, 'utf8')
const stageSource = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'canvas', 'KonvaStage.tsx'), 'utf8')
const logoSource = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'canvas', 'layers', 'LogoLayer.tsx'), 'utf8')
const logoUploadSource = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'sidebar', 'signature', 'LogoUploadArea.tsx'), 'utf8')
const previewSource = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'canvas', 'PreviewCanvas.tsx'), 'utf8')
const imageUploaderSource = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'sidebar', 'ImageUploader.tsx'), 'utf8')
const characterSource = fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'sidebar', 'signature', 'CharacterSettings.tsx'), 'utf8')
const backgroundRemovalSource = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'backgroundRemoval.ts'), 'utf8')
const backgroundRemovalWorkerSource = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'backgroundRemoval.worker.js'), 'utf8')
const exportSource = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'export.ts'), 'utf8')
const storeSource = fs.readFileSync(path.join(process.cwd(), 'src', 'store', 'useStore.ts'), 'utf8')
const imageSliceSource = fs.readFileSync(path.join(process.cwd(), 'src', 'store', 'slices', 'imageSlice.ts'), 'utf8')
const errors = []

function fail(message) {
  errors.push(`[render:check] ${message}`)
}

if (!/<Layer>\{images\.map\(renderImageGroup\)\}<\/Layer>/.test(source)) {
  fail('ImageGridLayer should share one Konva Layer across non-blended images.')
}

if (!source.includes('<SoftBlendCompositeVisual')
  || !source.includes('<SoftBlendActiveVisual')
  || !source.includes('{images.map(renderSoftBlendInteraction)}')) {
  fail('Soft-blended images must use one cached composite layer, one active overlay layer, and one interaction layer.')
}

if (!source.includes('drawSoftBlendMask')
  || !source.includes("context.globalCompositeOperation = 'destination-in'")
  || !source.includes('canvasRef.current ?? document.createElement')
  || !source.includes('scratchCanvasRef')
  || !source.includes('scratchContext.clearRect')
  || !source.includes('offscreenContext.drawImage(')
  || !source.includes('rasterScale')) {
  fail('Soft-blend output must isolate each masked image in bounded reusable surfaces before compositing.')
}

if (!/settleWithConcurrency\([\s\S]*filesToPrepare[\s\S]*prepareImageForCanvas[\s\S]*preparationConcurrency/.test(previewSource)
  || !previewSource.includes('getImagePreparationConcurrency')) {
  fail('Multi-file upload must use the device-aware bounded concurrency pool.')
}

if (!previewSource.includes('new AbortController()')
  || !/prepareImageForCanvas\(file, controller\.signal, \{ maxDimension \}\)/.test(previewSource)
  || !previewSource.includes('getImagePreparationMaxDimension')
  || !previewSource.includes('uploadAbortRef.current?.abort()')) {
  fail('PreviewCanvas must cancel active image preparation when reset or unmount interrupts an upload.')
}

if (!imageUploaderSource.includes('controller: AbortController')
  || !/prepareImageForCanvas\(file, signal, \{ maxDimension \}\)/.test(imageUploaderSource)
  || !imageUploaderSource.includes('getImagePreparationMaxDimension')
  || !imageUploaderSource.includes('pending.controller.abort()')) {
  fail('ImageUploader must cancel stale slot preparation when a file is replaced, moved, removed, or reset.')
}

if (!stageSource.includes('getCanvasLogicalSize')) {
  fail('KonvaStage must use the shared canvas geometry seam.')
}

if (!stageSource.includes('Promise.allSettled')
  || !stageSource.includes('sourceIndex')
  || !stageSource.includes('pending.cancel()')
  || !stageSource.includes("canvas-image-error")
  || !stageSource.includes('const syncLoadedImages = () =>')
  || !stageSource.includes('const scheduleLoadedImageSync = () =>')
  || !stageSource.includes('void promise.then(scheduleLoadedImageSync, scheduleLoadedImageSync)')) {
  fail('KonvaStage must progressively paint decoded images while preserving source slots and failure cleanup.')
}

if (!imageSliceSource.includes('setPreparedImages:')
  || !previewSource.includes('setPreparedImages(')
  || !imageUploaderSource.includes('setPreparedImages(')) {
  fail('Prepared uploads must commit image URLs, positions, scales, and selection through one store action.')
}

if (!previewSource.includes("canvas-image-error")) {
  fail('PreviewCanvas must surface a canvas image decode failure to the user.')
}

if (!source.includes('getImageCellGeometry')) {
  fail('ImageGridLayer must use the shared image cell geometry seam.')
}

if (!/if \(!logoUrl\) return null/.test(logoSource) || !/img\.src = ''/.test(logoSource)) {
  fail('LogoLayer must release its decoded image reference when the logo is removed.')
}

if (!logoUploadSource.includes('resetVersionAtStart')
  || !logoUploadSource.includes('cancelPendingUpload')
  || !/resetVersion !== resetVersionAtStart/.test(logoUploadSource)) {
  fail('LogoUploadArea must discard stale uploads after reset and release pending file/image work.')
}

if (!/useStore\.getState\(\)\.resetVersion !== uploadVersion/.test(previewSource)) {
  fail('PreviewCanvas must discard upload results created before a reset.')
}

if (!/useStore\.getState\(\)\.resetVersion !== uploadVersion/.test(imageUploaderSource)) {
  fail('ImageUploader must discard slot upload results created before a reset.')
}

if (!/\.catch\(\(error: unknown\) => \{[\s\S]*useStore\.getState\(\)\.resetVersion !== uploadVersion/.test(imageUploaderSource)) {
  fail('ImageUploader must discard upload errors created before a reset.')
}

if (!source.includes('onImageSlotSelect?.(sourceIndex)')
  || !stageSource.includes('onImageSlotSelect={onSlotSelect}')) {
  fail('ImageGridLayer must delegate slot replacement to PreviewCanvas instead of owning a second upload pipeline.')
}

if (!exportSource.includes('createSerialTaskQueue')
  || !exportSource.includes('const exportQueue = createSerialTaskQueue()')
  || !exportSource.includes('getExportMaxDimension()')
  || !exportSource.includes('exportQueue.run(() => runExportCanvas(stageRef, type))')
  || !exportSource.includes('const exportVersion = store.resetVersion')
  || !exportSource.includes('const isStale = () => useStore.getState().resetVersion !== exportVersion')
  || !/await waitForCanvasPaint\(\)[\s\S]*if \(isStale\(\)\) return undefined/.test(exportSource)
  || !/if \(isStale\(\)\) return undefined[\s\S]*return blob/.test(exportSource)
  || !/if \(encoded === undefined\) return undefined[\s\S]*const objectUrl/.test(exportSource)) {
  fail('Export must discard results created after a reset before downloading.')
}

if (!exportSource.includes('X_MAX_UPLOAD_BYTES = 5_000_000')
  || !exportSource.includes('ExportFileTooLargeError')
  || !exportSource.includes('INITIAL_JPEG_QUALITY = 0.92')
  || !exportSource.includes('JPEG_QUALITY_SEARCH_STEPS')
  || !exportSource.includes("optimizedFrom: 'png'")
  || !exportSource.includes("isOpaqueBackground: store.backgroundColor !== 'transparent'")) {
  fail('Export must enforce the 5 MB cap, preserve transparency, and search for the best fitting JPEG quality.')
}

if (!source.includes('const renderImageGroup') || !source.includes('<Layer>{images.map(renderImageGroup)}</Layer>')) {
  fail('ImageGridLayer should use one Konva layer for non-blended image layouts.')
}

if (!source.includes('const wheelScales = React.useRef(new Map<number, number>())')
  || !source.includes('window.requestAnimationFrame')
  || !source.includes('e.target.getLayer()?.batchDraw()')) {
  fail('Image zoom interactions must update Konva immediately and commit persisted state at frame cadence.')
}

if (!/useStore\.getState\(\)\.resetVersion !== resetVersionAtStart/.test(characterSource)) {
  fail('CharacterSettings must discard background-removal results created before a reset.')
}

if (!/const resetVersionAtStart = useStore\.getState\(\)\.resetVersion[\s\S]*const prepared = await prepareCharacterImage\(file, controller\.signal\)[\s\S]*useStore\.getState\(\)\.resetVersion !== resetVersionAtStart/.test(characterSource)) {
  fail('CharacterSettings must discard character uploads created before a reset.')
}

if (!characterSource.includes('filePreparationAbortRef.current?.abort()')
  || !/const handleFileChange[\s\S]*filePreparationAbortRef\.current\?\.abort\(\)[\s\S]*cancelBackgroundRemoval\(\)/.test(characterSource)
  || !backgroundRemovalSource.includes('function throwIfAborted(signal?: AbortSignal)')
  || !backgroundRemovalSource.includes('loadImage(objectUrl, signal)')) {
  fail('Character upload preparation must release image decode and conversion work when interrupted.')
}

if (!storeSource.includes('const currentUrl = get().characterSourceUrl')
  || !storeSource.includes('if (currentUrl !== url) revokeObjectUrl(currentUrl)')
  || !storeSource.includes('setCharacterSourceUrl: (url) =>')) {
  fail('Character source Blob URL ownership must live in the store rather than a tab-scoped component.')
}

if (!/mountedRef\.current = true/.test(characterSource) || !/cancelBackgroundRemoval\(\)/.test(characterSource)) {
  fail('CharacterSettings must restore its async lifecycle guard and cancel background removal on teardown/reset.')
}

if (!/export function cancelBackgroundRemoval/.test(backgroundRemovalSource) || !/isCancellationError\(error\)/.test(backgroundRemovalSource)) {
  fail('Background removal must terminate the Worker and preserve cancellation instead of falling back after reset.')
}

if (!/export async function removeImageBackground\([\s\S]*workerUnavailable = false/.test(backgroundRemovalSource)) {
  fail('An explicit background-removal retry must re-evaluate Worker availability after a transient failure.')
}

if (!backgroundRemovalSource.includes("from './browserCapabilities'")) {
  fail('Background removal and upload preparation must share the browser capability seam.')
}

if (!backgroundRemovalSource.includes('getWasmThreadCount()')
  || (!backgroundRemovalSource.includes('numThreads = getWasmThreadCount()')
    && !backgroundRemovalSource.includes('numThreads = wasmThreadCount'))
  || !backgroundRemovalWorkerSource.includes('function getWasmThreadCount()')
  || (!backgroundRemovalWorkerSource.includes('env.backends.onnx.wasm.numThreads = getWasmThreadCount()')
    && !backgroundRemovalWorkerSource.includes('env.backends.onnx.wasm.numThreads = wasmThreadCount'))
  || !backgroundRemovalWorkerSource.includes('function toTransferableBytes(data)')
  || !backgroundRemovalWorkerSource.includes('const data = toTransferableBytes(output.data)')) {
  fail('WASM processing must use an explicit bounded thread policy and transfer result buffers without an avoidable copy.')
}

if (!backgroundRemovalSource.includes('WORKER_IDLE_DISPOSE_MS')
  || !backgroundRemovalSource.includes('scheduleWorkerIdleDispose()')
  || !backgroundRemovalSource.includes('terminateBackgroundRemovalWorker()')) {
  fail('Background removal Worker must terminate after an idle period and share one cleanup path.')
}

if (!backgroundRemovalSource.includes('const gate = cancellationHub.begin()')
  || !backgroundRemovalSource.includes('fallbackPipelineCache.use(() => undefined)')
  || !backgroundRemovalSource.includes('fallbackPipelineCache.use((segmenter) => segmenter(blob))')
  || !backgroundRemovalSource.includes('fallbackInferenceQueue.run(')
  || !backgroundRemovalSource.includes('const output = await raceWithCancellation(')) {
  fail('Main-thread background removal must race pipeline work against the cancellation gate and serialize inference.')
}

if (!/createIdleResourceCache<BackgroundRemovalPipeline>\(createBackgroundRemovalPipeline, \{[\s\S]*idleMs: 30_000/.test(backgroundRemovalSource)
  || !backgroundRemovalSource.includes('fallbackPipelineCache.scheduleDispose()')) {
  fail('Main-thread fallback model cache must dispose after an idle cancellation window.')
}

const removalIndex = characterSource.indexOf('const result = await removeImageBackground(blob')
const sourceDecodeIndex = characterSource.indexOf('const source = await dataUrlToImageData(sourceUrl)')
if (removalIndex < 0 || sourceDecodeIndex < removalIndex) {
  fail('CharacterSettings should decode source pixels after background removal to lower peak memory.')
}

if (!characterSource.includes('imageDataToBlobUrl')
  || characterSource.includes('imageDataToDataUrl(')
  || !backgroundRemovalSource.includes('export async function imageDataToBlobUrl')
  || !storeSource.includes('setCharacterCutoutUrl: (url) =>')
  || !storeSource.includes('revokeObjectUrl(currentUrl)')
  || !storeSource.includes('delete state.characterCutoutUrl')) {
  fail('Character cutout previews must use revocable Blob URLs instead of repeated Base64 encoding.')
}

if (!/const cutoutUrlAtStart = characterCutoutUrl[\s\S]*dataUrlToImageData\(cutoutUrlAtStart\)[\s\S]*isStale\(\)/.test(characterSource)) {
  fail('CharacterSettings must discard stale editor-opening results.')
}

if (errors.length > 0) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
} else {
  console.log('[render:check] multi-image render tree passed.')
}
