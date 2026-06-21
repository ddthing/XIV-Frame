import { useTranslations } from 'next-intl'
import { SignaturePosition } from '@/store/useStore'
import React from 'react'

export function PositionGrid({ value, options, onChange }: {
  value: SignaturePosition,
  options: { value: SignaturePosition; label: string; icon: React.ReactNode }[],
  onChange: (v: SignaturePosition) => void
}) {
  const t = useTranslations('SignatureSettings')
  return (
    <div className="grid grid-cols-3 gap-1 w-full font-sans">
      {options.map(({ value: optVal, label, icon }) => (
        <button
          key={optVal}
          type="button"
          aria-label={t(label as any)}
          title={t(label as any)}
          onClick={() => onChange(optVal)}
          className={`flex items-center justify-center h-10 rounded-md border transition-all shadow-subtle
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
