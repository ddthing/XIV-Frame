import { useState } from 'react'
import { Group, Layer, Line, Rect, Text } from 'react-konva'

import { getImageCellGeometry, type ImageCellGeometry } from '@/lib/canvasGeometry'
import type { LayoutCell, LayoutGeometry } from '@/lib/layoutTemplates'
import type { BackgroundColor } from '@/store/useStore'

type CellSide = 'top' | 'right' | 'bottom' | 'left'
type EdgeOrientation = 'horizontal' | 'vertical'

type CellEntry = {
  index: number
  layoutCell: LayoutCell
  geometry: ImageCellGeometry
}

type SharedEdge = {
  first: CellEntry
  second: CellEntry
  orientation: EdgeOrientation
  start: number
  end: number
}

function spanEnd(start: number, span = 1) {
  return start + span
}

function getSharedEdges(entries: CellEntry[]): SharedEdge[] {
  const sharedEdges: SharedEdge[] = []

  for (let firstIndex = 0; firstIndex < entries.length; firstIndex += 1) {
    const first = entries[firstIndex]
    if (!first) continue

    for (let secondIndex = firstIndex + 1; secondIndex < entries.length; secondIndex += 1) {
      const second = entries[secondIndex]
      if (!second) continue

      const firstRight = spanEnd(first.layoutCell.column, first.layoutCell.columnSpan)
      const secondRight = spanEnd(second.layoutCell.column, second.layoutCell.columnSpan)
      const firstBottom = spanEnd(first.layoutCell.row, first.layoutCell.rowSpan)
      const secondBottom = spanEnd(second.layoutCell.row, second.layoutCell.rowSpan)

      if (
        firstRight === second.layoutCell.column
        || secondRight === first.layoutCell.column
      ) {
        const left = first.geometry.x < second.geometry.x ? first : second
        const right = left === first ? second : first
        const start = Math.max(left.geometry.y, right.geometry.y)
        const end = Math.min(left.geometry.y + left.geometry.height, right.geometry.y + right.geometry.height)
        if (end > start) {
          sharedEdges.push({ first: left, second: right, orientation: 'vertical', start, end })
        }
        continue
      }

      if (
        firstBottom === second.layoutCell.row
        || secondBottom === first.layoutCell.row
      ) {
        const top = first.geometry.y < second.geometry.y ? first : second
        const bottom = top === first ? second : first
        const start = Math.max(top.geometry.x, bottom.geometry.x)
        const end = Math.min(top.geometry.x + top.geometry.width, bottom.geometry.x + bottom.geometry.width)
        if (end > start) {
          sharedEdges.push({ first: top, second: bottom, orientation: 'horizontal', start, end })
        }
      }
    }
  }

  return sharedEdges
}

function getNeighbourSides(sharedEdges: SharedEdge[]) {
  const sides = new Map<number, Set<CellSide>>()
  const addSide = (index: number, side: CellSide) => {
    const current = sides.get(index) ?? new Set<CellSide>()
    current.add(side)
    sides.set(index, current)
  }

  sharedEdges.forEach(({ first, second, orientation }) => {
    if (orientation === 'vertical') {
      addSide(first.index, 'right')
      addSide(second.index, 'left')
    } else {
      addSide(first.index, 'bottom')
      addSide(second.index, 'top')
    }
  })

  return sides
}

function getOuterEdgePoints(entry: CellEntry, sides: Set<CellSide> | undefined, borderWidth: number) {
  const { x, y, width, height } = entry.geometry
  const left = borderWidth + x
  const top = borderWidth + y
  const right = left + width
  const bottom = top + height
  const points: number[][] = []

  if (!sides?.has('top')) points.push([left, top, right, top])
  if (!sides?.has('right')) points.push([right, top, right, bottom])
  if (!sides?.has('bottom')) points.push([left, bottom, right, bottom])
  if (!sides?.has('left')) points.push([left, top, left, bottom])

  return points
}

function getReadableFontSize(shortestSide: number, displayScale: number, targetScreenSize: number, maxCellRatio: number) {
  const safeScale = Number.isFinite(displayScale) && displayScale > 0 ? displayScale : 1
  return Math.min(shortestSide * maxCellRatio, Math.max(10, targetScreenSize / safeScale))
}

export function EmptySlotLayer({
  geometry,
  contentWidth,
  contentHeight,
  gap,
  borderWidth = 0,
  occupiedSlotIndices,
  backgroundColor,
  primaryLabel,
  primaryHint,
  onSlotSelect,
  disabled = false,
  loadingSlotIndices = [],
  loadingLabel = 'Preparing photo…',
  loadingHint = '',
  displayScale = 1,
}: {
  geometry: LayoutGeometry
  contentWidth: number
  contentHeight: number
  gap: number
  borderWidth?: number
  occupiedSlotIndices: readonly number[]
  backgroundColor: BackgroundColor
  primaryLabel: string
  primaryHint: string
  onSlotSelect?: (index: number) => void
  disabled?: boolean
  loadingSlotIndices?: readonly number[]
  loadingLabel?: string
  loadingHint?: string
  displayScale?: number
}) {
  const slotCount = Math.max(1, geometry.cells.length)
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null)
  const occupiedSlotSet = new Set(occupiedSlotIndices)
  const loadingSlotSet = new Set(loadingSlotIndices)
  const previewSlotIndices = geometry.cells
    .map((_, index) => index)
    .filter((index) => !occupiedSlotSet.has(index) || loadingSlotSet.has(index))
  if (previewSlotIndices.length === 0) return null

  const cellEntries = geometry.cells.map((layoutCell, index) => ({
    index,
    layoutCell,
    geometry: getImageCellGeometry({
      contentWidth,
      contentHeight,
      gap,
      geometry,
      imageCount: slotCount,
      index,
    }),
  }))
  const previewSlotSet = new Set(previewSlotIndices)
  const sharedEdges = getSharedEdges(cellEntries)
  const neighbourSides = getNeighbourSides(sharedEdges)

  const palette = backgroundColor === 'black'
    ? { fill: '#202621', hoverFill: '#2d3a30', stroke: '#4b5a4f', text: '#c9d5c9' }
    : { fill: '#fafbf9', hoverFill: '#eef5ed', stroke: '#c8d0c9', text: '#59665b' }

  const sharedEdgePoints = sharedEdges
    .filter(({ first, second }) => previewSlotSet.has(first.index) || previewSlotSet.has(second.index))
    .map(({ first, second, orientation, start, end }) => {
      if (orientation === 'vertical') {
        const x = borderWidth + ((first.geometry.x + first.geometry.width + second.geometry.x) / 2)
        return [x, borderWidth + start, x, borderWidth + end]
      }

      const y = borderWidth + ((first.geometry.y + first.geometry.height + second.geometry.y) / 2)
      return [borderWidth + start, y, borderWidth + end, y]
    })

  const outerEdgePoints = cellEntries
    .filter(({ index }) => previewSlotSet.has(index))
    .flatMap((entry) => getOuterEdgePoints(entry, neighbourSides.get(entry.index), borderWidth))
  const edgePoints = [...outerEdgePoints, ...sharedEdgePoints]

  return (
    <Layer>
      {previewSlotIndices.map((slotIndex) => {
        const cell = cellEntries[slotIndex]?.geometry
        if (!cell) return null

        const offset = previewSlotIndices.indexOf(slotIndex)
        const isPrimary = offset === 0
        const isLoading = loadingSlotSet.has(slotIndex)
        const isInteractive = !disabled && !isLoading
        const shortestSide = Math.min(cell.width, cell.height)
        // Konva sizes are in logical canvas units and are reduced by the
        // fit-to-container stage scale. Keep the copy readable on narrow
        // mobile previews as well as on large desktop canvases.
        const numberSize = getReadableFontSize(shortestSide, displayScale, 18, 0.14)
        const labelSize = getReadableFontSize(shortestSide, displayScale, 20, 0.2)
        const hintSize = getReadableFontSize(shortestSide, displayScale, 14, 0.12)
        const label = isLoading ? loadingLabel : isPrimary ? primaryLabel : String(slotIndex + 1).padStart(2, '0')
        const hint = isLoading ? loadingHint : primaryHint
        const showHint = Boolean(hint) && (isLoading || isPrimary)

        return (
          <Group
            key={`empty-slot-${slotIndex}`}
            x={borderWidth + cell.x}
            y={borderWidth + cell.y}
            listening={isInteractive}
            onClick={isInteractive ? () => onSlotSelect?.(slotIndex) : undefined}
            onTap={isInteractive ? () => onSlotSelect?.(slotIndex) : undefined}
            onMouseEnter={isInteractive ? (event) => {
              setHoveredSlotIndex(slotIndex)
              event.target.getStage()?.container().style.setProperty('cursor', 'pointer')
            } : undefined}
            onMouseLeave={isInteractive ? (event) => {
              setHoveredSlotIndex((current) => current === slotIndex ? null : current)
              event.target.getStage()?.container().style.setProperty('cursor', 'default')
            } : undefined}
          >
            <Rect
              width={cell.width}
              height={cell.height}
              fill={hoveredSlotIndex === slotIndex ? palette.hoverFill : palette.fill}
              opacity={disabled ? 0.72 : 1}
              cornerRadius={6}
            />
            {isPrimary && !isLoading && (
              <Text
                x={cell.width * 0.06}
                y={cell.height * 0.06}
                width={cell.width * 0.2}
                text={String(slotIndex + 1).padStart(2, '0')}
                fontFamily="Pretendard, sans-serif"
                fontSize={getReadableFontSize(shortestSide, displayScale, 14, 0.1)}
                fontStyle="bold"
                fill={palette.text}
                opacity={0.68}
                listening={false}
              />
            )}
            <Text
              x={0}
              y={cell.height * (isPrimary ? 0.4 : 0.44)}
              width={cell.width}
              text={label}
              align="center"
              fontFamily="Pretendard, sans-serif"
              fontSize={isPrimary || isLoading ? labelSize : numberSize}
              fontStyle="bold"
              fill={palette.text}
              listening={false}
            />
            {showHint && (
              <Text
                x={0}
                y={cell.height * 0.57}
                width={cell.width}
                text={hint}
                align="center"
                fontFamily="Pretendard, sans-serif"
                fontSize={hintSize}
                fill={palette.text}
                opacity={0.72}
                listening={false}
              />
            )}
          </Group>
        )
      })}
      {edgePoints.map((points, index) => (
          <Line
            key={`empty-edge-${index}`}
            points={points}
            stroke={palette.stroke}
            strokeWidth={1}
            dash={[6, 6]}
          listening={false}
          strokeScaleEnabled={false}
        />
      ))}
    </Layer>
  )
}
