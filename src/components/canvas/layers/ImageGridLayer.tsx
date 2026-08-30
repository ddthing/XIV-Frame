import React from 'react'
import { Layer, Group, Image as KonvaImage, Rect, Shape } from 'react-konva'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '@/store/useStore'
import { getLayoutGeometry } from '@/lib/layoutTemplates'
import { getImageCellGeometry } from '@/lib/canvasGeometry'
import { clipImageShape, type ImageShape } from '@/lib/imageShapes'
import type Konva from 'konva'

type ImagePosition = { x: number; y: number }
type DragContext = {
  startX: number
  startY: number
  axis: 'x' | 'y' | null
  inverseTransform?: Konva.Transform
  absoluteTransform?: Konva.Transform
}

type SoftBlendMaskDirection = 'horizontal' | 'vertical'

const SOFT_BLEND_MASK_CACHE_LIMIT = 6
const softBlendMaskCache = new Map<string, HTMLCanvasElement>()

export type LoadedCanvasImage = {
  image: HTMLImageElement
  sourceIndex: number
}

function getSoftBlendMask(
  width: number,
  height: number,
  blendWidth: number,
  direction: SoftBlendMaskDirection,
) {
  const canvasWidth = Math.max(1, Math.ceil(width))
  const canvasHeight = Math.max(1, Math.ceil(height))
  const cacheKey = `${canvasWidth}x${canvasHeight}:${Math.ceil(blendWidth)}:${direction}`
  const cachedMask = softBlendMaskCache.get(cacheKey)
  if (cachedMask) return cachedMask

  const mask = document.createElement('canvas')
  mask.width = canvasWidth
  mask.height = canvasHeight
  const maskContext = mask.getContext('2d')
  if (!maskContext) return null

  const gradient = direction === 'horizontal'
    ? maskContext.createLinearGradient(0, 0, canvasWidth, 0)
    : maskContext.createLinearGradient(0, 0, 0, canvasHeight)
  const extent = direction === 'horizontal' ? canvasWidth : canvasHeight
  const transition = Math.min(1, blendWidth / Math.max(1, extent))

  gradient.addColorStop(0, 'rgba(0,0,0,0)')
  gradient.addColorStop(transition, 'rgba(0,0,0,1)')
  gradient.addColorStop(1, 'rgba(0,0,0,1)')

  maskContext.fillStyle = gradient
  maskContext.fillRect(0, 0, canvasWidth, canvasHeight)

  if (softBlendMaskCache.size >= SOFT_BLEND_MASK_CACHE_LIMIT) {
    const oldestKey = softBlendMaskCache.keys().next().value
    if (oldestKey) softBlendMaskCache.delete(oldestKey)
  }
  softBlendMaskCache.set(cacheKey, mask)
  return mask
}

function drawSoftBlendMask(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  blendWidth: number,
  direction: SoftBlendMaskDirection,
  rasterScale: number,
) {
  const rasterWidth = Math.max(1, Math.ceil(width * rasterScale))
  const rasterHeight = Math.max(1, Math.ceil(height * rasterScale))
  const mask = getSoftBlendMask(rasterWidth, rasterHeight, blendWidth * rasterScale, direction)
  if (!mask) return
  context.globalCompositeOperation = 'destination-in'
  context.drawImage(mask, 0, 0, rasterWidth, rasterHeight)
  context.globalCompositeOperation = 'source-over'
}

function drawSoftBlendImage({
  context,
  image,
  cell,
  borderWidth,
  position,
  scale,
  blendWidth,
  applyHorizontalMask,
  applyVerticalMask,
  imageShape,
  rasterScale,
}: {
  context: CanvasRenderingContext2D
  image: HTMLImageElement
  cell: ReturnType<typeof getImageCellGeometry>
  borderWidth: number
  position: ImagePosition
  scale: number
  blendWidth: number
  applyHorizontalMask: boolean
  applyVerticalMask: boolean
  imageShape: ImageShape
  rasterScale: number
}) {
  const cellWidth = Math.max(1, Math.ceil(cell.width * rasterScale))
  const cellHeight = Math.max(1, Math.ceil(cell.height * rasterScale))
  const cellX = Math.ceil((borderWidth + cell.x) * rasterScale)
  const cellY = Math.ceil((borderWidth + cell.y) * rasterScale)

  context.save()
  context.translate(cellX, cellY)
  clipImageShape(context, imageShape, cellWidth, cellHeight)
  context.drawImage(
    image,
    position.x * rasterScale,
    position.y * rasterScale,
    image.width * scale * rasterScale,
    image.height * scale * rasterScale,
  )

  if (blendWidth > 0) {
    if (applyHorizontalMask) drawSoftBlendMask(context, cell.width, cell.height, blendWidth, 'horizontal', rasterScale)
    if (applyVerticalMask) drawSoftBlendMask(context, cell.width, cell.height, blendWidth, 'vertical', rasterScale)
  }
  context.restore()
}

function SoftBlendCompositeVisual({
  id,
  images,
  contentWidth,
  contentHeight,
  borderWidth,
  gap,
  geometry,
  imageCount,
  blendWidth,
  imageShape,
  imagePositions,
  imageScales,
  transientPositions,
  wheelScales,
  activeInteractionIndexRef,
  rasterScale,
}: {
  id: string
  images: readonly LoadedCanvasImage[]
  contentWidth: number
  contentHeight: number
  borderWidth: number
  gap: number
  geometry: ReturnType<typeof getLayoutGeometry>
  imageCount: number
  blendWidth: number
  imageShape: ImageShape
  imagePositions: readonly ImagePosition[]
  imageScales: readonly number[]
  transientPositions: React.MutableRefObject<Map<number, ImagePosition>>
  wheelScales: React.MutableRefObject<Map<number, number>>
  activeInteractionIndexRef: React.RefObject<number | null>
  rasterScale: number
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const scratchCanvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const outerWidth = contentWidth + (borderWidth * 2)
  const outerHeight = contentHeight + (borderWidth * 2)
  const sceneFunc = React.useCallback((context: Konva.Context) => {
    const canvas = canvasRef.current ?? document.createElement('canvas')
    canvasRef.current = canvas

    const canvasWidth = Math.max(1, Math.ceil(outerWidth * rasterScale))
    const canvasHeight = Math.max(1, Math.ceil(outerHeight * rasterScale))
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth
      canvas.height = canvasHeight
    }

    const offscreenContext = canvas.getContext('2d')
    if (!offscreenContext) return
    offscreenContext.clearRect(0, 0, canvasWidth, canvasHeight)

    const renderedImages = images.flatMap(({ image, sourceIndex }) => {
      if (activeInteractionIndexRef.current === sourceIndex) return []

      return [{
        image,
        sourceIndex,
        cell: getImageCellGeometry({
          contentWidth,
          contentHeight,
          gap,
          geometry,
          imageCount,
          index: sourceIndex,
        }),
      }]
    })
    const scratchWidth = Math.max(1, ...renderedImages.map(({ cell }) => Math.ceil(cell.width * rasterScale)))
    const scratchHeight = Math.max(1, ...renderedImages.map(({ cell }) => Math.ceil(cell.height * rasterScale)))
    const scratchCanvas = scratchCanvasRef.current ?? document.createElement('canvas')
    scratchCanvasRef.current = scratchCanvas
    if (scratchCanvas.width !== scratchWidth || scratchCanvas.height !== scratchHeight) {
      scratchCanvas.width = scratchWidth
      scratchCanvas.height = scratchHeight
    }

    const scratchContext = scratchCanvas.getContext('2d')
    if (!scratchContext) return

    renderedImages.forEach(({ image, sourceIndex, cell }) => {
      const baseScale = Math.max(cell.width / image.width, cell.height / image.height)
      const userScale = wheelScales.current.get(sourceIndex) ?? imageScales[sourceIndex] ?? 1
      const position = transientPositions.current.get(sourceIndex) ?? imagePositions[sourceIndex] ?? { x: 0, y: 0 }
      const cellWidth = Math.max(1, Math.ceil(cell.width * rasterScale))
      const cellHeight = Math.max(1, Math.ceil(cell.height * rasterScale))
      scratchContext.clearRect(0, 0, scratchWidth, scratchHeight)

      drawSoftBlendImage({
        context: scratchContext,
        image,
        cell: { ...cell, x: 0, y: 0 },
        borderWidth: 0,
        position,
        scale: baseScale * userScale,
        blendWidth,
        applyHorizontalMask: cell.column > 0,
        applyVerticalMask: cell.row > 0,
        imageShape: images.length === 1 ? imageShape : 'rectangle',
        rasterScale,
      })

      offscreenContext.drawImage(
        scratchCanvas,
        0,
        0,
        cellWidth,
        cellHeight,
        Math.ceil((borderWidth + cell.x) * rasterScale),
        Math.ceil((borderWidth + cell.y) * rasterScale),
        cellWidth,
        cellHeight,
      )
    })

    context.drawImage(canvas, 0, 0, outerWidth, outerHeight)
  }, [activeInteractionIndexRef, blendWidth, borderWidth, contentHeight, contentWidth, gap, geometry, imageCount, imagePositions, imageScales, imageShape, images, outerHeight, outerWidth, rasterScale, transientPositions, wheelScales])

  return <Shape id={id} listening={false} sceneFunc={sceneFunc} />
}

function SoftBlendActiveVisual({
  id,
  entry,
  cell,
  imageCount,
  imageShape,
  blendWidth,
  imagePositions,
  imageScales,
  transientPositions,
  wheelScales,
  activeInteractionIndexRef,
  rasterScale,
}: {
  id: string
  entry: LoadedCanvasImage
  cell: ReturnType<typeof getImageCellGeometry>
  imageCount: number
  imageShape: ImageShape
  blendWidth: number
  imagePositions: readonly ImagePosition[]
  imageScales: readonly number[]
  transientPositions: React.MutableRefObject<Map<number, ImagePosition>>
  wheelScales: React.MutableRefObject<Map<number, number>>
  activeInteractionIndexRef: React.RefObject<number | null>
  rasterScale: number
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const { image, sourceIndex } = entry
  const sceneFunc = React.useCallback((context: Konva.Context) => {
    if (activeInteractionIndexRef.current !== sourceIndex) return

    const canvas = canvasRef.current ?? document.createElement('canvas')
    canvasRef.current = canvas
    const canvasWidth = Math.max(1, Math.ceil(cell.width * rasterScale))
    const canvasHeight = Math.max(1, Math.ceil(cell.height * rasterScale))
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth
      canvas.height = canvasHeight
    }

    const offscreenContext = canvas.getContext('2d')
    if (!offscreenContext) return
    offscreenContext.clearRect(0, 0, canvasWidth, canvasHeight)

    const baseScale = Math.max(cell.width / image.width, cell.height / image.height)
    const userScale = wheelScales.current.get(sourceIndex) ?? imageScales[sourceIndex] ?? 1
    const position = transientPositions.current.get(sourceIndex) ?? imagePositions[sourceIndex] ?? { x: 0, y: 0 }
    drawSoftBlendImage({
      context: offscreenContext,
      image,
      cell: { ...cell, x: 0, y: 0 },
      borderWidth: 0,
      position,
      scale: baseScale * userScale,
      blendWidth,
      applyHorizontalMask: cell.column > 0,
      applyVerticalMask: cell.row > 0,
      imageShape: imageCount === 1 ? imageShape : 'rectangle',
      rasterScale,
    })

    context.drawImage(canvas, 0, 0, cell.width, cell.height)
  }, [activeInteractionIndexRef, blendWidth, cell, image, imageCount, imagePositions, imageScales, imageShape, rasterScale, sourceIndex, transientPositions, wheelScales])

  return <Shape id={id} listening={false} sceneFunc={sceneFunc} />
}

function ImageGridLayerComponent({ 
  images, 
  contentWidth, 
  contentHeight, 
  gap,
  borderWidth = 0,
  isSoftBlend = false,
  blendWidth = 50,
  layoutPreset,
  layoutImageCount,
  imageShape = 'rectangle',
  renderScale = 1,
  onImageSlotSelect,
}: {
  images: LoadedCanvasImage[],
  contentWidth: number, 
  contentHeight: number, 
  gap: number,
  borderWidth?: number,
  isSoftBlend?: boolean,
  blendWidth?: number,
  layoutPreset?: string
  layoutImageCount: number
  imageShape?: ImageShape
  renderScale?: number
  onImageSlotSelect?: (index: number) => void
}) {
  const { imagePositions, imageScales, isImageLocked, setImagePosition, setImageScale, setSelectedImageIndex } = useStore(useShallow(state => ({
    imagePositions: state.imagePositions,
    imageScales: state.imageScales,
    isImageLocked: state.isImageLocked,
    setImagePosition: state.setImagePosition,
    setImageScale: state.setImageScale,
    setSelectedImageIndex: state.setSelectedImageIndex,
  })))

  const isShiftPressed = React.useRef(false)
  const dragContexts = React.useRef<{ [key: number]: DragContext }>({})
  const transientPositions = React.useRef(new Map<number, ImagePosition>())
  const transientPositionMap = transientPositions.current
  const wheelScales = React.useRef(new Map<number, number>())
  const wheelCommitFrames = React.useRef(new Map<number, number>())
  const activeInteractionIndexRef = React.useRef<number | null>(null)
  const activeInteractionTimeoutRef = React.useRef<number | null>(null)
  const [activeInteractionIndex, setActiveInteractionIndex] = React.useState<number | null>(null)
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Shift') isShiftPressed.current = true }
    const up = (e: KeyboardEvent) => { if (e.key === 'Shift') isShiftPressed.current = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  React.useEffect(() => {
    const commitFrames = wheelCommitFrames.current
    const pendingScales = wheelScales.current
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      activeInteractionIndexRef.current = null
      transientPositionMap.clear()
      dragContexts.current = {}
      if (activeInteractionTimeoutRef.current !== null) {
        window.clearTimeout(activeInteractionTimeoutRef.current)
        activeInteractionTimeoutRef.current = null
      }
      commitFrames.forEach((frame) => window.cancelAnimationFrame(frame))
      commitFrames.clear()
      pendingScales.clear()
    }
  }, [transientPositionMap])

  React.useEffect(() => {
    wheelScales.current.forEach((scale, index) => {
      const committedScale = imageScales[index] || 1
      if (Math.abs(committedScale - scale) < 0.0001) wheelScales.current.delete(index)
    })
  }, [imageScales])

  React.useEffect(() => {
    transientPositions.current.forEach((position, index) => {
      const committedPosition = imagePositions[index]
      if (
        committedPosition
        && Math.abs(committedPosition.x - position.x) < 0.0001
        && Math.abs(committedPosition.y - position.y) < 0.0001
      ) {
        transientPositions.current.delete(index)
      }
    })
  }, [imagePositions])

  if (images.length === 0) return null

  const resolvedLayoutImageCount = Math.max(images.length, layoutImageCount)
  const geometry = getLayoutGeometry(layoutPreset, resolvedLayoutImageCount)

  const activeImage = activeInteractionIndex === null
    ? null
    : images.find(({ sourceIndex }) => sourceIndex === activeInteractionIndex) ?? null
  const activeImageCell = activeImage
    ? getImageCellGeometry({
        contentWidth,
        contentHeight,
        gap,
        geometry,
        imageCount: resolvedLayoutImageCount,
        index: activeImage.sourceIndex,
      })
    : null

  const renderImageGroup = ({ image: img, sourceIndex }: LoadedCanvasImage) => {
        const cell = getImageCellGeometry({
          contentWidth,
          contentHeight,
          gap,
          geometry,
          imageCount: resolvedLayoutImageCount,
          index: sourceIndex,
        })
        const { x: xPos, y: yPos, width: itemWidth, height: itemHeight } = cell

        const baseScale = Math.max(itemWidth / img.width, itemHeight / img.height)
        const userScale = wheelScales.current.get(sourceIndex) ?? imageScales[sourceIndex] ?? 1
        const scale = baseScale * userScale
        const hasShapeMask = images.length === 1 && imageShape !== 'rectangle'
        
        // Use saved position or default to 0,0
        const savedPos = imagePositions[sourceIndex] || { x: 0, y: 0 }
        
        return (
          <Group
            key={sourceIndex}
            x={borderWidth + xPos}
            y={borderWidth + yPos}
          >
              <Group
                {...(hasShapeMask
                  ? {
                      clipFunc: (context) => {
                        clipImageShape(context, imageShape, itemWidth, itemHeight)
                      },
                    }
                  : {
                      clipX: 0,
                      clipY: 0,
                      clipWidth: itemWidth,
                      clipHeight: itemHeight,
                    })}
              >
              <KonvaImage
                image={img}
                draggable={!isImageLocked}
                scaleX={scale}
                scaleY={scale}
                x={savedPos.x}
                y={savedPos.y}
                onDragStart={(e) => {
                  const parent = e.target.parent;
                  let inverseTransform = undefined;
                  let absoluteTransform = undefined;
                  if (parent) {
                    absoluteTransform = parent.getAbsoluteTransform().copy();
                    inverseTransform = absoluteTransform.copy().invert();
                  }
                  dragContexts.current[sourceIndex] = {
                    startX: e.target.x(), 
                    startY: e.target.y(), 
                    axis: null,
                    inverseTransform,
                    absoluteTransform
                  }
                }}
                onDragEnd={(e) => {
                  setImagePosition(sourceIndex, { x: e.target.x(), y: e.target.y() })
                  delete dragContexts.current[sourceIndex]
                }}
                onWheel={(e) => {
                  e.evt.preventDefault()
                  const scaleBy = 1.05
                  const oldScale = wheelScales.current.get(sourceIndex) ?? imageScales[sourceIndex] ?? 1
                  const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
                  const nextScale = Math.max(0.5, Math.min(3, newScale))
                  wheelScales.current.set(sourceIndex, nextScale)

                  // Keep the pointer interaction on Konva's fast path. The
                  // store (and its persisted settings) only needs one commit
                  // per animation frame, not one commit per wheel event.
                  e.target.scaleX(baseScale * nextScale)
                  e.target.scaleY(baseScale * nextScale)
                  e.target.getLayer()?.batchDraw()

                  if (!wheelCommitFrames.current.has(sourceIndex)) {
                    const frame = window.requestAnimationFrame(() => {
                      wheelCommitFrames.current.delete(sourceIndex)
                      const committedScale = wheelScales.current.get(sourceIndex)
                      if (committedScale === undefined || !mountedRef.current) return
                      setImageScale(sourceIndex, committedScale)
                    })
                    wheelCommitFrames.current.set(sourceIndex, frame)
                  }
                }}
                onClick={() => setSelectedImageIndex(sourceIndex)}
                onTap={() => setSelectedImageIndex(sourceIndex)}
                onDblClick={() => onImageSlotSelect?.(sourceIndex)}
                onDblTap={() => onImageSlotSelect?.(sourceIndex)}
                dragBoundFunc={function(this: Konva.Node, pos) {
                  const ctx = dragContexts.current[sourceIndex];
                  if (!ctx || !ctx.inverseTransform || !ctx.absoluteTransform) return pos;
                  
                  const relativePos = ctx.inverseTransform.point(pos);
                  
                  const scaledWidth = img.width * scale;
                  const scaledHeight = img.height * scale;
                  
                  const minX = -scaledWidth + 100;
                  const maxX = itemWidth - 100;
                  const minY = -scaledHeight + 100;
                  const maxY = itemHeight - 100;
                  
                  let newX = Math.max(minX, Math.min(maxX, relativePos.x));
                  let newY = Math.max(minY, Math.min(maxY, relativePos.y));
                  
                  if (isShiftPressed.current) {
                    const ctx = dragContexts.current[sourceIndex]
                    if (ctx) {
                      if (!ctx.axis) {
                        const dx = Math.abs(newX - ctx.startX)
                        const dy = Math.abs(newY - ctx.startY)
                        if (dx > 5 || dy > 5) {
                          ctx.axis = dx > dy ? 'x' : 'y'
                        }
                      }
                      if (ctx.axis === 'x') {
                        newY = ctx.startY
                      } else if (ctx.axis === 'y') {
                        newX = ctx.startX
                      }
                    }
                  }
                  
                  return ctx.absoluteTransform.point({ x: newX, y: newY });
                }}
              />
            </Group>
          </Group>
        )
  }

  const renderSoftBlendInteraction = ({ image: img, sourceIndex }: LoadedCanvasImage) => {
    const cell = getImageCellGeometry({
      contentWidth,
      contentHeight,
      gap,
      geometry,
      imageCount: resolvedLayoutImageCount,
      index: sourceIndex,
    })
    const { x: xPos, y: yPos, width: itemWidth, height: itemHeight } = cell
    const baseScale = Math.max(itemWidth / img.width, itemHeight / img.height)
    const getScale = () => baseScale * (wheelScales.current.get(sourceIndex) ?? imageScales[sourceIndex] ?? 1)
    const savedPos = transientPositions.current.get(sourceIndex) ?? imagePositions[sourceIndex] ?? { x: 0, y: 0 }
    const hasShapeMask = images.length === 1 && imageShape !== 'rectangle'
    const redrawComposite = (node: Konva.Node) => {
      const visual = node.getStage()?.findOne('#soft-blend-composite')
      visual?.getLayer()?.batchDraw()
    }

    const redrawActiveOverlay = (node: Konva.Node) => {
      const visual = node.getStage()?.findOne('#soft-blend-active-overlay')
      visual?.getLayer()?.batchDraw()
    }

    const beginInteractionPreview = (node: Konva.Node) => {
      activeInteractionIndexRef.current = sourceIndex
      setActiveInteractionIndex(sourceIndex)
      // While an image is being moved, only its masked preview is redrawn;
      // the other soft-blended images keep their existing raster.
      redrawComposite(node)
      node.getLayer()?.batchDraw()
    }

    const endInteractionPreview = (node: Konva.Node) => {
      if (activeInteractionIndexRef.current === sourceIndex) {
        activeInteractionIndexRef.current = null
      }
      setActiveInteractionIndex(null)
      redrawComposite(node)
      node.getLayer()?.batchDraw()
    }

    const scheduleWheelInteractionEnd = (node: Konva.Node) => {
      if (activeInteractionTimeoutRef.current !== null) {
        window.clearTimeout(activeInteractionTimeoutRef.current)
      }
      activeInteractionTimeoutRef.current = window.setTimeout(() => {
        activeInteractionTimeoutRef.current = null
        endInteractionPreview(node)
      }, 160)
    }

    return (
      <Group
        key={sourceIndex}
        x={borderWidth + xPos}
        y={borderWidth + yPos}
        {...(hasShapeMask
          ? {
              clipFunc: (context) => {
                clipImageShape(context, imageShape, itemWidth, itemHeight)
              },
            }
          : {
              clipX: 0,
              clipY: 0,
              clipWidth: itemWidth,
              clipHeight: itemHeight,
            })}
      >
        <Rect
          id={`soft-blend-interaction-${sourceIndex}`}
          x={savedPos.x}
          y={savedPos.y}
          width={img.width * getScale()}
          height={img.height * getScale()}
          fill="#000000"
          opacity={0}
          draggable={!isImageLocked}
          onDragStart={(e) => {
            const parent = e.target.parent
            let inverseTransform = undefined
            let absoluteTransform = undefined
            if (parent) {
              absoluteTransform = parent.getAbsoluteTransform().copy()
              inverseTransform = absoluteTransform.copy().invert()
            }
            transientPositions.current.set(sourceIndex, { x: e.target.x(), y: e.target.y() })
            dragContexts.current[sourceIndex] = {
              startX: e.target.x(),
              startY: e.target.y(),
              axis: null,
              inverseTransform,
              absoluteTransform,
            }
            beginInteractionPreview(e.target)
          }}
          onDragMove={(e) => {
            const position = { x: e.target.x(), y: e.target.y() }
            transientPositions.current.set(sourceIndex, position)
            redrawActiveOverlay(e.target)
            e.target.getLayer()?.batchDraw()
          }}
          onDragEnd={(e) => {
            const position = { x: e.target.x(), y: e.target.y() }
            transientPositions.current.set(sourceIndex, position)
            setImagePosition(sourceIndex, position)
            delete dragContexts.current[sourceIndex]
            endInteractionPreview(e.target)
          }}
          onWheel={(e) => {
            e.evt.preventDefault()
            beginInteractionPreview(e.target)
            const scaleBy = 1.05
            const oldScale = wheelScales.current.get(sourceIndex) ?? imageScales[sourceIndex] ?? 1
            const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
            const nextScale = Math.max(0.5, Math.min(3, newScale))
            wheelScales.current.set(sourceIndex, nextScale)
            e.target.width(img.width * baseScale * nextScale)
            e.target.height(img.height * baseScale * nextScale)
            e.target.getLayer()?.batchDraw()
            redrawActiveOverlay(e.target)
            scheduleWheelInteractionEnd(e.target)

            if (!wheelCommitFrames.current.has(sourceIndex)) {
              const frame = window.requestAnimationFrame(() => {
                wheelCommitFrames.current.delete(sourceIndex)
                const committedScale = wheelScales.current.get(sourceIndex)
                if (committedScale === undefined || !mountedRef.current) return
                setImageScale(sourceIndex, committedScale)
              })
              wheelCommitFrames.current.set(sourceIndex, frame)
            }
          }}
          onClick={() => setSelectedImageIndex(sourceIndex)}
          onTap={() => setSelectedImageIndex(sourceIndex)}
          onDblClick={() => onImageSlotSelect?.(sourceIndex)}
          onDblTap={() => onImageSlotSelect?.(sourceIndex)}
          dragBoundFunc={function(this: Konva.Node, pos) {
            const ctx = dragContexts.current[sourceIndex]
            if (!ctx || !ctx.inverseTransform || !ctx.absoluteTransform) return pos

            const relativePos = ctx.inverseTransform.point(pos)
            const scale = getScale()
            const scaledWidth = img.width * scale
            const scaledHeight = img.height * scale
            const minX = -scaledWidth + 100
            const maxX = itemWidth - 100
            const minY = -scaledHeight + 100
            const maxY = itemHeight - 100
            let newX = Math.max(minX, Math.min(maxX, relativePos.x))
            let newY = Math.max(minY, Math.min(maxY, relativePos.y))

            if (isShiftPressed.current) {
              if (!ctx.axis) {
                const dx = Math.abs(newX - ctx.startX)
                const dy = Math.abs(newY - ctx.startY)
                if (dx > 5 || dy > 5) ctx.axis = dx > dy ? 'x' : 'y'
              }
              if (ctx.axis === 'x') newY = ctx.startY
              else if (ctx.axis === 'y') newX = ctx.startX
            }

            return ctx.absoluteTransform.point({ x: newX, y: newY })
          }}
        />
      </Group>
    )
  }

  return isSoftBlend
    ? (
      <>
        <Layer listening={false}>
          <SoftBlendCompositeVisual
            id="soft-blend-composite"
            images={images}
            contentWidth={contentWidth}
            contentHeight={contentHeight}
            borderWidth={borderWidth}
            gap={gap}
            geometry={geometry}
            imageCount={resolvedLayoutImageCount}
            blendWidth={blendWidth}
            imageShape={imageShape}
            imagePositions={imagePositions}
            imageScales={imageScales}
            transientPositions={transientPositions}
            wheelScales={wheelScales}
            activeInteractionIndexRef={activeInteractionIndexRef}
            rasterScale={renderScale}
          />
        </Layer>
        <Layer>
          {activeImage && activeImageCell && (
            <Group x={borderWidth + activeImageCell.x} y={borderWidth + activeImageCell.y}>
              <SoftBlendActiveVisual
                id="soft-blend-active-overlay"
                entry={activeImage}
                cell={activeImageCell}
                imageCount={images.length}
                imageShape={imageShape}
                blendWidth={blendWidth}
                imagePositions={imagePositions}
                imageScales={imageScales}
                transientPositions={transientPositions}
                wheelScales={wheelScales}
                activeInteractionIndexRef={activeInteractionIndexRef}
                rasterScale={renderScale}
              />
            </Group>
          )}
          {images.map(renderSoftBlendInteraction)}
        </Layer>
      </>
    )
    : <Layer>{images.map(renderImageGroup)}</Layer>
}

export const ImageGridLayer = React.memo(ImageGridLayerComponent)
