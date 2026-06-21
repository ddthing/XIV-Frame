import { useCallback } from 'react'
import { useStore, CanvasRatio } from '@/store/useStore'
import { exportCanvas } from '@/lib/export'
import type Konva from 'konva'

export interface UseCanvasActionsReturn {
  zoom: number;
  canvasRatio: CanvasRatio;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomChange: (value: number | readonly number[]) => void;
  handleRatioChange: (ratio: CanvasRatio) => void;
  handleReset: () => void;
  handleExport: (stageRef: React.MutableRefObject<Konva.Stage | null>, format?: 'png' | 'jpeg') => void;
}

export function useCanvasActions(): UseCanvasActionsReturn {
  const { zoom, setZoom, canvasRatio, setCanvasRatio, resetAll } = useStore()

  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(200, zoom + 10))
  }, [zoom, setZoom])

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(10, zoom - 10))
  }, [zoom, setZoom])

  const handleZoomChange = useCallback((value: number | readonly number[]) => {
    setZoom(Array.isArray(value) ? value[0] : value)
  }, [setZoom])

  const handleRatioChange = useCallback((ratio: CanvasRatio) => {
    setCanvasRatio(ratio)
  }, [setCanvasRatio])

  const handleExport = useCallback((stageRef: React.MutableRefObject<Konva.Stage | null>, format: 'png' | 'jpeg' = 'png') => {
    exportCanvas(stageRef, format)
  }, [])

  return {
    zoom,
    canvasRatio,
    handleZoomIn,
    handleZoomOut,
    handleZoomChange,
    handleRatioChange,
    handleReset: resetAll,
    handleExport
  }
}
