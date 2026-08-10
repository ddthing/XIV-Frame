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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background font-sans text-foreground">
      <div className="hidden min-h-0 flex-1 flex-col md:flex">
        <DesktopToolbar stageRef={stageRef} />
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] border-b border-border xl:grid-cols-[minmax(0,1fr)_390px]">
          <main className="relative flex min-h-0 flex-col overflow-hidden border-r border-border bg-background">
            <PreviewCanvas stageRef={stageRef} />
          </main>

          <aside className="z-10 flex min-h-0 flex-col overflow-hidden bg-background">
            <SettingsPanel />
          </aside>
        </div>
      </div>

      <div className="flex min-h-0 h-full w-full md:hidden">
        <MobileLayout stageRef={stageRef} />
      </div>
    </div>
  )
}
