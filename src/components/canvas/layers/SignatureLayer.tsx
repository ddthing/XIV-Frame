import React from 'react'
import { Text, Group } from 'react-konva'
import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { useSignatureLayout } from '@/hooks/useSignatureLayout'

function SignatureLayerComponent({ contentWidth, contentHeight }: { contentWidth: number, contentHeight: number }) {
  const {
    signatureSize, signaturePosition, signatureAlign, characterName, serverName, fontFamily,
    upperLetterSpacing, upperBold, upperItalic, lowerLetterSpacing, lowerBold, lowerItalic,
    signatureColor, signatureOpacity
  } = useStore(useShallow(state => ({
    signatureSize: state.signatureSize,
    signaturePosition: state.signaturePosition,
    signatureAlign: state.signatureAlign,
    characterName: state.characterName,
    serverName: state.serverName,
    fontFamily: state.fontFamily,
    upperLetterSpacing: state.upperLetterSpacing,
    upperBold: state.upperBold,
    upperItalic: state.upperItalic,
    lowerLetterSpacing: state.lowerLetterSpacing,
    lowerBold: state.lowerBold,
    lowerItalic: state.lowerItalic,
    signatureColor: state.signatureColor,
    signatureOpacity: state.signatureOpacity
  })))

  const upperFontSize = (signatureSize / 100) * 40
  const lowerFontSize = (signatureSize / 100) * 24

  const { groupRef, upperRef, lowerRef, groupX, groupY } = useSignatureLayout({
    contentWidth,
    contentHeight,
    signaturePosition,
    signatureAlign,
    characterName,
    serverName,
    upperFontSize,
    lowerFontSize,
    fontFamily,
    upperLetterSpacing,
    upperBold,
    upperItalic,
    lowerLetterSpacing,
    lowerBold,
    lowerItalic,
    signatureSize
  })

  if (!characterName && !serverName) return null

  return (
    <Group ref={groupRef} x={groupX} y={groupY}>
      {characterName && (
        <Text
          ref={upperRef}
          text={characterName}
          fill={signatureColor}
          opacity={signatureOpacity / 100}
          fontFamily={fontFamily}
          fontSize={upperFontSize}
          letterSpacing={upperLetterSpacing}
          fontStyle={`${upperItalic ? 'italic ' : ''}${upperBold ? 'bold' : 'normal'}`.trim()}
          align={signatureAlign}
        />
      )}
      {serverName && (
        <Text
          ref={lowerRef}
          text={`✦ ${serverName} ✦`}
          fill={signatureColor}
          opacity={signatureOpacity / 100}
          fontFamily={fontFamily}
          fontSize={lowerFontSize}
          letterSpacing={lowerLetterSpacing}
          fontStyle={`${lowerItalic ? 'italic ' : ''}${lowerBold ? 'bold' : 'normal'}`.trim()}
          align={signatureAlign}
        />
      )}
    </Group>
  )
}

export const SignatureLayer = React.memo(SignatureLayerComponent)
