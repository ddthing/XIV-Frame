import React from 'react'
import { Text, Group } from 'react-konva'
import { useStore } from '@/store/useStore'
import { useSignatureLayout } from '@/hooks/useSignatureLayout'

function SignatureLayerComponent({ contentWidth, contentHeight }: { contentWidth: number, contentHeight: number }) {
  const state = useStore()

  const upperFontSize = (state.signatureSize / 100) * 40
  const lowerFontSize = (state.signatureSize / 100) * 24

  const { groupRef, upperRef, lowerRef, groupX, groupY } = useSignatureLayout({
    contentWidth,
    contentHeight,
    signaturePosition: state.signaturePosition,
    signatureAlign: state.signatureAlign,
    characterName: state.characterName,
    serverName: state.serverName,
    upperFontSize,
    lowerFontSize,
    fontFamily: state.fontFamily,
    upperLetterSpacing: state.upperLetterSpacing,
    upperBold: state.upperBold,
    upperItalic: state.upperItalic,
    lowerLetterSpacing: state.lowerLetterSpacing,
    lowerBold: state.lowerBold,
    lowerItalic: state.lowerItalic,
    signatureSize: state.signatureSize
  })

  if (!state.characterName && !state.serverName) return null

  return (
    <Group ref={groupRef} x={groupX} y={groupY}>
      {state.characterName && (
        <Text
          ref={upperRef}
          text={state.characterName}
          fill={state.signatureColor}
          opacity={state.signatureOpacity / 100}
          fontFamily={state.fontFamily}
          fontSize={upperFontSize}
          letterSpacing={state.upperLetterSpacing}
          fontStyle={`${state.upperItalic ? 'italic ' : ''}${state.upperBold ? 'bold' : 'normal'}`.trim()}
          align={state.signatureAlign}
        />
      )}
      {state.serverName && (
        <Text
          ref={lowerRef}
          text={`✦ ${state.serverName} ✦`}
          fill={state.signatureColor}
          opacity={state.signatureOpacity / 100}
          fontFamily={state.fontFamily}
          fontSize={lowerFontSize}
          letterSpacing={state.lowerLetterSpacing}
          fontStyle={`${state.lowerItalic ? 'italic ' : ''}${state.lowerBold ? 'bold' : 'normal'}`.trim()}
          align={state.signatureAlign}
        />
      )}
    </Group>
  )
}

export const SignatureLayer = React.memo(SignatureLayerComponent)
