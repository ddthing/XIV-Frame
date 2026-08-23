import { ClientApp } from '@/components/ClientApp'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { isLocale, locales } from '@/i18n/request'
import { PageShell } from '@/components/layout/PageShell'
import { localizedAlternates, localizedUrl } from '@/lib/site'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  
  let title = "XIV Frame - Final Fantasy XIV Screenshot Framer";
  let description = "파이널판타지14 스크린샷을 최대 16장까지 구성하고, 합성·시그니처·레이아웃을 브라우저에서 조정해 PNG로 저장하는 무료 편집 도구입니다.";
  
  if (locale === 'en') {
    title = "XIV Frame - FF14 Screenshot Framer";
    description = "Compose up to 16 Final Fantasy XIV screenshots, including 3×3 and 4×4 grids, add composite elements and signatures, and save a PNG in your browser.";
  } else if (locale === 'ja') {
    title = "XIV Frame - FF14 スクリーンショットフレーマー";
    description = "最大16枚のFF14スクリーンショットを配置し、3×3・4×4グリッドや合成素材、署名を調整してブラウザでPNG保存できます。";
  }

  return {
    title,
    description,
    alternates: {
      canonical: localizedUrl(locale),
      languages: localizedAlternates(),
    },
    openGraph: {
      title,
      description,
      url: localizedUrl(locale),
      locale: locale === 'en' ? 'en_US' : locale === 'ja' ? 'ja_JP' : 'ko_KR',
      images: ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
    robots: { index: false, follow: true },
  }
}

export default async function LocalePage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <PageShell locale={locale} hideFooter={true} hideHeader={true}>
      <ClientApp currentLocale={locale} />
    </PageShell>
  )
}
