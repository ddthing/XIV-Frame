import React from 'react'
import { Text } from 'react-konva'
import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { DEFAULT_SIGNATURE_FONT } from '@/constants/signature'

import { useTranslations } from 'next-intl'

const COPYRIGHT_MIN_FONT_SIZE = 24
const COPYRIGHT_MAX_FONT_SIZE = 96
const COPYRIGHT_BASE_RATIO = 0.018
const COPYRIGHT_REFERENCE_ASPECT = 16 / 9

export function getCopyrightMetrics(contentWidth: number, contentHeight: number) {
  const shortSide = Math.min(contentWidth, contentHeight)
  const aspectRatio = contentWidth / contentHeight
  const aspectMultiplier = Math.min(1.45, Math.max(0.85, Math.sqrt(aspectRatio / COPYRIGHT_REFERENCE_ASPECT)))
  const fontSize = Math.min(
    COPYRIGHT_MAX_FONT_SIZE,
    Math.max(COPYRIGHT_MIN_FONT_SIZE, shortSide * COPYRIGHT_BASE_RATIO * aspectMultiplier),
  )
  const padding = Math.min(96, Math.max(24, fontSize * 1.35))
  const textHeight = fontSize * 1.25

  return { fontSize, padding, textHeight }
}

function CopyrightLayerComponent({ contentWidth, contentHeight }: { contentWidth: number, contentHeight: number }) {
  const { showCopyright, copyrightColor, copyrightPosition } = useStore(useShallow(state => ({
    showCopyright: state.showCopyright,
    copyrightColor: state.copyrightColor,
    copyrightPosition: state.copyrightPosition
  })))
  const t = useTranslations('CopyrightLayer')

  if (!showCopyright) return null

  const { fontSize, padding, textHeight } = getCopyrightMetrics(contentWidth, contentHeight)

  return (
    <Text
      text={t('text')}
      fontFamily={DEFAULT_SIGNATURE_FONT}
      fontSize={fontSize}
      fill={copyrightColor === 'black' ? '#000000' : copyrightColor === 'white' ? '#FFFFFF' : '#888888'}
      align={copyrightPosition === 'bottom-left' ? 'left' : copyrightPosition === 'bottom-right' ? 'right' : 'center'}
      verticalAlign="bottom"
      wrap="word"
      height={textHeight}
      width={Math.max(0, contentWidth - padding * 2)}
      x={padding}
      y={contentHeight - padding - textHeight}
    />
  )
}

export const CopyrightLayer = React.memo(CopyrightLayerComponent)
