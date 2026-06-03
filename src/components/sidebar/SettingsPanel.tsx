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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'


export function SettingsPanel() {
  const t = useTranslations('SettingsPanel')
  const locale = useLocale()

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Notion-style App Header (Inside Sidebar) */}
      <div className="flex items-center h-14 px-6 border-b border-border shrink-0">
        <Link href={`/${locale}`} className="flex items-center">
          <Logo size="sm" />
        </Link>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="image" className="w-full h-full flex flex-col">
          <div className="shrink-0 border-b border-border bg-transparent">
            <TabsList variant="line" className="flex w-full h-12 p-0 rounded-none gap-0">
              <TabsTrigger value="image" className="flex-1 text-[13px] h-full rounded-none">{t('tabImage')}</TabsTrigger>
              <TabsTrigger value="signature" className="flex-1 text-[13px] h-full rounded-none">{t('tabSignature')}</TabsTrigger>
              <TabsTrigger value="layout" className="flex-1 text-[13px] h-full rounded-none">{t('title')}</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 pb-4">
            <TabsContent value="image" className="mt-0">
              <ImageUploader />
            </TabsContent>

            <TabsContent value="signature" className="mt-0">
              <SignatureSettings />
            </TabsContent>

            <TabsContent value="layout" className="mt-0">
              <LayoutSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
