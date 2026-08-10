import React from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { setRequestLocale } from 'next-intl/server'

import { locales } from '@/i18n/request'

import { ContactKo } from '@/components/pages/contact/ContactKo'
import { ContactEn } from '@/components/pages/contact/ContactEn'
import { ContactJa } from '@/components/pages/contact/ContactJa'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const Content = locale === 'ko' ? ContactKo : locale === 'ja' ? ContactJa : ContactEn;
  
  return (
    <PageShell locale={locale}>
      <Content />
    </PageShell>
  )
}
