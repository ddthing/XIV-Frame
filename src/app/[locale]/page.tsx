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
  let description = "파이널판타지14(FF14) 스크린샷 프레임 제작 도구입니다.";
  
  if (locale === 'en') {
    title = "XIV Frame - FF14 Screenshot Framer";
    description = "Decorate and save your Final Fantasy XIV screenshots with your own style.";
  } else if (locale === 'ja') {
    title = "XIV Frame - FF14 スクリーンショットフレーマー";
    description = "FF14のスクリーンショットを自分だけのスタイルで装飾して保存しましょう。";
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
      locale: locale === 'en' ? 'en_US' : 'ja_JP',
    },
    twitter: {
      title,
      description,
    }
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
