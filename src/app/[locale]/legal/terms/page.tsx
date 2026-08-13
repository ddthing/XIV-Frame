import React from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { locales } from '@/i18n/request'
import { setRequestLocale } from 'next-intl/server'
import { TermsKo } from '@/components/pages/legal/TermsKo'
import { TermsEn } from '@/components/pages/legal/TermsEn'
import { TermsJa } from '@/components/pages/legal/TermsJa'
import type { Metadata } from 'next'
import { localizedAlternates, localizedUrl } from '@/lib/site'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const title = locale === 'ko' ? '이용약관' : locale === 'ja' ? '利用規約' : 'Terms of Service'
  const description = locale === 'ko'
    ? 'XIV Frame의 서비스 범위, 이용자 콘텐츠, 허용되는 사용과 면책 사항을 안내합니다.'
    : locale === 'ja'
      ? 'XIV Frameのサービス範囲、利用者コンテンツ、利用条件と免責事項を説明します。'
      : 'The XIV Frame service scope, user content rules, acceptable use, and disclaimers.'
  const url = localizedUrl(locale, '/legal/terms')
  return { title, description, alternates: { canonical: url, languages: localizedAlternates('/legal/terms') }, robots: { index: true, follow: true } }
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
