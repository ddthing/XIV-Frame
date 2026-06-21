'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()

  const handleLanguageChange = (value: string | null) => {
    if (!value) return
    localStorage.setItem('locale', value)
    
    let newPathname = pathname
    // Remove current locale prefix if exists
    if (pathname.startsWith(`/${currentLocale}/`)) {
      newPathname = pathname.replace(`/${currentLocale}/`, '/')
    } else if (pathname === `/${currentLocale}`) {
      newPathname = '/'
    }
    
    // Default locale root goes to '/'
    if (value === 'ko' && newPathname === '/') {
      router.push('/')
    } else {
      router.push(`/${value}${newPathname === '/' ? '' : newPathname}`)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={currentLocale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[110px] h-10 text-sm font-medium rounded-md bg-transparent border border-border shadow-subtle hover:bg-muted/50 transition-colors">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ko" className="text-sm font-medium">한국어</SelectItem>
          <SelectItem value="en" className="text-sm font-medium">English</SelectItem>
          <SelectItem value="ja" className="text-sm font-medium">日本語</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
