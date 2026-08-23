import React from 'react'
import { BottomSheetType } from './MobileLayout'
import { Image as ImageIcon, Type, LayoutTemplate, Download } from 'lucide-react'

interface MobileBottomNavProps {
  activeSheet: BottomSheetType
  onSelect: (sheet: BottomSheetType) => void
}

import { useTranslations } from 'next-intl'

export function MobileBottomNav({ activeSheet, onSelect }: MobileBottomNavProps) {
  const t = useTranslations('MobileLayout')
  const items = [
    { id: 'image', label: t('navImage'), icon: ImageIcon },
    { id: 'signature', label: t('navSignature'), icon: Type },
    { id: 'layout', label: t('navLayout'), icon: LayoutTemplate },
    { id: 'export', label: t('navExport'), icon: Download },
  ] as const

  return (
    <nav className="grid h-[64px] w-full grid-cols-4 gap-1 bg-background px-2 py-1.5" aria-label={t('navLabel')}>
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = activeSheet === id
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? null : id)}
            className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-md text-[10px] transition-all focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background ${
              isActive ? 'bg-accent text-accent-foreground shadow-subtle' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }`}
          >
            <Icon className={`size-4 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
            <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
