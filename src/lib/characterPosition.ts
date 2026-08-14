export type CharacterPosition = { x: number; y: number }
export type CharacterNudgeDetail = { dx: number; dy: number }

export const CHARACTER_NUDGE_EVENT = 'xiv-frame:character-nudge'

export function nudgeCharacterPosition(position: CharacterPosition, delta: CharacterNudgeDetail): CharacterPosition {
  return {
    x: position.x + delta.dx,
    y: position.y + delta.dy,
  }
}

export function dispatchCharacterNudge(delta: CharacterNudgeDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<CharacterNudgeDetail>(CHARACTER_NUDGE_EVENT, { detail: delta }))
}
