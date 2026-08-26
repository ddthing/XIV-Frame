import React from 'react'
import Link from 'next/link'
import { Container } from './Container'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Logo'

export function SiteFooter({ locale }: { locale: string }) {
  const t = useTranslations('Navigation')
  return (
    <footer className="border-t border-primary-foreground/15 bg-primary text-primary-foreground">
      <Container size="lg" className="flex flex-col gap-4 py-5 text-xs font-medium sm:gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:justify-start">
          <Logo size="sm" inverse />
          <p className="text-[11px] leading-4 text-primary-foreground/55">
            © {new Date().getFullYear()}
            <span className="mx-1">/</span>
            Not affiliated with Square Enix.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-primary-foreground/65 md:justify-end" aria-label={t('footerNavigation')}>
          <Link href={`/${locale}/legal/privacy`} className="transition-colors hover:text-primary-foreground">{t('privacy')}</Link>
          <Link href={`/${locale}/legal/terms`} className="transition-colors hover:text-primary-foreground">{t('terms')}</Link>
          <a href="https://ko-fi.com/reconeur" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary-foreground">
            {t('donate')}
          </a>
        </nav>
      </Container>
    </footer>
  )
}
