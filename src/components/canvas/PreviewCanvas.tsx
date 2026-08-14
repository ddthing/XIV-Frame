import dynamic from 'next/dynamic'

import { ImagePlus } from 'lucide-react'

import { CanvasToolbar } from './CanvasToolbar'
import { useStore } from '@/store/useStore'

const KonvaStage = dynamic(() => import('./KonvaStage'), { ssr: false })

import type Konva from 'konva'

export function PreviewCanvas({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  const images = useStore(state => state.images)
  const zoom = useStore(state => state.zoom)

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      <CanvasToolbar className="hidden md:flex" />

      <div className="app-backdrop relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div
          className="flex size-full items-center justify-center transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
        >
          <KonvaStage stageRef={stageRef} />
        </div>

        {images.length === 0 && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/88 px-6 backdrop-blur-[2px]">
            <div className="flex max-w-sm flex-col items-center rounded-2xl border border-dashed border-primary/25 bg-card/90 px-8 py-10 text-center shadow-subtle">
              <div className="grid size-14 place-items-center rounded-xl bg-accent text-accent-foreground">
                <ImagePlus className="size-6" />
              </div>
              <p className="mt-5 font-display text-lg font-bold tracking-[0.01em] text-foreground">Drop your FFXIV screenshots here</p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">Start with up to four frames. You can reorder and refine each one from Image.</p>
              <span className="mt-5 editor-meta">PNG / JPG · MAX 50 MB · AUTO OPTIMIZED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
