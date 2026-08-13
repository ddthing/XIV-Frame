import React from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { setRequestLocale } from 'next-intl/server'

import { locales } from '@/i18n/request'

import { AboutKo } from '@/components/pages/about/AboutKo'
import { AboutEn } from '@/components/pages/about/AboutEn'
import { AboutJa } from '@/components/pages/about/AboutJa'
import type { Metadata } from 'next'
import { localizedAlternates, localizedUrl } from '@/lib/site'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const title = locale === 'ko' ? '소개' : locale === 'ja' ? 'XIV Frameについて' : 'About XIV Frame'
  const description = locale === 'ko'
    ? 'XIV Frame의 기능, 이미지 처리 방식, 오픈 소스와 권리 안내를 확인하세요.'
    : locale === 'ja'
      ? 'XIV Frameの機能、画像の扱い、オープンソースと権利について確認できます。'
      : 'Learn about XIV Frame, image handling, open source, and third-party rights.'
  const url = localizedUrl(locale, '/about')
  return {
    title,
    description,
    alternates: { canonical: url, languages: localizedAlternates('/about') },
    openGraph: { title, description, url, type: 'website', images: ['/og-image.jpg'] },
  }
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
