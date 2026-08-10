import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { EditorFieldHeader } from '@/components/ui/editor'
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
}: TextOptionControlProps) {
  const t = useTranslations('SignatureSettings')
  return (
    <div className="editor-control-surface space-y-4 p-4">
      <div className="space-y-1.5">
        <Label className="block text-xs font-semibold text-foreground">{label}</Label>
        <Input 
          value={value} 
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border-border bg-background text-sm transition-colors focus-visible:border-primary focus-visible:ring-primary"
          maxLength={30}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <div className="flex shrink-0 items-center gap-2">
          <button 
            type="button" 
            aria-label={bold ? 'Remove bold' : 'Make text bold'}
            className={`flex size-9 items-center justify-center rounded-md border transition-colors shadow-subtle ${bold ? 'border-primary bg-sticky-note-mint text-primary font-semibold' : 'border-border bg-card text-muted-foreground hover:bg-muted/50'}`}
            onClick={() => onChangeBold(!bold)}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            type="button" 
            aria-label={italic ? 'Remove italic' : 'Make text italic'}
            className={`flex size-9 items-center justify-center rounded-md border transition-colors shadow-subtle ${italic ? 'border-primary bg-sticky-note-mint text-primary font-semibold' : 'border-border bg-card text-muted-foreground hover:bg-muted/50'}`}
            onClick={() => onChangeItalic(!italic)}
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>
        <div className="flex w-full flex-1 flex-col gap-2">
          <EditorFieldHeader label={t('letterSpacing')} value={`${letterSpacing}px`} />
          <Slider 
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
