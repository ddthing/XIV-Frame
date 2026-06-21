import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
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
    <div className="space-y-3 p-4 bg-background border border-border rounded-xl shadow-subtle">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground block">{label}</Label>
        <Input 
          value={value} 
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={placeholder}
          className="text-sm h-10 rounded-md bg-card border-border focus-visible:ring-primary focus-visible:border-primary transition-colors w-full"
          maxLength={30}
        />
      </div>
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <button 
            type="button" 
            aria-label={bold ? 'Remove bold' : 'Make text bold'}
            className={`flex items-center justify-center w-10 h-10 rounded-md border transition-colors shadow-subtle ${bold ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold' : 'bg-card text-muted-foreground border-border hover:bg-muted/50'}`} 
            onClick={() => onChangeBold(!bold)}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button 
            type="button" 
            aria-label={italic ? 'Remove italic' : 'Make text italic'}
            className={`flex items-center justify-center w-10 h-10 rounded-md border transition-colors shadow-subtle ${italic ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold' : 'bg-card text-muted-foreground border-border hover:bg-muted/50'}`} 
            onClick={() => onChangeItalic(!italic)}
          >
            <Italic className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium whitespace-nowrap shrink-0">{t('letterSpacing')}</span>
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
