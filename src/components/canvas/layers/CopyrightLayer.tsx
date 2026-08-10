import React from 'react'
import { Text } from 'react-konva'
import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { DEFAULT_SIGNATURE_FONT } from '@/constants/signature'

import { useTranslations } from 'next-intl'

function CopyrightLayerComponent({ contentWidth, contentHeight }: { contentWidth: number, contentHeight: number }) {
  const { showCopyright, copyrightColor, copyrightPosition } = useStore(useShallow(state => ({
    showCopyright: state.showCopyright,
    copyrightColor: state.copyrightColor,
    copyrightPosition: state.copyrightPosition
  })))
  const t = useTranslations('CopyrightLayer')

  if (!showCopyright) return null

  return (
    <Text
      text={t('text')}
      fontFamily={DEFAULT_SIGNATURE_FONT}
      fontSize={16}
      fill={copyrightColor === 'black' ? '#000000' : copyrightColor === 'white' ? '#FFFFFF' : '#888888'}
      align={copyrightPosition === 'bottom-left' ? 'left' : copyrightPosition === 'bottom-right' ? 'right' : 'center'}
      width={contentWidth - 60}
      x={30}
      y={contentHeight - 30}
    />
  )
}

export const CopyrightLayer = React.memo(CopyrightLayerComponent)
