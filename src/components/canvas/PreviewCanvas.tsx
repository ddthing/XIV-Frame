import dynamic from 'next/dynamic'

const KonvaStage = dynamic(() => import('./KonvaStage'), { ssr: false })

import { useStore } from '@/store/useStore'
import { ImagePlus } from 'lucide-react'
import type Konva from 'konva'

export function PreviewCanvas({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const images = useStore(state => state.images)
  const zoom = useStore(state => state.zoom)

  return (
    <div className="flex-1 w-full h-full relative bg-background overflow-hidden flex items-center justify-center">
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
      >
        <KonvaStage stageRef={stageRef} />
      </div>
      
      {images.length === 0 && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center gap-4 text-muted-foreground opacity-60">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ImagePlus className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium tracking-tight">Drop your FFXIV screenshots here</p>
          </div>
        </div>
      )}
    </div>
  )
}
