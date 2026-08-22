import { setRequestLocale } from 'next-intl/server'
import { PageShell } from '@/components/layout/PageShell'
import { LandingPage } from '@/components/pages/landing/LandingPage'
import type { Metadata } from 'next'
import { homeAlternates, siteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'XIV Frame | 파이널판타지14 스크린샷 편집기',
  description: '파이널판타지14 스크린샷을 최대 4장까지 배치하고, 합성·레이아웃·시그니처를 조정해 PNG로 저장하는 무료 브라우저 편집기입니다. 실제 사용 순서와 게시 전 검수 방법도 제공합니다.',
  alternates: {
    canonical: siteUrl,
    languages: homeAlternates(),
  },
  openGraph: {
    title: 'XIV Frame | 파이널판타지14 스크린샷 편집기',
    description: '파이널판타지14 스크린샷을 배치하고 합성·시그니처를 더한 뒤 PNG로 저장하세요. 실제 사용 순서와 게시 전 검수 방법을 함께 제공합니다.',
    url: siteUrl,
    locale: 'ko_KR',
  },
  twitter: {
    title: 'XIV Frame | 파이널판타지14 스크린샷 편집기',
    description: '파이널판타지14 스크린샷을 배치하고 합성·시그니처를 더한 뒤 PNG로 저장하세요.',
  },
}

export default function Home() {
  setRequestLocale('ko')
  return (
    <PageShell locale="ko">
      <LandingPage locale="ko" />
    </PageShell>
  )
}
