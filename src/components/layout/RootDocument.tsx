import { operatorName, operatorUrl, siteName, siteUrl } from '@/lib/site'

export function RootDocument({ children, locale }: { children: React.ReactNode; locale: 'ko' | 'en' | 'ja' }) {
  return (
    <html lang={locale} suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'SoftwareApplication',
                  name: siteName,
                  applicationCategory: 'MultimediaApplication',
                  operatingSystem: 'Web',
                  url: siteUrl,
                  description: '파이널판타지14 스크린샷을 구성하고 결과 파일로 저장하는 브라우저 기반 편집 도구',
                  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
                },
                {
                  '@type': 'Organization',
                  name: operatorName,
                  url: operatorUrl,
                  logo: `${siteUrl}/icon.svg`,
                  sameAs: [operatorUrl],
                },
                {
                  '@type': 'WebSite',
                  name: siteName,
                  url: siteUrl,
                  publisher: { '@type': 'Organization', name: operatorName, url: operatorUrl },
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
