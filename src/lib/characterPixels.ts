export type PixelState = {
  data: Uint8ClampedArray
  width: number
  height: number
}

export type EditablePixelState = {
  original: PixelState
  working: PixelState
}

/**
 * Keep the model result immutable while giving the editor an owned buffer.
 * The original data remains the caller's buffer; only the working copy is cloned.
 */
export function createEditablePixelState(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): EditablePixelState {
  return {
    original: { data, width, height },
    working: { data: data.slice(), width, height },
  }
}
