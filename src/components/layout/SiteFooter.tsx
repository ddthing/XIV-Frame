import React from 'react'
import Link from 'next/link'
import { Container } from './Container'
import { useTranslations } from 'next-intl'

export function SiteFooter({ locale }: { locale: string }) {
  const t = useTranslations('Navigation')
  return (
    <footer className="border-t border-border bg-transparent mt-12">
      <Container size="lg" className="py-8 flex flex-col md:flex-row items-center justify-between gap-8 text-[14px] text-foreground/60 font-medium">
        <p className="flex items-center gap-2">
          © {new Date().getFullYear()} XIV Frame.
          <span className="text-border mx-1">/</span>
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
        </div>
      </Container>
    </footer>
  )
}
