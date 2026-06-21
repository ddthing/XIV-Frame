import { useTranslations } from 'next-intl'
import { SignatureAlign } from '@/store/useStore'
import { ALIGN_OPTIONS } from '@/constants/signature'
import React from 'react'

export function AlignGroup({ value, onChange }: { value: SignatureAlign; onChange: (v: SignatureAlign) => void }) {
  const t = useTranslations('SignatureSettings')
  return (
    <div className="flex gap-1 font-sans">
      {ALIGN_OPTIONS.map(({ value: optVal, label, icon }) => (
        <button
          key={optVal}
          type="button"
          aria-label={t(label as any)}
          title={t(label as any)}
          onClick={() => onChange(optVal)}
          className={`flex-1 flex items-center justify-center h-10 rounded-md border transition-all shadow-subtle
            ${value === optVal
              ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold'
              : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
            }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
