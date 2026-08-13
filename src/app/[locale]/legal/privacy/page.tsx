import React from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { locales } from '@/i18n/request'
import { setRequestLocale } from 'next-intl/server'

import { PrivacyKo } from '@/components/pages/legal/PrivacyKo'
import { PrivacyEn } from '@/components/pages/legal/PrivacyEn'
import { PrivacyJa } from '@/components/pages/legal/PrivacyJa'
import type { Metadata } from 'next'
import { localizedAlternates, localizedUrl } from '@/lib/site'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const title = locale === 'ko' ? '개인정보처리방침' : locale === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'
  const description = locale === 'ko'
    ? 'XIV Frame의 이미지, 로컬 저장소, 외부 리소스와 Google 광고 쿠키 처리 방식을 안내합니다.'
    : locale === 'ja'
      ? 'XIV Frameにおける画像、ローカルストレージ、外部リソース、Google広告Cookieの扱いを説明します。'
      : 'How XIV Frame handles images, local storage, external resources, and Google advertising cookies.'
  const url = localizedUrl(locale, '/legal/privacy')
  return { title, description, alternates: { canonical: url, languages: localizedAlternates('/legal/privacy') }, robots: { index: true, follow: true } }
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
