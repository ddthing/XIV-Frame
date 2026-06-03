import React from 'react'
import { Text } from 'react-konva'
import { useStore } from '@/store/useStore'

import { useTranslations } from 'next-intl'

function CopyrightLayerComponent({ contentWidth, contentHeight }: { contentWidth: number, contentHeight: number }) {
  const state = useStore()
  const t = useTranslations('CopyrightLayer')

  if (!state.showCopyright) return null

  return (
    <Text
      text={t('text')}
      fontFamily="Pretendard, sans-serif"
      fontSize={16}
      fill={state.copyrightColor === 'black' ? '#000000' : state.copyrightColor === 'white' ? '#FFFFFF' : '#888888'}
      align={state.copyrightPosition === 'bottom-left' ? 'left' : state.copyrightPosition === 'bottom-right' ? 'right' : 'center'}
      width={contentWidth - 60}
      x={30}
      y={contentHeight - 30}
    />
  )
}

export const CopyrightLayer = React.memo(CopyrightLayerComponent)
