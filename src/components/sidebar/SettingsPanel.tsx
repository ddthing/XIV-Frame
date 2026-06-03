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

function CollapsibleCard({ 
  title, isOpen, onToggle, children 
}: { 
  title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode 
}) {
  return (
    <div className={`bg-card rounded-3xl border ${isOpen ? 'border-primary/30 shadow-md ring-2 ring-primary/10' : 'border-border shadow-sm'} transition-all overflow-hidden flex flex-col`}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-background transition-colors outline-none focus-visible:bg-background"
      >
        <div className="flex items-center gap-3">
          <h2 className={`text-sm font-semibold transition-colors ${isOpen ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState<'image' | 'signature' | 'layout'>('image')
  const t = useTranslations('SettingsPanel')
  const locale = useLocale()

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-hidden">
      {/* Notion-style App Header (Inside Sidebar) */}
      <div className="flex items-center h-14 px-6 border-b border-border shrink-0">
        <Link href={`/${locale}`} className="flex items-center">
          <Logo size="sm" />
        </Link>
      </div>

      <div className="p-4 overflow-y-auto custom-scrollbar flex-1 pb-24 space-y-4">
        
        <CollapsibleCard 
          title={t('tabImage')} 
          isOpen={activeSection === 'image'} 
          onToggle={() => setActiveSection(activeSection === 'image' ? 'image' : 'image')}
        >
          <ImageUploader />
        </CollapsibleCard>

        <CollapsibleCard 
          title={t('tabSignature')} 
          isOpen={activeSection === 'signature'} 
          onToggle={() => setActiveSection(activeSection === 'signature' ? 'signature' : 'signature')}
        >
          <SignatureSettings />
        </CollapsibleCard>

        <CollapsibleCard 
          title={t('title')}
          isOpen={activeSection === 'layout'} 
          onToggle={() => setActiveSection(activeSection === 'layout' ? 'image' : 'layout')}
        >
          <LayoutSettings />
        </CollapsibleCard>

      </div>
    </div>
  )
}
