export const CHARACTER_SCALE_MIN = 0.25
export const CHARACTER_SCALE_MAX = 5

export function getCharacterScaleBounds(baseWidth: number) {
  return {
    minWidth: baseWidth * CHARACTER_SCALE_MIN,
    maxWidth: baseWidth * CHARACTER_SCALE_MAX,
  }
}
