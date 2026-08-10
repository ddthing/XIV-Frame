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
          className={`flex h-10 flex-1 items-center justify-center rounded-md border transition-all shadow-subtle
            ${value === optVal
              ? 'border-primary bg-sticky-note-mint text-primary font-semibold'
              : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
            }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
