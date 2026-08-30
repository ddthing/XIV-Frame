import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva'
import useImage from 'use-image'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'
import type Konva from 'konva'

import { useStore } from '@/store/useStore'
import { CHARACTER_NUDGE_EVENT, nudgeCharacterPosition, type CharacterNudgeDetail } from '@/lib/characterPosition'
import { getCharacterScaleBounds } from '@/lib/characterScale'
import { shouldShowCharacterGuide } from '@/lib/characterGuide'
import { drawCharacterHitArea } from '@/lib/characterHitArea'

type CanvasPosition = { x: number; y: number }
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se'

const RESIZE_HANDLES: ResizeHandle[] = ['nw', 'ne', 'sw', 'se']

function getResizeCursor(handle: ResizeHandle) {
  return handle === 'nw' || handle === 'se' ? 'nwse-resize' : 'nesw-resize'
}

function isInteractiveElement(element: Element | null) {
  return Boolean(element?.matches('input, textarea, select, button, [contenteditable="true"]'))
}

function createAlphaOutline(image: HTMLImageElement) {
  if (typeof document === 'undefined') return null

  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  if (!width || !height) return null

  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = width
  sourceCanvas.height = height
  const sourceContext = sourceCanvas.getContext('2d')
  if (!sourceContext) return null
  sourceContext.drawImage(image, 0, 0, width, height)

  const silhouetteCanvas = document.createElement('canvas')
  silhouetteCanvas.width = width
  silhouetteCanvas.height = height
  const silhouetteContext = silhouetteCanvas.getContext('2d')
  if (!silhouetteContext) return null
  silhouetteContext.drawImage(sourceCanvas, 0, 0)
  silhouetteContext.globalCompositeOperation = 'source-in'
  silhouetteContext.fillStyle = '#e7f5a5'
  silhouetteContext.fillRect(0, 0, width, height)

  const outlineCanvas = document.createElement('canvas')
  outlineCanvas.width = width
  outlineCanvas.height = height
  const outlineContext = outlineCanvas.getContext('2d')
  if (!outlineContext) return null

  const spread = Math.max(3, Math.min(18, Math.round(Math.min(width, height) * 0.01)))
  const offsets = [
    [-spread, -spread], [0, -spread], [spread, -spread],
    [-spread, 0], [spread, 0],
    [-spread, spread], [0, spread], [spread, spread],
  ]

  offsets.forEach(([x, y]) => outlineContext.drawImage(silhouetteCanvas, x, y))
  outlineContext.globalCompositeOperation = 'destination-out'
  outlineContext.drawImage(sourceCanvas, 0, 0)
  return outlineCanvas
}

function drawCharacterBoundsHitArea(
  context: Konva.Context,
  shape: Konva.Shape,
  width: number,
  height: number,
) {
  context.beginPath()
  context.rect(0, 0, width, height)
  context.closePath()
  context.fillStrokeShape(shape)
}

function CharacterGuide({
  guideRef,
  outlineImage,
  position,
  width,
  height,
  scale,
  imageWidth,
  imageHeight,
  flipped,
  contentHeight,
  onResizeStart,
  onResizePreview,
  onResizeEnd,
  onHandleEnter,
  onHandleLeave,
  label,
}: {
  guideRef: RefObject<Konva.Group | null>
  outlineImage: HTMLCanvasElement | null
  position: CanvasPosition
  width: number
  height: number
  scale: number
  imageWidth: number
  imageHeight: number
  flipped: boolean
  contentHeight: number
  onResizeStart: (stage?: Konva.Stage | null) => void
  onResizePreview: (handle: ResizeHandle, pointer: CanvasPosition) => void
  onResizeEnd: () => void
  onHandleEnter: () => void
  onHandleLeave: () => void
  label: string
}) {
  // The guide is positioned by the same Konva node as the character. Keep
  // its children local so dragging updates one native transform instead of
  // re-rendering React for every pointer event.
  const visualX = flipped ? -width : 0
  const visualY = 0
  const handleSize = Math.max(18, Math.min(32, contentHeight * 0.024))
  const handleStrokeWidth = Math.max(2, handleSize * 0.1)
  const frameStrokeWidth = Math.max(2, handleSize * 0.08)
  const tagFontSize = Math.max(14, Math.min(24, contentHeight * 0.018))
  const tagPadding = Math.max(6, tagFontSize * 0.35)
  const tagHeight = tagFontSize + (tagPadding * 2)
  const handlePositions: Record<ResizeHandle, CanvasPosition> = {
    nw: { x: visualX, y: visualY },
    ne: { x: visualX + width, y: visualY },
    sw: { x: visualX, y: visualY + height },
    se: { x: visualX + width, y: visualY + height },
  }

  return (
    <Group ref={guideRef} x={position.x} y={position.y}>
      <Rect
        x={visualX}
        y={visualY}
        width={width}
        height={height}
        stroke="#e7f5a5"
        strokeWidth={frameStrokeWidth}
        dash={[Math.max(12, handleSize * 0.8), Math.max(6, handleSize * 0.45)]}
        cornerRadius={Math.max(4, handleSize * 0.2)}
        shadowColor="#173806"
        shadowBlur={Math.max(4, handleSize * 0.25)}
        shadowOpacity={0.45}
        listening={false}
      />
      <Text
        x={visualX}
        y={Math.max(-position.y, visualY - tagHeight - 6)}
        text={label}
        fontSize={tagFontSize}
        fontStyle="bold"
        padding={tagPadding}
        fill="#173806"
        stroke="#e7f5a5"
        strokeWidth={Math.max(1, frameStrokeWidth * 0.45)}
        shadowColor="#ffffff"
        shadowBlur={3}
        shadowOpacity={0.9}
        listening={false}
      />
      {outlineImage && (
        <KonvaImage
          image={outlineImage}
          x={0}
          y={0}
          width={imageWidth}
          height={imageHeight}
          scaleX={flipped ? -scale : scale}
          scaleY={scale}
          offsetX={flipped ? imageWidth : 0}
          opacity={0.95}
          listening={false}
        />
      )}
      {RESIZE_HANDLES.map((handle) => {
        const { x, y } = handlePositions[handle]
        return (
          <Rect
            key={handle}
            x={x - handleSize / 2}
            y={y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#e7f5a5"
            stroke="#173806"
            strokeWidth={handleStrokeWidth}
            cornerRadius={Math.max(3, handleSize * 0.2)}
            hitStrokeWidth={Math.max(10, handleSize * 0.5)}
            draggable
            onMouseEnter={(event) => {
              onHandleEnter()
              event.target.getStage()?.container().style.setProperty('cursor', getResizeCursor(handle))
            }}
            onMouseLeave={(event) => {
              onHandleLeave()
              event.target.getStage()?.container().style.setProperty('cursor', 'default')
            }}
            onDragStart={(event) => {
              event.cancelBubble = true
              onResizeStart(event.target.getStage())
            }}
            onDragMove={(event) => {
              event.cancelBubble = true
              const parentPosition = event.target.getParent()?.position() ?? { x: 0, y: 0 }
              onResizePreview(handle, {
                x: parentPosition.x + event.target.x() + handleSize / 2,
                y: parentPosition.y + event.target.y() + handleSize / 2,
              })
            }}
            onDragEnd={(event) => {
              event.cancelBubble = true
              onResizeEnd()
            }}
          />
        )
      })}
    </Group>
  )
}

function CharacterLayerComponent({ contentWidth, contentHeight }: { contentWidth: number; contentHeight: number }) {
  const {
    characterCutoutUrl,
    characterPosition,
    characterScale,
    characterOpacity,
    characterFlipX,
    characterShadow,
    setCharacterPosition,
    setCharacterScale,
    isExporting,
  } = useStore(useShallow((state) => ({
    characterCutoutUrl: state.characterCutoutUrl,
    characterPosition: state.characterPosition,
    characterScale: state.characterScale,
    characterOpacity: state.characterOpacity,
    characterFlipX: state.characterFlipX,
    characterShadow: state.characterShadow,
    setCharacterPosition: state.setCharacterPosition,
    setCharacterScale: state.setCharacterScale,
    isExporting: state.isExporting,
  })))
  const t = useTranslations('ImageUploader')
  const characterT = useTranslations('SignatureSettings')

  const [characterImg] = useImage(characterCutoutUrl ?? '', 'anonymous')
  const [isHovered, setIsHovered] = useState(false)
  const [deselectedCharacterUrl, setDeselectedCharacterUrl] = useState<string | null>(null)
  const [guideDismissedCharacterUrl, setGuideDismissedCharacterUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [livePosition, setLivePosition] = useState<CanvasPosition | null>(null)
  const [liveScale, setLiveScale] = useState<number | null>(null)
  const resizePreviewRef = useRef<{ scale: number; position: CanvasPosition } | null>(null)
  const pendingResizePreviewRef = useRef<{ scale: number; position: CanvasPosition } | null>(null)
  const resizeFrameRef = useRef<number | null>(null)
  const guideHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const characterPositionRef = useRef<CanvasPosition | null>(null)
  const characterGuideRef = useRef<Konva.Group | null>(null)
  const isCharacterSelected = Boolean(characterCutoutUrl && deselectedCharacterUrl !== characterCutoutUrl)
  const isGuideAutoVisible = Boolean(characterCutoutUrl && guideDismissedCharacterUrl !== characterCutoutUrl)
  const outlineImage = useMemo(
    () => characterImg ? createAlphaOutline(characterImg) : null,
    [characterImg],
  )

  useEffect(() => {
    return () => {
      if (guideHideTimeoutRef.current) clearTimeout(guideHideTimeoutRef.current)
      if (resizeFrameRef.current !== null) window.cancelAnimationFrame(resizeFrameRef.current)
    }
  }, [])

  useEffect(() => {
    const handleCharacterNudge = (event: Event) => {
      const detail = (event as CustomEvent<CharacterNudgeDetail>).detail
      if (!detail || !Number.isFinite(detail.dx) || !Number.isFinite(detail.dy)) return
      const currentPosition = characterPositionRef.current
      if (!currentPosition || !characterCutoutUrl) return

      const nextPosition = nudgeCharacterPosition(currentPosition, detail)
      characterPositionRef.current = nextPosition
      setCharacterPosition(nextPosition)
      setDeselectedCharacterUrl(null)
      setGuideDismissedCharacterUrl(null)
      setIsHovered(true)
    }

    window.addEventListener(CHARACTER_NUDGE_EVENT, handleCharacterNudge)
    return () => window.removeEventListener(CHARACTER_NUDGE_EVENT, handleCharacterNudge)
  }, [characterCutoutUrl, setCharacterPosition])

  useEffect(() => {
    const handleKeyboardNudge = (event: KeyboardEvent) => {
      if (isExporting || !characterCutoutUrl || !isCharacterSelected) return
      if (!(document.activeElement instanceof HTMLElement) || document.activeElement.dataset.xivFrameCanvas !== 'true') return
      if (isInteractiveElement(document.activeElement) || isInteractiveElement(event.target instanceof Element ? event.target : null)) return

      if (event.key === 'Escape') {
        event.preventDefault()
        setDeselectedCharacterUrl(characterCutoutUrl)
        setGuideDismissedCharacterUrl(characterCutoutUrl)
        setIsHovered(false)
        return
      }

      const direction = {
        ArrowUp: { dx: 0, dy: -1 },
        ArrowLeft: { dx: -1, dy: 0 },
        ArrowRight: { dx: 1, dy: 0 },
        ArrowDown: { dx: 0, dy: 1 },
      }[event.key]
      if (!direction || !characterPositionRef.current) return

      event.preventDefault()
      event.stopPropagation()
      const step = event.shiftKey ? 10 : 1
      const nextPosition = nudgeCharacterPosition(characterPositionRef.current, {
        dx: direction.dx * step,
        dy: direction.dy * step,
      })
      characterPositionRef.current = nextPosition
      setCharacterPosition(nextPosition)
      setIsHovered(true)
    }

    window.addEventListener('keydown', handleKeyboardNudge)
    return () => window.removeEventListener('keydown', handleKeyboardNudge)
  }, [characterCutoutUrl, isCharacterSelected, isExporting, setCharacterPosition])

  // The default footprint is intentionally portrait-friendly for full-body
  // characters, while the user can enlarge it beyond that base size.
  const hasCharacterImage = Boolean(characterImg?.width && characterImg?.height)
  const imageWidth = characterImg?.width ?? 0
  const imageHeight = characterImg?.height ?? 0
  const baseScale = hasCharacterImage ? Math.min(
    (contentWidth * 0.58) / imageWidth,
    (contentHeight * 0.86) / imageHeight,
  ) : 0
  const renderedCharacterScale = liveScale ?? characterScale
  const scale = baseScale * renderedCharacterScale
  const width = imageWidth * scale
  const height = imageHeight * scale
  const position = useMemo(
    () => hasCharacterImage
      ? livePosition ?? characterPosition ?? {
        x: Math.max(0, (contentWidth - width) / 2),
        y: Math.max(0, contentHeight - height - Math.max(24, contentHeight * 0.06)),
      }
      : null,
    [characterPosition, contentHeight, contentWidth, hasCharacterImage, height, livePosition, width],
  )

  useEffect(() => {
    characterPositionRef.current = position
  }, [position])

  if (!characterImg || !position) return null

  const showGuide = shouldShowCharacterGuide({
    isExporting,
    isHovered: isHovered || isGuideAutoVisible,
    isDragging,
    isResizing,
  })

  const cancelGuideHide = () => {
    if (guideHideTimeoutRef.current) {
      clearTimeout(guideHideTimeoutRef.current)
      guideHideTimeoutRef.current = null
    }
    setGuideDismissedCharacterUrl(null)
    setIsHovered(true)
  }

  const scheduleGuideHide = () => {
    if (isDragging || isResizing) return
    if (guideHideTimeoutRef.current) clearTimeout(guideHideTimeoutRef.current)
    guideHideTimeoutRef.current = setTimeout(() => {
      guideHideTimeoutRef.current = null
      setGuideDismissedCharacterUrl(characterCutoutUrl)
      setIsHovered(false)
    }, 180)
  }

  const focusStage = (stage?: Konva.Stage | null) => {
    const container = stage?.container()
    if (!container) return
    container.dataset.xivFrameCanvas = 'true'
    container.tabIndex = 0
    container.setAttribute('aria-label', t('canvasKeyboardTarget'))
    container.setAttribute('aria-keyshortcuts', 'ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight')
    container.focus({ preventScroll: true })
  }

  const selectCharacter = (stage?: Konva.Stage | null) => {
    setDeselectedCharacterUrl(null)
    setGuideDismissedCharacterUrl(null)
    cancelGuideHide()
    focusStage(stage)
  }

  const handleResizePreview = (handle: ResizeHandle, pointer: CanvasPosition) => {
    const visualX = characterFlipX ? position.x - width : position.x
    const visualY = position.y
    const anchor = {
      x: handle.includes('w') ? visualX + width : visualX,
      y: handle.includes('n') ? visualY + height : visualY,
    }
    const aspectRatio = width / height
    const horizontalDistance = Math.max(0, handle.includes('w') ? anchor.x - pointer.x : pointer.x - anchor.x)
    const verticalDistance = Math.max(0, handle.includes('n') ? anchor.y - pointer.y : pointer.y - anchor.y)
    const { minWidth, maxWidth } = getCharacterScaleBounds(characterImg.width * baseScale)
    const nextWidth = Math.max(
      minWidth,
      Math.min(maxWidth, Math.max(horizontalDistance, verticalDistance * aspectRatio)),
    )
    const nextHeight = nextWidth / aspectRatio
    const nextX = handle.includes('w') ? anchor.x - nextWidth : anchor.x
    const nextY = handle.includes('n') ? anchor.y - nextHeight : anchor.y
    const nextScale = nextWidth / (characterImg.width * baseScale)
    const nextPosition = characterFlipX
      ? { x: nextX + nextWidth, y: nextY }
      : { x: nextX, y: nextY }

    const nextPreview = { scale: nextScale, position: nextPosition }
    resizePreviewRef.current = nextPreview
    pendingResizePreviewRef.current = nextPreview
    if (resizeFrameRef.current === null) {
      resizeFrameRef.current = window.requestAnimationFrame(() => {
        resizeFrameRef.current = null
        const preview = pendingResizePreviewRef.current
        if (!preview) return
        setLiveScale(preview.scale)
        setLivePosition(preview.position)
      })
    }
  }

  const handleResizeEnd = () => {
    if (resizeFrameRef.current !== null) {
      window.cancelAnimationFrame(resizeFrameRef.current)
      resizeFrameRef.current = null
    }
    pendingResizePreviewRef.current = null
    const preview = resizePreviewRef.current
    if (preview) {
      setCharacterScale(preview.scale)
      setCharacterPosition(preview.position)
    }
    resizePreviewRef.current = null
    setLiveScale(null)
    setIsResizing(false)
  }

  return (
    <>
      <KonvaImage
        image={characterImg}
        x={position.x}
        y={position.y}
        width={characterImg.width}
        height={characterImg.height}
        scaleX={characterFlipX ? -scale : scale}
        scaleY={scale}
        offsetX={characterFlipX ? characterImg.width : 0}
        // Konva's default Image hit area is rectangular; use the PNG alpha
        // mask before selection, then use the full footprint after selection
        // so transparent padding remains draggable.
        hitFunc={(context, shape) => {
          if (isCharacterSelected) {
            drawCharacterBoundsHitArea(context, shape, characterImg.width, characterImg.height)
          } else {
            drawCharacterHitArea(context, shape, characterImg, characterImg.width, characterImg.height)
          }
        }}
        opacity={characterOpacity / 100}
        draggable
        shadowColor={characterShadow ? '#000000' : undefined}
        shadowBlur={characterShadow ? Math.max(12, width * 0.018) : 0}
        shadowOffset={{ x: 0, y: characterShadow ? Math.max(8, height * 0.012) : 0 }}
        shadowOpacity={characterShadow ? 0.24 : 0}
        onMouseEnter={(event) => {
          setIsHovered(true)
          cancelGuideHide()
          event.target.getStage()?.container().style.setProperty('cursor', 'move')
        }}
        onMouseLeave={(event) => {
          scheduleGuideHide()
          event.target.getStage()?.container().style.setProperty('cursor', 'default')
        }}
        onClick={(event) => {
          event.cancelBubble = true
          selectCharacter(event.target.getStage())
        }}
        onTap={(event) => {
          event.cancelBubble = true
          selectCharacter(event.target.getStage())
        }}
        onDragStart={(event) => {
          event.cancelBubble = true
          selectCharacter(event.target.getStage())
          setIsDragging(true)
          characterGuideRef.current?.position({ x: event.target.x(), y: event.target.y() })
        }}
        onDragMove={(event) => {
          characterGuideRef.current?.position({ x: event.target.x(), y: event.target.y() })
        }}
        onDragEnd={(event) => {
          const nextPosition = { x: event.target.x(), y: event.target.y() }
          characterGuideRef.current?.position(nextPosition)
          setCharacterPosition(nextPosition)
          setIsDragging(false)
        }}
      />
      {showGuide && (
        <CharacterGuide
          guideRef={characterGuideRef}
          outlineImage={outlineImage}
          position={position}
          width={width}
          height={height}
          scale={scale}
          imageWidth={characterImg.width}
          imageHeight={characterImg.height}
          flipped={characterFlipX}
          contentHeight={contentHeight}
          onResizeStart={(stage) => {
            selectCharacter(stage)
            setIsResizing(true)
            resizePreviewRef.current = null
            pendingResizePreviewRef.current = null
          }}
          onResizePreview={handleResizePreview}
          onResizeEnd={handleResizeEnd}
          onHandleEnter={cancelGuideHide}
          onHandleLeave={scheduleGuideHide}
          label={characterT('characterTitle')}
        />
      )}
    </>
  )
}

export const CharacterLayer = CharacterLayerComponent
