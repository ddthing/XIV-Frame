import React from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/layout/Container'
import { locales } from '@/i18n/request'
import { setRequestLocale } from 'next-intl/server'
import { TermsKo } from '@/components/pages/legal/TermsKo'
import { TermsEn } from '@/components/pages/legal/TermsEn'
import { TermsJa } from '@/components/pages/legal/TermsJa'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const Content = locale === 'ko' ? TermsKo : locale === 'ja' ? TermsJa : TermsEn;
  
  return (
    <PageShell locale={locale}>
      <Content />
    </PageShell>
  )
}
