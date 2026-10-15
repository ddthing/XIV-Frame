'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { EditorNavigation, type EditorTab } from '@/components/sidebar/EditorNavigation'
import { EditorHelpPanel } from '@/components/sidebar/EditorHelpPanel'
import { SettingsPanel } from '@/components/sidebar/SettingsPanel'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'
import { DesktopToolbar } from '@/components/canvas/DesktopToolbar'
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts'
import { EditorLocaleProvider } from './EditorLocaleProvider'
import { useMobileViewport } from '@/hooks/useMobileViewport'

import type Konva from 'konva'

const MobileLayout = dynamic(() => import('./mobile/MobileLayout').then(module => module.MobileLayout))

export function ClientApp({ currentLocale }: { currentLocale: string }) {
  return <EditorLocaleProvider initialLocale={currentLocale}><EditorWorkspace /></EditorLocaleProvider>
}

function EditorWorkspace() {
  const isMobile = useMobileViewport()
  const desktopStageRef = useRef<Konva.Stage | null>(null)
  const mobileStageRef = useRef<Konva.Stage | null>(null)
  const tA11y = useTranslations('Accessibility')
  const [activeTab, setActiveTab] = useState<EditorTab>('layout')
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const toggleFocus = useCallback(() => setIsFocusMode(value => !value), [])
  useEditorShortcuts(toggleFocus)

  useEffect(() => {
    const openEditorTab = (tab: EditorTab) => {
      setActiveTab(tab)
      setIsHelpOpen(false)
      setIsNavigatorCollapsed(false)
      setIsFocusMode(false)
    }
    const openLayout = () => openEditorTab('layout')
    const openImage = () => openEditorTab('image')
    const openSignature = () => openEditorTab('signature')

    window.addEventListener('xiv-frame:open-layout', openLayout)
    window.addEventListener('xiv-frame:open-image', openImage)
    window.addEventListener('xiv-frame:open-signature', openSignature)

    return () => {
      window.removeEventListener('xiv-frame:open-layout', openLayout)
      window.removeEventListener('xiv-frame:open-image', openImage)
      window.removeEventListener('xiv-frame:open-signature', openSignature)
    }
  }, [])

  const handleTabChange = (tab: EditorTab) => {
    setActiveTab(tab)
    setIsHelpOpen(false)
    setIsNavigatorCollapsed(false)
    setIsFocusMode(false)
  }

  const handleHelpChange = () => {
    setIsHelpOpen(true)
    setIsNavigatorCollapsed(false)
    setIsFocusMode(false)
  }

  useEffect(() => {
    if (!isFocusMode) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) setIsFocusMode(false)
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isFocusMode])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-background font-sans text-foreground">
      <div id="editor-main" tabIndex={-1} className="relative flex min-h-0 flex-1 flex-col outline-none">
        <a
          href="#editor-main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-xs focus:font-semibold focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {tA11y('skipToEditor')}
        </a>

        {!isMobile && <div className="hidden min-h-0 flex-1 flex-col md:flex">
          <DesktopToolbar stageRef={desktopStageRef} />
          <div className={`grid min-h-0 flex-1 border-b border-border ${isFocusMode ? 'md:grid-cols-[minmax(0,1fr)]' : isNavigatorCollapsed ? 'md:grid-cols-[64px_minmax(0,1fr)]' : 'md:grid-cols-[64px_304px_minmax(0,1fr)]'} ${isFocusMode ? 'xl:grid-cols-[minmax(0,1fr)]' : isNavigatorCollapsed ? 'xl:grid-cols-[64px_minmax(0,1fr)]' : 'xl:grid-cols-[64px_352px_minmax(0,1fr)]'}`}>
            {!isFocusMode && <EditorNavigation
              activeTab={activeTab}
              isHelpOpen={isHelpOpen}
              isCollapsed={isNavigatorCollapsed}
              onTabChange={handleTabChange}
              onHelpChange={handleHelpChange}
              onToggleCollapse={() => setIsNavigatorCollapsed(collapsed => !collapsed)}
            />}

            {!isFocusMode && !isNavigatorCollapsed && (
              <aside aria-label={tA11y('settingsRegion')} className="z-10 flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-border bg-background">
                {isHelpOpen ? (
                  <EditorHelpPanel onToggleCollapse={() => setIsNavigatorCollapsed(true)} />
                ) : (
                  <SettingsPanel activeTab={activeTab} onTabChange={handleTabChange} onToggleCollapse={() => setIsNavigatorCollapsed(true)} />
                )}
              </aside>
            )}

            <main aria-label={tA11y('previewRegion')} className="relative flex min-h-0 min-w-0 flex-col overflow-hidden bg-background">
              <PreviewCanvas
                stageRef={desktopStageRef}
                isFocusMode={isFocusMode}
                onToggleFocus={toggleFocus}
              />
            </main>
          </div>
        </div>}

        {isMobile && <div className="flex min-h-0 h-full w-full md:hidden">
          <MobileLayout stageRef={mobileStageRef} />
        </div>}
      </div>
    </div>
  )
}
