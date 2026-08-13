import React from 'react'
import Link from 'next/link'
import { Container } from './Container'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Logo'

export function SiteFooter({ locale }: { locale: string }) {
  const t = useTranslations('Navigation')
  return (
    <footer className="border-t border-primary-foreground/15 bg-primary text-primary-foreground">
      <Container size="lg" className="flex flex-col gap-8 py-8 text-sm font-medium md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo size="sm" inverse />
          <p className="text-xs text-primary-foreground/55">
          © {new Date().getFullYear()} XIV Frame.
          <span className="mx-1">/</span>
          Not affiliated with Square Enix.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-primary-foreground/65 md:justify-end">
          <Link href={`/${locale}/about`} className="transition-colors hover:text-primary-foreground">{t('about')}</Link>
          <Link href={`/${locale}/contact`} className="transition-colors hover:text-primary-foreground">{t('contact')}</Link>
          <Link href={`/${locale}/blog`} className="transition-colors hover:text-primary-foreground">{t('blog')}</Link>
          <Link href={`/${locale}/faq`} className="transition-colors hover:text-primary-foreground">{t('faq')}</Link>
          <Link href={`/${locale}/legal/privacy`} className="transition-colors hover:text-primary-foreground">{t('privacy')}</Link>
          <Link href={`/${locale}/legal/terms`} className="transition-colors hover:text-primary-foreground">{t('terms')}</Link>
          <a href="https://ko-fi.com/reconeur" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-foreground">
            {t('donate')}
          </a>
        </div>
      </Container>
    </footer>
  )
}
