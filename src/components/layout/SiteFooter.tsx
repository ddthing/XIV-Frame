import React from 'react'
import Link from 'next/link'
import { Container } from './Container'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Logo'
import { ExternalLink } from '@/components/content/ExternalLink'

export function SiteFooter({ locale }: { locale: string }) {
  const t = useTranslations('Navigation')
  return (
    <footer className="border-t border-primary-foreground/15 bg-primary text-primary-foreground">
      <Container size="lg" className="flex flex-col gap-8 py-8 text-sm font-medium md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Logo size="sm" inverse />
          <p className="text-xs text-primary-foreground/55">
          {t('copyright', { year: new Date().getFullYear() })}
          <span className="mx-1">/</span>
          {t('notAffiliated')}
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-primary-foreground/65 md:justify-end">
          <Link href={`/${locale}/about`} className="rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary">{t('about')}</Link>
          <Link href={`/${locale}/contact`} className="rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary">{t('contact')}</Link>
          <Link href={`/${locale}/blog`} className="rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary">{t('blog')}</Link>
          <Link href={`/${locale}/faq`} className="rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary">{t('faq')}</Link>
          <Link href={`/${locale}/legal/privacy`} className="rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary">{t('privacy')}</Link>
          <Link href={`/${locale}/legal/terms`} className="rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary">{t('terms')}</Link>
          <ExternalLink href="https://ko-fi.com/reconeur" newWindowLabel={t('opensInNewTab')} className="rounded-sm transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
            {t('donate')}
          </ExternalLink>
        </div>
      </Container>
    </footer>
  )
}
