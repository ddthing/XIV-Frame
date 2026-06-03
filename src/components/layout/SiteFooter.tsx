import React from 'react'
import Link from 'next/link'
import { Container } from './Container'
import { useTranslations } from 'next-intl'

export function SiteFooter({ locale }: { locale: string }) {
  const t = useTranslations('Navigation')
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <Container size="lg" className="py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
        <p className="flex items-center gap-1">
          © {new Date().getFullYear()} XIV Frame.
          <span className="mx-1 text-border">|</span>
          Not affiliated with Square Enix.
        </p>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href={`/${locale}/about`} className="hover:text-foreground transition-colors">{t('about')}</Link>
          <Link href={`/${locale}/contact`} className="hover:text-foreground transition-colors">{t('contact')}</Link>
          <Link href={`/${locale}/blog`} className="hover:text-foreground transition-colors">{t('blog')}</Link>
          <Link href={`/${locale}/legal/privacy`} className="hover:text-foreground transition-colors">{t('privacy')}</Link>
          <Link href={`/${locale}/legal/terms`} className="hover:text-foreground transition-colors">{t('terms')}</Link>
          <a href="https://ko-fi.com/reconeur" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            {t('donate')}
          </a>
          <a href="https://x.com/reconeur" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            @reconeur
          </a>
        </div>
      </Container>
    </footer>
  )
}
