import React from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/layout/Container'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { locales } from '@/i18n/request'

import { AboutKo } from '@/components/pages/about/AboutKo'
import { AboutEn } from '@/components/pages/about/AboutEn'
import { AboutJa } from '@/components/pages/about/AboutJa'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const Content = locale === 'ko' ? AboutKo : locale === 'ja' ? AboutJa : AboutEn;
  
  return (
    <PageShell locale={locale}>
      <Content />
    </PageShell>
  )
}
