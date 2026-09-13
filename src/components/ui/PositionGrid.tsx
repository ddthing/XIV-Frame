import { useTranslations } from 'next-intl'
import { SignaturePosition } from '@/store/useStore'
import { SignatureTranslationKey } from '@/constants/signature'
import { EditorRadio, editorSegmentedGroupClass, editorSegmentedOptionClass } from '@/components/ui/editor'
import React from 'react'

export function PositionGrid({ value, options, onChange }: {
  value: SignaturePosition,
  options: { value: SignaturePosition; label: SignatureTranslationKey; icon: React.ReactNode }[],
  onChange: (v: SignaturePosition) => void
}) {
  const t = useTranslations('SignatureSettings')
  return (
    <div className={`grid w-full grid-cols-3 gap-0.5 font-sans ${editorSegmentedGroupClass}`} role="radiogroup" aria-label={t('position')}>
      {options.map(({ value: optVal, label, icon }) => (
        <EditorRadio
          key={optVal}
          checked={value === optVal}
          aria-label={t(label)}
          title={t(label)}
          onClick={() => onChange(optVal)}
          className={`${editorSegmentedOptionClass(value === optVal)} px-2`}
        >
          {icon}
        </EditorRadio>
      ))}
    </div>
  )
}
