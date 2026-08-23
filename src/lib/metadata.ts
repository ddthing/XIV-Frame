import type { Metadata } from 'next'
import { operatorName, operatorUrl, siteName, siteUrl } from './site'

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'XIV Frame | 파이널판타지14 스크린샷 프레임',
    template: `%s | ${siteName}`,
  },
  description: '파이널판타지14 스크린샷을 최대 16장까지 한 장의 PNG로 구성하고, 3×3·4×4 격자와 합성·레이아웃·시그니처를 브라우저에서 조정하는 무료 편집 도구입니다. 사용 순서와 문제 해결 가이드도 제공합니다.',
  keywords: ['파이널판타지14 스크린샷', 'FF14 스크린샷', '파판14 스샷', '스크린샷 프레임', 'XIV Frame'],
  authors: [{ name: operatorName, url: operatorUrl }],
  openGraph: {
    title: 'XIV Frame | 파이널판타지14 스크린샷 프레임',
    description: '파이널판타지14 스크린샷을 구성하고 합성·시그니처를 더한 뒤 PNG로 저장하세요. 실제 사용 순서와 문제 해결 방법을 함께 제공합니다.',
    url: siteUrl,
    siteName,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'XIV Frame Preview' }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIV Frame | 파이널판타지14 스크린샷 프레임',
    description: '파이널판타지14 스크린샷을 구성하고 합성·시그니처를 더한 뒤 PNG로 저장하세요. 실제 사용 순서와 문제 해결 방법을 함께 제공합니다.',
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}
