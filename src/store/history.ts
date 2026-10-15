import type { CharacterSlice } from './slices/characterSlice'
import type { ImageSlice } from './slices/imageSlice'
import type { LayoutSlice } from './slices/layoutSlice'
import type { SignatureSlice } from './slices/signatureSlice'

// An explicit allowlist keeps view state, loading flags, and actions out of
// history. Snapshots only contain values that change the exported composition.
const EDITOR_KEYS = [
  'images', 'imagePositions', 'imageScales',
  'layoutPreset', 'canvasRatio', 'backgroundColor', 'imageGap', 'imageTransition',
  'blendWidth', 'borderWidth', 'showCopyright', 'copyrightColor', 'copyrightPosition', 'grainIntensity',
  'characterName', 'serverName', 'signaturePosition', 'signatureAlign', 'fontFamily',
  'signatureSize', 'signatureColor', 'signatureOpacity', 'upperLetterSpacing', 'upperBold',
  'upperItalic', 'lowerLetterSpacing', 'lowerBold', 'lowerItalic',
  'logoUrl', 'logoPosition', 'logoScale', 'logoOpacity',
  'characterSourceUrl', 'characterCutoutUrl', 'characterPosition', 'characterScale',
  'characterOpacity', 'characterFlipX', 'characterShadow',
] as const satisfies readonly (keyof (ImageSlice & LayoutSlice & SignatureSlice & CharacterSlice))[]

export type EditorSnapshot = Pick<ImageSlice & LayoutSlice & SignatureSlice & CharacterSlice, typeof EDITOR_KEYS[number]>
type EditorKey = keyof EditorSnapshot

const CONTINUOUS_KEYS = new Set<EditorKey>([
  'imagePositions', 'imageScales', 'imageGap', 'blendWidth', 'borderWidth', 'grainIntensity',
  'characterName', 'serverName', 'signatureSize', 'signatureColor', 'signatureOpacity',
  'upperLetterSpacing', 'lowerLetterSpacing', 'logoScale', 'logoOpacity',
  'characterPosition', 'characterScale', 'characterOpacity',
])

export function captureEditorSnapshot(state: EditorSnapshot): EditorSnapshot {
  const snapshot = Object.fromEntries(EDITOR_KEYS.map(key => [key, state[key]])) as EditorSnapshot
  return {
    ...snapshot,
    images: [...state.images],
    imagePositions: state.imagePositions.map(position => ({ ...position })),
    imageScales: [...state.imageScales],
    characterPosition: state.characterPosition ? { ...state.characterPosition } : null,
  }
}

function equalValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => equalValue(value, b[index]))
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && 'x' in a && 'y' in a && 'x' in b && 'y' in b) {
    return a.x === b.x && a.y === b.y
  }
  return false
}

function groupKey(keys: EditorKey[], before: EditorSnapshot, after: EditorSnapshot) {
  if (!keys.every(key => CONTINUOUS_KEYS.has(key))) return null
  return keys.map(key => {
    if (key !== 'imagePositions' && key !== 'imageScales') return key
    const changedIndices = after[key].flatMap((value, index) => equalValue(value, before[key][index]) ? [] : [index])
    return `${key}:${changedIndices.join(',')}`
  }).join('|')
}

function blobUrls(snapshot: EditorSnapshot) {
  return [...snapshot.images, snapshot.logoUrl, snapshot.characterSourceUrl, snapshot.characterCutoutUrl]
    .filter((url): url is string => typeof url === 'string' && url.startsWith('blob:'))
}

/** Session-only edit history. Blob URLs live as long as any reachable snapshot. */
export function createEditorHistory({
  limit = 50,
  coalesceMs = 600,
  now = Date.now,
  revokeUrl = (url: string) => URL.revokeObjectURL(url),
}: {
  limit?: number
  coalesceMs?: number
  now?: () => number
  revokeUrl?: (url: string) => void
} = {}) {
  const past: EditorSnapshot[] = []
  const future: EditorSnapshot[] = []
  const retainedUrls = new Set<string>()
  let previousGroup: string | null = null
  let previousTime = 0

  const finishGroup = () => { previousGroup = null }
  const status = () => ({ canUndo: past.length > 0, canRedo: future.length > 0 })
  const remember = (snapshot: EditorSnapshot) => blobUrls(snapshot).forEach(url => retainedUrls.add(url))

  const releaseUnused = (current: EditorSnapshot) => {
    const reachable = new Set([current, ...past, ...future].flatMap(blobUrls))
    retainedUrls.forEach(url => {
      if (reachable.has(url)) return
      revokeUrl(url)
      retainedUrls.delete(url)
    })
  }

  return {
    status,
    finishGroup,
    record(before: EditorSnapshot, after: EditorSnapshot) {
      const changedKeys = EDITOR_KEYS.filter(key => !equalValue(before[key], after[key]))
      if (changedKeys.length === 0) return false
      remember(before)
      remember(after)
      const group = groupKey(changedKeys, before, after)
      const time = now()
      if (!group || group !== previousGroup || time - previousTime > coalesceMs || future.length > 0) {
        past.push(before)
        if (past.length > limit) past.shift()
      }
      future.length = 0
      previousGroup = group
      previousTime = time
      releaseUnused(after)
      return true
    },
    undo(current: EditorSnapshot) {
      const previous = past.pop()
      if (!previous) return null
      future.push(current)
      remember(current)
      finishGroup()
      releaseUnused(previous)
      return previous
    },
    redo(current: EditorSnapshot) {
      const next = future.pop()
      if (!next) return null
      past.push(current)
      remember(current)
      finishGroup()
      releaseUnused(next)
      return next
    },
    clear(current: EditorSnapshot) {
      past.length = 0
      future.length = 0
      remember(current)
      finishGroup()
      releaseUnused(current)
    },
  }
}
