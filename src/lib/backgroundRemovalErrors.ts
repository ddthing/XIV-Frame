export type BackgroundRemovalFailureCode =
  | 'model-unavailable'
  | 'browser-unsupported'
  | 'image-memory'
  | 'image-processing'
  | 'timeout'
  | 'unknown'

export class BackgroundRemovalError extends Error {
  constructor(
    public readonly code: BackgroundRemovalFailureCode,
    message: string,
  ) {
    super(message)
    this.name = 'BackgroundRemovalError'
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return ''
}

export function getBackgroundRemovalFailureCode(error: unknown): BackgroundRemovalFailureCode {
  if (error instanceof BackgroundRemovalError) return error.code

  const message = getErrorMessage(error).toLowerCase()

  if (
    message.includes('timeout')
    || message.includes('timed out')
    || message.includes('시간이 초과')
    || message.includes('응답 시간이 초과')
  ) {
    return 'timeout'
  }

  if (
    message.includes('failed to fetch')
    || message.includes('networkerror')
    || message.includes('load failed')
    || message.includes('network request')
    || message.includes('cors')
    || message.includes('huggingface')
    || message.includes('config.json')
    || message.includes('.onnx')
    || message.includes('remote model')
    || message.includes('model file')
    || message.includes('status code')
    || message.includes('http 4')
    || message.includes('http 5')
  ) {
    return 'model-unavailable'
  }

  if (
    message.includes('memory')
    || message.includes('array buffer')
    || message.includes('allocation')
    || message.includes('out of memory')
  ) {
    return 'image-memory'
  }

  if (
    message.includes('webgpu')
    || message.includes('webassembly')
    || message.includes('wasm')
    || message.includes('backend') && message.includes('not supported')
    || message.includes('not supported')
    || message.includes('unsupported')
    || message.includes('no available')
    || message.includes('failed to construct')
    || message.includes('worker') && message.includes('unavailable')
  ) {
    return 'browser-unsupported'
  }

  if (
    message.includes('이미지')
    || message.includes('image')
    || message.includes('canvas')
    || message.includes('pixel')
    || message.includes('dimension')
    || message.includes('decode')
  ) {
    return 'image-processing'
  }

  return 'unknown'
}

export function toBackgroundRemovalError(
  error: unknown,
  fallbackCode: BackgroundRemovalFailureCode = 'unknown',
) {
  if (error instanceof BackgroundRemovalError) return error

  const code = getBackgroundRemovalFailureCode(error)
  const message = getErrorMessage(error) || '배경 제거 중 알 수 없는 오류가 발생했습니다.'
  return new BackgroundRemovalError(code === 'unknown' ? fallbackCode : code, message)
}

export function shouldFallbackFromBackgroundRemovalError(error: unknown) {
  return getBackgroundRemovalFailureCode(error) !== 'model-unavailable'
}
