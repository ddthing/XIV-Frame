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
}

export function useSignatureLayout(props: UseSignatureLayoutProps) {
  const [fontLoaded, setFontLoaded] = useState(false)
  const groupRef = useRef<Konva.Group | null>(null)
  const upperRef = useRef<Konva.Text | null>(null)
  const lowerRef = useRef<Konva.Text | null>(null)

  useEffect(() => {
    document.fonts.load(`10px "${props.fontFamily}"`).then(() => {
      setFontLoaded(true)
    })
  }, [props.fontFamily])

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
    fontLoaded, props.fontFamily,
    props.upperLetterSpacing, props.upperBold, props.upperItalic,
    props.lowerLetterSpacing, props.lowerBold, props.lowerItalic,
    props.signatureSize
  ])

  let groupX = 0
  let groupY = 0

  if (props.signaturePosition.includes('left')) groupX = SIGNATURE_PADDING
  else if (props.signaturePosition.includes('right')) groupX = props.contentWidth - SIGNATURE_PADDING
  else groupX = props.contentWidth / 2

  if (props.signaturePosition.includes('top')) groupY = SIGNATURE_PADDING
  else if (props.signaturePosition.includes('bottom')) groupY = props.contentHeight - SIGNATURE_PADDING
  else groupY = props.contentHeight / 2

  return {
    groupRef,
    upperRef,
    lowerRef,
    groupX,
    groupY,
  }
}
