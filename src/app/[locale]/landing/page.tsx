import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { LandingPage } from '@/components/pages/landing/LandingPage'
import { PageShell } from '@/components/layout/PageShell'
import { isLocale, locales } from '@/i18n/request'
import { localizedAlternates, localizedUrl, siteUrl } from '@/lib/site'

export function generateStaticParams() {
  return locales.filter((locale) => locale !== 'ko').map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)

  if (!isLocale(locale)) return {}

  const isJapanese = locale === 'ja'
  const title = isJapanese ? 'XIV Frame | FFXIV スクリーンショット編集' : 'XIV Frame | Final Fantasy XIV screenshot editor'
  const description = isJapanese
    ? '最大16枚のFFXIVスクリーンショットを配置し、3×3・4×4グリッド、合成・レイアウト・署名を調整してPNGで保存できる無料のブラウザエディターです。'
    : 'A free browser editor for arranging up to 16 Final Fantasy XIV screenshots, including 3×3 and 4×4 grids, tuning composites and signatures, and saving a finished PNG.'
  const url = localizedUrl(locale, '/landing')

  return {
    title,
    description,
    alternates: { canonical: url, languages: { ...localizedAlternates('/landing'), ko: siteUrl, 'x-default': siteUrl } },
    openGraph: { title, description, url, type: 'website', images: ['/og-image.jpg'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-image.jpg'] },
    robots: { index: true, follow: true },
  }
}

export default async function LandingRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale) || locale === 'ko') notFound()
  setRequestLocale(locale)

  return (
    <PageShell locale={locale}>
      <LandingPage locale={locale} />
    </PageShell>
  )
}
