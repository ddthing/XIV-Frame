import { useTranslations } from 'next-intl'
import { SignatureAlign } from '@/store/useStore'
import { ALIGN_OPTIONS } from '@/constants/signature'
import { EditorRadio, editorSegmentedGroupClass, editorSegmentedOptionClass } from '@/components/ui/editor'
import React from 'react'

export function AlignGroup({ value, onChange }: { value: SignatureAlign; onChange: (v: SignatureAlign) => void }) {
  const t = useTranslations('SignatureSettings')
  return (
    <div className={`flex gap-0.5 font-sans ${editorSegmentedGroupClass}`} role="radiogroup" aria-label={t('align')}>
      {ALIGN_OPTIONS.map(({ value: optVal, label, icon }) => (
        <EditorRadio
          key={optVal}
          checked={value === optVal}
          aria-label={t(label)}
          title={t(label)}
          onClick={() => onChange(optVal)}
          className={`${editorSegmentedOptionClass(value === optVal)} flex-1`}
        >
          {icon}
        </EditorRadio>
      ))}
    </div>
  )
}
