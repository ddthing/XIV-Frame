'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CloudCheck, Images, LayoutTemplate, Type } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ImageUploader } from './ImageUploader'
import { LayoutSettings } from './LayoutSettings'
import { SignatureSettings } from './SignatureSettings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
      value: 'signature',
      label: t('tabSignature'),
      role: t('tabSignatureRole'),
      title: t('panelSignatureTitle'),
      description: t('panelSignatureDescription'),
      icon: Type,
    },
    {
      value: 'layout',
      label: t('tabLayout'),
      role: t('tabLayoutRole'),
      title: t('panelLayoutTitle'),
      description: t('panelLayoutDescription'),
      icon: LayoutTemplate,
    },
  ]

  const currentTab = tabs.find(tab => tab.value === activeTab) ?? tabs[0]

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <Tabs
        value={activeTab}
        onValueChange={(value) => value && setActiveTab(value as SettingsTab)}
        className="flex h-full min-h-0 flex-col"
      >
        <header className="shrink-0 border-b border-border bg-background px-5 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="editor-meta">{t('inspectorEyebrow')}</p>
              <h2 className="mt-2 truncate font-display text-2xl font-bold tracking-[0.01em] text-foreground">{currentTab.title}</h2>
            </div>
            <span className="mt-1 shrink-0 rounded-full border border-border bg-surface-inset/70 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {currentTab.role}
            </span>
          </div>
          <p className="mt-2 max-w-[31rem] font-body text-[13px] leading-5 text-muted-foreground">{currentTab.description}</p>

          <div className="-mx-5 mt-4 min-h-[72px] overflow-hidden border-t border-border px-5">
            <TabsList aria-label={t('flowLabel')} className="flex h-auto min-h-[72px] w-full min-w-0 items-stretch justify-start gap-1 rounded-none border-0 bg-transparent p-0">
              {tabs.map(({ value, label, role, icon: Icon }, index) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="group relative min-h-[71px] min-w-0 flex-1 items-start justify-start gap-1.5 rounded-none border-b-2 border-transparent px-1.5 py-3 text-left text-muted-foreground shadow-none transition-colors hover:bg-surface-inset/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-active:border-primary data-active:bg-transparent data-active:text-foreground data-active:shadow-none"
                >
                  <span className="mt-0.5 font-mono text-[10px] font-semibold tabular-nums text-muted-foreground/80">{String(index + 1).padStart(2, '0')}</span>
                  <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="flex min-w-0 flex-col items-start gap-0.5 leading-none">
                    <strong className="text-[13px] font-semibold leading-4">{label}</strong>
                    <small className="font-mono text-[10px] font-medium uppercase tracking-[0.05em] text-muted-foreground">{role}</small>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="min-h-full space-y-6 p-5 pb-10">
            <TabsContent value="image" className="mt-0 focus-visible:outline-none">
              <ImageUploader />
            </TabsContent>

            <TabsContent value="signature" className="mt-0 focus-visible:outline-none">
              <SignatureSettings />
            </TabsContent>

            <TabsContent value="layout" className="mt-0 focus-visible:outline-none">
              <LayoutSettings />
            </TabsContent>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-2 font-mono uppercase tracking-[0.08em]"><CloudCheck className="size-3.5 text-primary" />{t('savedLocally')}</span>
          <span>{t('settingsPersisted')}</span>
        </footer>
      </Tabs>
    </div>
  )
}
