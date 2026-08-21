export type CharacterGuideVisibilityState = {
  isExporting: boolean
  isHovered: boolean
  isDragging: boolean
  isResizing: boolean
}

export function shouldShowCharacterGuide({
  isExporting,
  isHovered,
  isDragging,
  isResizing,
}: CharacterGuideVisibilityState) {
  return !isExporting && (isHovered || isDragging || isResizing)
}
