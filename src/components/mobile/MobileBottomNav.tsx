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
    <nav className="flex items-center justify-around w-full h-[60px] px-2 bg-white">
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = activeSheet === id
        return (
          <button
            key={id}
            onClick={() => onSelect(isActive ? null : id)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-slate-500'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
            <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
