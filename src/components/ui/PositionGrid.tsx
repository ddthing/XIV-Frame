import { useTranslations } from 'next-intl'
import { SignaturePosition } from '@/store/useStore'
import { SignatureTranslationKey } from '@/constants/signature'
import React from 'react'

export function PositionGrid({ value, options, onChange }: {
  value: SignaturePosition,
  options: { value: SignaturePosition; label: SignatureTranslationKey; icon: React.ReactNode }[],
  onChange: (v: SignaturePosition) => void
}) {
  const t = useTranslations('SignatureSettings')
  return (
    <div className="grid grid-cols-3 gap-1 w-full font-sans" role="group" aria-label={t('position')}>
      {options.map(({ value: optVal, label, icon }) => (
        <button
          key={optVal}
          type="button"
          aria-label={t(label)}
          aria-pressed={value === optVal}
          title={t(label)}
          onClick={() => onChange(optVal)}
          className={`flex h-10 items-center justify-center rounded-md border transition-all shadow-subtle focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background
            ${value === optVal
              ? 'border-primary bg-accent text-accent-foreground font-semibold'
              : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
            }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
