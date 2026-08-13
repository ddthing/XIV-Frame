import React from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { setRequestLocale } from 'next-intl/server'

import { locales } from '@/i18n/request'

import { ContactKo } from '@/components/pages/contact/ContactKo'
import { ContactEn } from '@/components/pages/contact/ContactEn'
import { ContactJa } from '@/components/pages/contact/ContactJa'
import type { Metadata } from 'next'
import { localizedAlternates, localizedUrl } from '@/lib/site'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const title = locale === 'ko' ? '문의' : locale === 'ja' ? 'お問い合わせ' : 'Contact XIV Frame'
  const description = locale === 'ko'
    ? 'XIV Frame의 버그 제보와 사용성 피드백을 보내주세요.'
    : locale === 'ja'
      ? 'XIV Frameのバグ報告やフィードバックをお送りください。'
      : 'Send bug reports and product feedback about XIV Frame.'
  const url = localizedUrl(locale, '/contact')
  return { title, description, alternates: { canonical: url, languages: localizedAlternates('/contact') }, openGraph: { title, description, url, type: 'website' } }
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
