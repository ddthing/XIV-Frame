import type { RefObject, MutableRefObject } from 'react'
import type Konva from 'konva'

export function exportCanvas(stageRef: RefObject<Konva.Stage | null> | MutableRefObject<Konva.Stage | null>, type: 'png' | 'jpeg') {
  if (!stageRef.current) return

  const dataURL = stageRef.current.toDataURL({ 
    pixelRatio: 3, 
    mimeType: `image/${type}` 
  })
  
  const link = document.createElement('a')
  link.download = `ffxiv-screenshot-${Date.now()}.${type}`
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
