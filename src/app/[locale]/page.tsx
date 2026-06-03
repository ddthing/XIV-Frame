import { ClientApp } from '@/components/ClientApp'
import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ja' }]
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
      canonical: `https://xiv-frame.com/${locale}`,
      languages: {
        'ko': 'https://xiv-frame.com',
        'en': 'https://xiv-frame.com/en',
        'ja': 'https://xiv-frame.com/ja',
        'x-default': 'https://xiv-frame.com'
      }
    },
    openGraph: {
      title,
      description,
      url: `https://xiv-frame.com/${locale}`,
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
  
  if (!['en', 'ja'].includes(locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ClientApp currentLocale={locale} />
    </NextIntlClientProvider>
  )
}
