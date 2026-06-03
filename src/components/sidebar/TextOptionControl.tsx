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
    <div className="space-y-1.5">
      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground font-medium">{label}</Label>
        <Input 
          value={value} 
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={placeholder}
          className="text-sm h-10 rounded-sm"
          maxLength={30}
        />
      </div>
      <div className="pl-[88px] flex items-center gap-2">
        <button 
          type="button" 
          aria-label={bold ? 'Remove bold' : 'Make text bold'}
          className={`flex items-center justify-center w-9 h-9 rounded-sm border transition-colors ${bold ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:bg-muted/50'}`} 
          onClick={() => onChangeBold(!bold)}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button" 
          aria-label={italic ? 'Remove italic' : 'Make text italic'}
          className={`flex items-center justify-center w-9 h-9 rounded-sm border transition-colors ${italic ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:bg-muted/50'}`} 
          onClick={() => onChangeItalic(!italic)}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 pl-2 flex items-center gap-2 border-l border-border">
          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">{t('letterSpacing')}</span>
          <Slider 
            value={[letterSpacing]} 
            onValueChange={v => onChangeLetterSpacing(Array.isArray(v) ? v[0] : v)} 
            min={-10} max={20} step={1} 
          />
        </div>
      </div>
    </div>
  )
}
