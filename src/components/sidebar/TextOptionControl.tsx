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
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <Label className="text-xs text-slate-500 font-medium">{label}</Label>
        <Input 
          value={value} 
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder={placeholder}
          className="text-sm h-10 rounded-full"
          maxLength={30}
        />
      </div>
      <div className="pl-[88px] flex items-center gap-2">
        <button 
          type="button" 
          className={`p-1.5 rounded-full transition-colors ${bold ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} 
          onClick={() => onChangeBold(!bold)}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button 
          type="button" 
          className={`p-1.5 rounded-full transition-colors ${italic ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`} 
          onClick={() => onChangeItalic(!italic)}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 pl-2 flex items-center gap-2 border-l border-slate-200">
          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">자간</span>
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
