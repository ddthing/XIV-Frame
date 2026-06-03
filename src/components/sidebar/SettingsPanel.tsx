'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ImageUploader } from './ImageUploader'
import Link from 'next/link'
import { SignatureSettings } from './SignatureSettings'
import { LayoutSettings } from './LayoutSettings'
import { useTranslations } from 'next-intl'

function CollapsibleCard({ 
  step, title, isOpen, onToggle, children 
}: { 
  step: number; title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode 
}) {
  return (
    <div className={`bg-white rounded-3xl border ${isOpen ? 'border-primary/30 shadow-md ring-2 ring-primary/10' : 'border-slate-200 shadow-sm'} transition-all overflow-hidden flex flex-col`}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors outline-none focus-visible:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
            {step}
          </div>
          <h2 className={`text-sm font-bold transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>{title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="flex items-center gap-2.5 h-[60px] px-6 shrink-0 border-b border-slate-200 bg-white">
        <img src="/logo.png" alt="XIV Frame Logo" className="w-6 h-6 rounded-md object-cover" />
        <h1 className="text-base font-bold text-slate-800 tracking-tight">XIV Frame</h1>
      </div>
      <div className="p-4 overflow-y-auto custom-scrollbar flex-1 pb-24 space-y-4">
        
        <CollapsibleCard 
          step={1} 
          title={t('tabImage')} 
          isOpen={activeSection === 'image'} 
          onToggle={() => setActiveSection(activeSection === 'image' ? 'image' : 'image')}
        >
          <ImageUploader />
        </CollapsibleCard>

        <CollapsibleCard 
          step={2} 
          title={t('tabSignature')} 
          isOpen={activeSection === 'signature'} 
          onToggle={() => setActiveSection(activeSection === 'signature' ? 'signature' : 'signature')}
        >
          <SignatureSettings />
        </CollapsibleCard>

        <CollapsibleCard 
          step={3} 
          title="레이아웃 설정" 
          isOpen={activeSection === 'layout'} 
          onToggle={() => setActiveSection(activeSection === 'layout' ? 'image' : 'layout')}
        >
          <LayoutSettings />
        </CollapsibleCard>

        <div className="pt-4 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="hover:text-slate-600 transition-colors">개인정보처리방침</Link>
            <Link href="/legal/terms" className="hover:text-slate-600 transition-colors">이용약관</Link>
            <a href="https://ko-fi.com/reconeur" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 font-medium transition-colors">
              ☕ 후원하기
            </a>
          </div>
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} XIV Frame.
            <span className="mx-1 text-slate-300">|</span>
            by <a href="https://x.com/reconeur" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">@reconeur</a>
          </p>
        </div>

      </div>
    </div>
  )
}
