import React from 'react'
import { Text, Group } from 'react-konva'
import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { useSignatureLayout } from '@/hooks/useSignatureLayout'
import { resolveSignatureFont, SIGNATURE_PADDING } from '@/constants/signature'
import { getCopyrightMetrics } from './CopyrightLayer'

const SIGNATURE_COPYRIGHT_GAP = 32

function SignatureLayerComponent({ contentWidth, contentHeight }: { contentWidth: number, contentHeight: number }) {
  const {
    signatureSize, signaturePosition, signatureAlign, characterName, serverName, fontFamily,
    upperLetterSpacing, upperBold, upperItalic, lowerLetterSpacing, lowerBold, lowerItalic,
    signatureColor, signatureOpacity, showCopyright
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
    signatureOpacity: state.signatureOpacity,
    showCopyright: state.showCopyright,
  })))

  const upperFontSize = (signatureSize / 100) * 40
  const lowerFontSize = (signatureSize / 100) * 24
  const resolvedFontFamily = resolveSignatureFont(fontFamily)
  const { fontSize: copyrightFontSize, padding: copyrightPadding, textHeight: copyrightTextHeight } = getCopyrightMetrics(contentWidth, contentHeight)
  const copyrightGap = Math.max(SIGNATURE_COPYRIGHT_GAP, copyrightFontSize * 0.75)
  const signatureBottomOffset = showCopyright && signaturePosition.includes('bottom')
    ? Math.max(0, copyrightPadding + copyrightTextHeight + copyrightGap - SIGNATURE_PADDING)
    : 0

  const { groupRef, upperRef, lowerRef, groupX, groupY } = useSignatureLayout({
    contentWidth,
    contentHeight,
    signaturePosition,
    signatureAlign,
    characterName,
    serverName,
    upperFontSize,
    lowerFontSize,
    fontFamily: resolvedFontFamily,
    upperLetterSpacing,
    upperBold,
    upperItalic,
    lowerLetterSpacing,
    lowerBold,
    lowerItalic,
    signatureSize,
    bottomOffset: signatureBottomOffset
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
          fontFamily={resolvedFontFamily}
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
          fontFamily={resolvedFontFamily}
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
