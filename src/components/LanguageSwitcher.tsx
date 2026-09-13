'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const t = useTranslations('LanguageSwitcher')
  const currentLocaleLabel = currentLocale === 'ko' ? '한국어' : currentLocale === 'ja' ? '日本語' : 'English'

  const handleLanguageChange = (value: string | null) => {
    if (!value) return
    try {
      localStorage.setItem('locale', value)
    } catch {
      // Language switching should still work when storage is unavailable.
    }
    
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
      <Globe className={cn('size-4', compact && 'hidden sm:block', inverse ? 'text-primary-foreground/60' : 'text-muted-foreground')} />
      <Select value={currentLocale} onValueChange={handleLanguageChange}>
        <SelectTrigger aria-label={t('language')} className={cn(
          'h-9 rounded-md text-xs font-semibold transition-colors',
          compact ? 'w-[88px] sm:w-[104px]' : 'w-[104px]',
          inverse
            ? 'border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10'
            : 'border-border bg-transparent shadow-subtle hover:bg-muted/50'
        )}>
          <SelectValue placeholder={t('language')}>{currentLocaleLabel}</SelectValue>
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
