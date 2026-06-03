'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const router = useRouter()
  const currentLocale = useLocale()

  const handleLanguageChange = (value: string | null) => {
    if (!value) return
    localStorage.setItem('locale', value)
    if (value === 'ko') {
      router.push('/')
    } else {
      router.push(`/${value}`)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-slate-500" />
      <Select value={currentLocale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[110px] h-8 text-xs font-medium rounded-full bg-slate-100 border-none shadow-none">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ko" className="text-xs font-medium">한국어</SelectItem>
          <SelectItem value="en" className="text-xs font-medium">English</SelectItem>
          <SelectItem value="ja" className="text-xs font-medium">日本語</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
