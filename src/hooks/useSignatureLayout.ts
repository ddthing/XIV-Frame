import { useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { SignaturePosition, SignatureAlign } from '@/store/useStore'
import { SIGNATURE_GAP, SIGNATURE_PADDING } from '@/constants/signature'

interface UseSignatureLayoutProps {
  contentWidth: number
  contentHeight: number
  signaturePosition: SignaturePosition
  signatureAlign: SignatureAlign
  characterName: string
  serverName: string
  upperFontSize: number
  lowerFontSize: number
  fontFamily: string
  upperLetterSpacing: number
  upperBold: boolean
  upperItalic: boolean
  lowerLetterSpacing: number
  lowerBold: boolean
  lowerItalic: boolean
  signatureSize: number
  bottomOffset: number
}

export function useSignatureLayout(props: UseSignatureLayoutProps) {
  const [fontRevision, setFontRevision] = useState(0)
  const groupRef = useRef<Konva.Group | null>(null)
  const upperRef = useRef<Konva.Text | null>(null)
  const lowerRef = useRef<Konva.Text | null>(null)

  useEffect(() => {
    let active = true
    const refreshMetrics = () => {
      if (!active) return
      // Konva caches text widths before a web font arrives. Its public change
      // event refreshes those metrics even when the font name stays unchanged.
      upperRef.current?.fire('fontFamilyChange')
      lowerRef.current?.fire('fontFamilyChange')
      setFontRevision(revision => revision + 1)
      groupRef.current?.getLayer()?.batchDraw()
    }

    void Promise.all([
      document.fonts.load(`${props.upperItalic ? 'italic ' : ''}${props.upperBold ? '700' : '400'} 40px "${props.fontFamily}"`, props.characterName || 'Aa'),
      document.fonts.load(`${props.lowerItalic ? 'italic ' : ''}${props.lowerBold ? '700' : '400'} 24px "${props.fontFamily}"`, props.serverName || 'Aa'),
    ]).then(refreshMetrics, refreshMetrics)

    return () => { active = false }
  }, [props.fontFamily, props.characterName, props.serverName, props.upperItalic, props.upperBold, props.lowerItalic, props.lowerBold])

  useEffect(() => {
    if (groupRef.current) {
      const upperNode = upperRef.current
      const lowerNode = lowerRef.current

      const upperWidth = upperNode ? upperNode.width() : 0
      const upperHeight = upperNode ? upperNode.height() : 0
      const lowerWidth = lowerNode ? lowerNode.width() : 0
      const lowerHeight = lowerNode ? lowerNode.height() : 0

      const width = Math.max(upperWidth, lowerWidth)
      
      if (upperNode) {
        if (props.signatureAlign === 'center') upperNode.x((width - upperWidth) / 2)
        else if (props.signatureAlign === 'right') upperNode.x(width - upperWidth)
        else upperNode.x(0)
        upperNode.y(0)
      }
      
      if (lowerNode) {
        if (props.signatureAlign === 'center') lowerNode.x((width - lowerWidth) / 2)
        else if (props.signatureAlign === 'right') lowerNode.x(width - lowerWidth)
        else lowerNode.x(0)
        lowerNode.y(props.characterName ? upperHeight + SIGNATURE_GAP : 0)
      }

      const totalHeight = (props.characterName ? upperHeight : 0) + (props.serverName ? lowerHeight + (props.characterName ? SIGNATURE_GAP : 0) : 0)

      const group = groupRef.current
      if (props.signaturePosition.includes('right')) group.offsetX(width)
      else if (props.signaturePosition.includes('left')) group.offsetX(0)
      else group.offsetX(width / 2)

      if (props.signaturePosition.includes('bottom')) group.offsetY(totalHeight)
      else if (props.signaturePosition.includes('top')) group.offsetY(0)
      else group.offsetY(totalHeight / 2)
    }
  }, [
    props.characterName, props.serverName, 
    props.upperFontSize, props.lowerFontSize, 
    props.signaturePosition, props.signatureAlign, 
    fontRevision, props.fontFamily,
    props.upperLetterSpacing, props.upperBold, props.upperItalic,
    props.lowerLetterSpacing, props.lowerBold, props.lowerItalic,
    props.signatureSize,
    props.bottomOffset
  ])

  let groupX = 0
  let groupY = 0

  if (props.signaturePosition.includes('left')) groupX = SIGNATURE_PADDING
  else if (props.signaturePosition.includes('right')) groupX = props.contentWidth - SIGNATURE_PADDING
  else groupX = props.contentWidth / 2

  if (props.signaturePosition.includes('top')) groupY = SIGNATURE_PADDING
  else if (props.signaturePosition.includes('bottom')) groupY = props.contentHeight - SIGNATURE_PADDING - props.bottomOffset
  else groupY = props.contentHeight / 2

  return {
    groupRef,
    upperRef,
    lowerRef,
    groupX,
    groupY,
  }
}
