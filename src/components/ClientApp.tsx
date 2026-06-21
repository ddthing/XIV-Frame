'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsPanel } from '@/components/sidebar/SettingsPanel'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'
import { DesktopToolbar } from '@/components/canvas/DesktopToolbar'
import { MobileLayout } from '@/components/mobile/MobileLayout'

import type Konva from 'konva'

export function ClientApp({ currentLocale }: { currentLocale: string }) {
  const stageRef = useRef<Konva.Stage | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if the user previously selected a different language
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && savedLocale !== currentLocale) {
      if (savedLocale === 'ko') {
        router.push('/')
      } else {
        router.push(`/${savedLocale}`)
      }
    }
  }, [currentLocale, router])

  return (
    <div className="flex h-full w-full bg-background font-sans text-foreground overflow-hidden flex-col md:flex-row">
      
      {/* Desktop Layout (Hidden on Mobile) */}
      <div className="hidden md:flex w-full h-full pt-24 pb-6 px-6 gap-6 bg-background relative">
        {/* Desktop Main Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative rounded-[12px] border border-border shadow-subtle bg-card/50 backdrop-blur-sm">
          <DesktopToolbar stageRef={stageRef} />
          <PreviewCanvas stageRef={stageRef} />
        </main>

        {/* Floating Sidebar */}
        <aside className="w-[300px] xl:w-[340px] flex-shrink-0 bg-card border border-border rounded-[12px] shadow-subtle h-full z-10 overflow-hidden flex flex-col">
          <SettingsPanel />
        </aside>
      </div>

      {/* Mobile Layout (Hidden on Desktop) */}
      <div className="md:hidden flex w-full h-full">
        <MobileLayout stageRef={stageRef} />
      </div>

    </div>
  )
}
