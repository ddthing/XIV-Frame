import dynamic from 'next/dynamic'

const KonvaStage = dynamic(() => import('./KonvaStage'), { ssr: false })

import type Konva from 'konva'

export function PreviewCanvas({ stageRef }: { stageRef: React.MutableRefObject<Konva.Stage | null> }) {
  return (
    <div className="flex-1 w-full h-full overflow-hidden relative bg-slate-50">
      <KonvaStage stageRef={stageRef} />
    </div>
  )
}
