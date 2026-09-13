import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { EditorFieldHeader } from '@/components/ui/editor'
import { editorSegmentedGroupClass, editorSegmentedOptionClass } from '@/components/ui/editor'
import { Bold, Italic } from 'lucide-react'

interface TextOptionControlProps {
  label: string
  placeholder?: string
  value: string
  onChangeValue: (val: string) => void
  bold: boolean
  onChangeBold: (val: boolean) => void
  italic: boolean
  onChangeItalic: (val: boolean) => void
  letterSpacing: number
  onChangeLetterSpacing: (val: number) => void
  idPrefix?: string
}

import { useTranslations } from 'next-intl'

export function TextOptionControl({
  label,
  placeholder,
  value,
  onChangeValue,
  bold,
  onChangeBold,
  italic,
  onChangeItalic,
  letterSpacing,
  onChangeLetterSpacing,
  idPrefix = 'signature-text',
}: TextOptionControlProps) {
  const t = useTranslations('SignatureSettings')
  const inputId = `${idPrefix}-input`
  const spacingId = `${idPrefix}-letter-spacing`

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={inputId} className="block text-xs font-semibold text-foreground">{label}</Label>
        <Input 
          id={inputId}
          value={value} 
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border-border bg-background text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary"
          maxLength={30}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <div className={`flex shrink-0 items-center gap-0.5 ${editorSegmentedGroupClass}`}>
          <button 
            type="button" 
            aria-label={bold ? t('removeBold') : t('makeBold')}
            aria-pressed={bold}
            className={`${editorSegmentedOptionClass(bold)} size-10 px-0`}
            onClick={() => onChangeBold(!bold)}
          >
            <Bold className="size-4" aria-hidden="true" />
          </button>
          <button 
            type="button" 
            aria-label={italic ? t('removeItalic') : t('makeItalic')}
            aria-pressed={italic}
            className={`${editorSegmentedOptionClass(italic)} size-10 px-0`}
            onClick={() => onChangeItalic(!italic)}
          >
            <Italic className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex w-full flex-1 flex-col gap-2">
          <EditorFieldHeader label={t('letterSpacing')} value={`${letterSpacing}px`} htmlFor={spacingId} />
          <Slider 
            id={spacingId}
            aria-label={t('letterSpacing')}
            value={[letterSpacing]} 
            onValueChange={v => onChangeLetterSpacing(Array.isArray(v) ? v[0] : v)} 
            min={-10} max={20} step={1}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}
