import {
  CHARACTER_SCALE_MAX,
  getCharacterScaleBounds,
} from '../src/lib/characterScale.ts'

const baseWidth = 500
const { maxWidth } = getCharacterScaleBounds(baseWidth)
const requiredMaxScale = 5

if (CHARACTER_SCALE_MAX < requiredMaxScale || maxWidth < baseWidth * requiredMaxScale) {
  throw new Error(`Character scale must support at least ${requiredMaxScale}x; received ${CHARACTER_SCALE_MAX}x.`)
}

console.log(`Character scale supports ${CHARACTER_SCALE_MAX}x (${maxWidth}px for a ${baseWidth}px base).`)
