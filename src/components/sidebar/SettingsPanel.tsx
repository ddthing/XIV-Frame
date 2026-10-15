'use client'

import { ArrowRight, PanelLeftClose } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { EditorTab } from './EditorNavigation'
import { ImageUploader } from './ImageUploader'
import { LazyLayoutSettings, LazySignatureSettings } from './LazySettings'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'

interface SettingsStepDefinition {
  value: EditorTab
  title: string
}

interface SettingsPanelProps {
  activeTab: EditorTab
  onTabChange: (tab: EditorTab) => void
  onToggleCollapse: () => void
}

export function SettingsPanel({ activeTab, onTabChange, onToggleCollapse }: SettingsPanelProps) {
  const t = useTranslations('SettingsPanel')
  const hasImages = useStore(state => state.images.some(Boolean))

  const steps: SettingsStepDefinition[] = [
    {
      value: 'layout',
      title: t('panelLayoutTitle'),
    },
    {
      value: 'image',
      title: t('panelImageTitle'),
    },
    {
      value: 'signature',
      title: t('panelSignatureTitle'),
    },
  ]

  const currentStep = steps.find(step => step.value === activeTab) ?? steps[0]

  return (
    <div id="editor-settings" className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center justify-between px-5">
        <span aria-hidden="true" className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{activeTab === 'layout' ? '01 / COMPOSITION' : activeTab === 'image' ? '02 / PHOTOGRAPHS' : '03 / SIGNATURE'}</span>
        <h2 id={`editor-panel-${activeTab}-heading`} className="sr-only">{currentStep.title}</h2>
        <button
          type="button"
          aria-label={t('collapsePanel')}
          title={t('collapsePanel')}
          onClick={onToggleCollapse}
          className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-inset hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <PanelLeftClose aria-hidden="true" className="size-4" />
        </button>
      </header>

      <section
        id={`editor-panel-${activeTab}`}
        aria-labelledby={`editor-panel-${activeTab}-heading`}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        <div className="min-h-full space-y-6 px-5 pb-6 pt-1">
          {activeTab === 'layout' && (
            <LazyLayoutSettings idPrefix="desktop-layout" showContinue={false} />
          )}

          {activeTab === 'image' && <ImageUploader idPrefix="desktop-image" />}

          {activeTab === 'signature' && <LazySignatureSettings idPrefix="desktop-signature" />}
        </div>
      </section>

      {(activeTab === 'layout' || (activeTab === 'image' && hasImages)) && (
        <footer className="flex shrink-0 border-t border-border bg-card p-4">
          <Button type="button" size="sm" className="h-10 w-full justify-between rounded-md px-3 text-xs" onClick={() => onTabChange(activeTab === 'layout' ? 'image' : 'signature')}>
            {activeTab === 'layout' ? t('tabImage') : t('nextSignature')}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        </footer>
      )}
    </div>
  )
}
