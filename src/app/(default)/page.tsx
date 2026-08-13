import { ClientApp } from '@/components/ClientApp'
import { setRequestLocale } from 'next-intl/server'
import { PageShell } from '@/components/layout/PageShell'
import type { Metadata } from 'next'
import { homeAlternates, siteUrl } from '@/lib/site'

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
    languages: homeAlternates(),
  },
  openGraph: {
    title: 'XIV Frame - FF14 스크린샷 프레임',
    description: '파이널판타지14 스크린샷을 나만의 스타일로 꾸미고 저장하세요.',
    url: siteUrl,
    locale: 'ko_KR',
  },
  twitter: {
    title: 'XIV Frame - FF14 스크린샷 프레임',
    description: '파이널판타지14 스크린샷을 나만의 스타일로 꾸미고 저장하세요.',
  },
}

export default function Home() {
  setRequestLocale('ko')
  return (
    <PageShell locale="ko" hideFooter={true} hideHeader={true}>
      <ClientApp currentLocale="ko" />
    </PageShell>
  )
}
