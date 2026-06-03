import React from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/layout/Container'
import { locales } from '@/i18n/request'
import { setRequestLocale } from 'next-intl/server'

import { PrivacyKo } from '@/components/pages/legal/PrivacyKo'
import { PrivacyEn } from '@/components/pages/legal/PrivacyEn'
import { PrivacyJa } from '@/components/pages/legal/PrivacyJa'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const Content = locale === 'ko' ? PrivacyKo : locale === 'ja' ? PrivacyJa : PrivacyEn;
  
  return (
    <PageShell locale={locale}>
      <Content />
    </PageShell>
  )
}
