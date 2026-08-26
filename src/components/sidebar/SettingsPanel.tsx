'use client'

import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CloudCheck, CloudOff, Images, LayoutTemplate, Type } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ImageUploader } from './ImageUploader'
import { InspectorWorkflowTabs } from './InspectorWorkflowTabs'
import { LazyLayoutSettings, LazySignatureSettings } from './LazySettings'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { getStorageStatus, type StorageStatus } from '@/store/useStore'

type SettingsTab = 'image' | 'signature' | 'layout'

interface SettingsTabDefinition {
  value: SettingsTab
  label: string
  role: string
  title: string
  description: string
  icon: LucideIcon
}

export function SettingsPanel() {
  const t = useTranslations('SettingsPanel')
  const [activeTab, setActiveTab] = useState<SettingsTab>('image')
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(() => getStorageStatus())

  useEffect(() => {
    const handleStorageStatus = () => setStorageStatus(getStorageStatus())
    window.addEventListener('xiv-frame-storage-status', handleStorageStatus)
    return () => window.removeEventListener('xiv-frame-storage-status', handleStorageStatus)
  }, [])

  const tabs: SettingsTabDefinition[] = [
    {
      value: 'image',
      label: t('tabImage'),
      role: t('tabImageRole'),
      title: t('panelImageTitle'),
      description: t('panelImageDescription'),
      icon: Images,
    },
    {
      value: 'layout',
      label: t('tabLayout'),
      role: t('tabLayoutRole'),
      title: t('panelLayoutTitle'),
      description: t('panelLayoutDescription'),
      icon: LayoutTemplate,
    },
    {
      value: 'signature',
      label: t('tabSignature'),
      role: t('tabSignatureRole'),
      title: t('panelSignatureTitle'),
      description: t('panelSignatureDescription'),
      icon: Type,
    },
  ]

  const currentTab = tabs.find(tab => tab.value === activeTab) ?? tabs[0]

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SettingsTab)}
        className="flex h-full min-h-0 flex-col"
      >
        <header className="shrink-0 border-b border-border bg-background px-5 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="editor-meta">{t('inspectorEyebrow')}</p>
              <h2 className="mt-2 truncate font-display text-xl font-bold tracking-[0.01em] text-foreground">{currentTab.title}</h2>
            </div>
            <span className="mt-1 shrink-0 rounded-full border border-border bg-surface-inset/70 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {currentTab.role}
            </span>
          </div>
          <p className="mt-2 max-w-[31rem] font-body text-[13px] leading-5 text-muted-foreground">{currentTab.description}</p>

          <div className="-mx-5 mt-4 overflow-hidden border-t border-border px-4 py-3">
            <InspectorWorkflowTabs ariaLabel={t('flowLabel')} tabs={tabs} />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="min-h-full space-y-6 p-5 pb-14">
            <TabsContent value="image" className="mt-0 focus-visible:outline-none">
              <ImageUploader />
            </TabsContent>

            <TabsContent value="layout" className="mt-0 focus-visible:outline-none">
              <LazyLayoutSettings />
            </TabsContent>

            <TabsContent value="signature" className="mt-0 focus-visible:outline-none">
              <LazySignatureSettings />
            </TabsContent>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 py-3 text-[10px] text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-2 font-mono uppercase tracking-[0.08em]">
            {storageStatus === 'saved' ? <CloudCheck className="size-3.5 shrink-0 text-primary" /> : <CloudOff className="size-3.5 shrink-0 text-muted-foreground" />}
            <span className="truncate">
              {storageStatus === 'saved' && t('savedLocally')}
              {storageStatus === 'partial' && t('savedLocallyPartial')}
              {storageStatus === 'session' && t('savedLocallySession')}
            </span>
          </span>
          <span className="shrink-0 text-right">
            {storageStatus === 'saved' && t('settingsPersisted')}
            {storageStatus === 'partial' && t('settingsPersistedPartial')}
            {storageStatus === 'session' && t('settingsSessionOnly')}
          </span>
        </footer>
      </Tabs>
    </div>
  )
}
