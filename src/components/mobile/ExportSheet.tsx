import React from 'react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react'
import { useStore, CanvasRatio } from '@/store/useStore'
import { exportCanvas } from '@/lib/export'
import { Slider } from '@/components/ui/slider'

  import type Konva from 'konva'

  export function ExportSheet({ 
    open, 
    onOpenChange, 
    stageRef 
  }: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void;
    stageRef: React.MutableRefObject<Konva.Stage | null>;
  }) {
  const { canvasRatio, setCanvasRatio, zoom, setZoom, resetAll } = useStore()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-slate-50">
        <DrawerTitle className="sr-only">저장 및 비율 설정</DrawerTitle>
        <div className="p-6 pb-[calc(env(safe-area-inset-bottom,1rem)+1.5rem)] flex flex-col gap-8">
          
          {/* Canvas Ratio */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-slate-800">비율 설정</span>
            <div className="flex bg-slate-200/50 p-1.5 rounded-full">
              {['auto', '16:9', '2:1'].map((ratio) => (
                <button
                  key={ratio}
                  className={`flex-1 py-2.5 text-sm rounded-full transition-colors ${
                    canvasRatio === ratio 
                      ? 'bg-white shadow-sm font-bold text-primary' 
                      : 'text-slate-600 hover:text-slate-900 font-medium'
                  }`}
                  onClick={() => setCanvasRatio(ratio as CanvasRatio)}
                >
                  {ratio.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div className="space-y-3">
            <span className="text-sm font-semibold text-slate-800">화면 배율</span>
            <div className="flex items-center gap-4 bg-white border border-slate-200 p-2 rounded-full">
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full text-slate-600" aria-label="축소" onClick={() => setZoom(Math.max(10, zoom - 10))}>
                <ZoomOut className="w-5 h-5" />
              </Button>
              <div className="flex-1 px-2">
                <Slider 
                  value={[zoom]} 
                  onValueChange={(v) => setZoom(Array.isArray(v) ? v[0] : v)} 
                  min={10} max={200} step={1} 
                />
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full text-slate-600" aria-label="확대" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                <ZoomIn className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                resetAll()
                onOpenChange(false)
              }} 
              className="h-14 flex-1 rounded-3xl border-slate-200 bg-white font-semibold text-slate-700"
            >
              <RefreshCw className="w-5 h-5 mr-2" /> 기본값으로 초기화
            </Button>
            <Button 
              className="h-14 flex-[2] rounded-3xl font-bold text-base shadow-lg shadow-primary/20" 
              onClick={() => {
                exportCanvas(stageRef, 'png')
                onOpenChange(false)
              }}
            >
              <Download className="w-5 h-5 mr-2" /> 사진 저장
            </Button>
          </div>
          
        </div>
      </DrawerContent>
    </Drawer>
  )
}
