import React, { useEffect, useState } from 'react'
import { Image as KonvaImage } from 'react-konva'
import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'

function LogoLayerComponent({ contentWidth, contentHeight }: { contentWidth: number, contentHeight: number }) {
  const { logoUrl, logoScale, logoPosition, logoOpacity } = useStore(useShallow(state => ({
    logoUrl: state.logoUrl,
    logoScale: state.logoScale,
    logoPosition: state.logoPosition,
    logoOpacity: state.logoOpacity
  })))
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null)
  const [prevUrl, setPrevUrl] = useState<string | null>(null)

  if (logoUrl !== prevUrl) {
    setPrevUrl(logoUrl)
    setLogoImg(null)
  }

  useEffect(() => {
    if (!logoUrl) return
    
    let active = true
    const img = new window.Image()
    img.src = logoUrl
    img.onload = () => {
      if (active) setLogoImg(img)
    }
    
    return () => {
      active = false
      img.onload = null
      img.src = ''
    }
  }, [logoUrl])

  if (!logoImg) return null

  // Calculate base size based on logoScale
  // Let's assume a default reasonable size is max 300px width or height
  const baseSize = 300
  const scaleRatio = Math.min(baseSize / logoImg.width, baseSize / logoImg.height) * (logoScale / 100)
  
  const width = logoImg.width * scaleRatio
  const height = logoImg.height * scaleRatio

  let x = 0
  let y = 0
  const padding = 50

  // Position
  if (logoPosition.includes('left')) x = padding
  else if (logoPosition.includes('right')) x = contentWidth - width - padding
  else x = (contentWidth - width) / 2 // center

  if (logoPosition.includes('top')) y = padding
  else if (logoPosition.includes('bottom')) y = contentHeight - height - padding
  else y = (contentHeight - height) / 2 // center

  return (
    <KonvaImage
      image={logoImg}
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={logoOpacity / 100}
      listening={false}
    />
  )
}

export const LogoLayer = React.memo(LogoLayerComponent)
