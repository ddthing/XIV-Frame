'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, CloudCheck, Images, LayoutTemplate, Type } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ImageUploader } from './ImageUploader'
import { LayoutSettings } from './LayoutSettings'
import { SignatureSettings } from './SignatureSettings'
import { SketchbookTabsList, SketchbookTabsTrigger } from '@/components/ui/SketchbookTabs'
import { Tabs, TabsContent } from '@/components/ui/tabs'

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
  const flow = [
    { value: 'image', label: t('flowSource') },
    { value: 'signature', label: t('flowOverlay') },
    { value: 'layout', label: t('flowComposition') },
  ] as const

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
          <p className="mt-2 max-w-[31rem] text-xs leading-5 text-muted-foreground">{currentTab.description}</p>

          <div className="my-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap" aria-label={t('flowLabel')}>
            {flow.map((item, index) => (
              <div key={item.value} className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${activeTab === item.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span className={`size-1.5 rounded-full border ${activeTab === item.value ? 'border-primary bg-accent' : 'border-muted-foreground/60 bg-transparent'}`} />
                  {item.label}
                </span>
                {index < flow.length - 1 && <ArrowRight className="size-3 text-border" aria-hidden="true" />}
              </div>
            ))}
          </div>

          <div className="-mx-5 border-t border-border px-5 pt-3">
            <SketchbookTabsList className="h-12 rounded-none border-0 bg-transparent p-0">
              {tabs.map(({ value, label, role, icon: Icon }) => (
                <SketchbookTabsTrigger key={value} value={value} className="gap-2 rounded-none px-2 text-left data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="flex min-w-0 flex-col items-start gap-0.5 leading-none">
                    <strong className="text-xs font-semibold">{label}</strong>
                    <small className="font-mono text-[9px] font-medium uppercase tracking-[0.05em] text-muted-foreground">{role}</small>
                  </span>
                </SketchbookTabsTrigger>
              ))}
            </SketchbookTabsList>
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
