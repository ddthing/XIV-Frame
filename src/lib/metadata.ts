import type { Metadata } from 'next'
import { siteName, siteUrl } from './site'

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'XIV Frame | 파이널판타지14 스크린샷 프레임',
    template: `%s | ${siteName}`,
  },
  description: '파이널판타지14 스크린샷을 최대 4장까지 한 장의 PNG로 구성하고, 레이아웃과 시그니처를 브라우저에서 조정하는 무료 도구입니다.',
  keywords: ['파이널판타지14 스크린샷', 'FF14 스크린샷', '파판14 스샷', '스크린샷 프레임', 'XIV Frame'],
  authors: [{ name: siteName, url: siteUrl }],
  openGraph: {
    title: 'XIV Frame | 파이널판타지14 스크린샷 프레임',
    description: '파이널판타지14 스크린샷을 한 장의 PNG로 구성하고 시그니처까지 더해보세요.',
    url: siteUrl,
    siteName,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'XIV Frame Preview' }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIV Frame | 파이널판타지14 스크린샷 프레임',
    description: '파이널판타지14 스크린샷을 한 장의 PNG로 구성하고 시그니처까지 더해보세요.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}
