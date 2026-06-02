import React from 'react'
import { Text } from 'react-konva'
import { useStore } from '@/store/useStore'

function CopyrightLayerComponent({ contentWidth, contentHeight }: { contentWidth: number, contentHeight: number }) {
  const state = useStore()

  if (!state.showCopyright) return null

  return (
    <Text
      text="© SQUARE ENIX  Published in Korea by Actoz Soft CO., LTD."
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
