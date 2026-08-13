import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { FaqKo } from '@/components/pages/faq/FaqKo'
import { FaqEn } from '@/components/pages/faq/FaqEn'
import { FaqJa } from '@/components/pages/faq/FaqJa'
import { locales } from '@/i18n/request'
import { PageShell } from '@/components/layout/PageShell'
import { localizedAlternates, localizedUrl } from '@/lib/site'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const title = locale === 'ko' ? '자주 묻는 질문' : locale === 'ja' ? 'よくある質問' : 'Frequently asked questions'
  const description = locale === 'ko'
    ? 'XIV Frame의 이미지 추가, 레이아웃, 시그니처, PNG 저장 방법과 자주 생기는 문제를 확인하세요.'
    : locale === 'ja'
      ? 'XIV Frameの画像追加、レイアウト、署名、PNG保存とよくある問題を確認できます。'
      : 'Find answers about adding images, layouts, signatures, PNG export, and common XIV Frame issues.'
  const url = localizedUrl(locale, '/faq')

  return {
    title,
    description,
    alternates: { canonical: url, languages: localizedAlternates('/faq') },
    openGraph: { title, description, url, type: 'website', images: ['/og-image.jpg'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
  }
}

export default async function FaqRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const Content = locale === 'ko' ? FaqKo : locale === 'ja' ? FaqJa : FaqEn

  return (
    <PageShell locale={locale}>
      <Content />
    </PageShell>
  )
}
