'use client'

import { useRef } from 'react'
import { SettingsPanel } from '@/components/sidebar/SettingsPanel'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'
import { DesktopToolbar } from '@/components/canvas/DesktopToolbar'
import { MobileLayout } from '@/components/mobile/MobileLayout'

import type Konva from 'konva'

export default function Home() {
  const stageRef = useRef<Konva.Stage | null>(null)

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 font-sans text-slate-900 overflow-hidden flex-col md:flex-row">
      
      {/* Desktop Layout (Hidden on Mobile) */}
      <div className="hidden md:flex w-full h-full">
        {/* Desktop Sidebar */}
        <aside className="w-[280px] xl:w-[360px] flex-shrink-0 bg-white border-r border-slate-200 h-full z-10">
          <SettingsPanel />
        </aside>

        {/* Desktop Main Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <DesktopToolbar stageRef={stageRef} />
          <PreviewCanvas stageRef={stageRef} />
        </main>
      </div>

      {/* Mobile Layout (Hidden on Desktop) */}
      <div className="md:hidden flex w-full h-full">
        <MobileLayout stageRef={stageRef} />
      </div>

    </div>
  )
}
