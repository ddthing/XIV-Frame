'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ImageUploader } from './ImageUploader'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/Logo'
import { SignatureSettings } from './SignatureSettings'
import { LayoutSettings } from './LayoutSettings'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { SketchbookTabsList, SketchbookTabsTrigger } from '@/components/ui/SketchbookTabs'


export function SettingsPanel() {
  const t = useTranslations('SettingsPanel')
  const locale = useLocale()

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="image" className="w-full h-full flex flex-col">
          <div className="shrink-0 h-14 flex items-center border-b border-border bg-card px-4">
            <SketchbookTabsList>
              <SketchbookTabsTrigger value="image">{t('tabImage')}</SketchbookTabsTrigger>
              <SketchbookTabsTrigger value="signature">{t('tabSignature')}</SketchbookTabsTrigger>
              <SketchbookTabsTrigger value="layout">{t('title')}</SketchbookTabsTrigger>
            </SketchbookTabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="p-5 pb-10 space-y-6 min-h-max">
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
        </Tabs>
      </div>
    </div>
  )
}
