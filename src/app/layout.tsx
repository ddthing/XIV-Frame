import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://xiv-frame.com"),
  title: "XIV Frame - Final Fantasy XIV Screenshot Framer",
  description: "파이널판타지14(FF14) 스크린샷 2장 합치기 및 사진 배열, 나만의 시그니처 생성이 가능한 프레임 제작 도구입니다. 1장 이미지에도 간편하게 시그니처와 레이아웃을 설정해 멋진 스크린샷을 꾸며보세요.",
  keywords: ["FF14", "파판14", "스크린샷", "프레임", "XIV Frame", "파이널판타지14", "스샷", "보정", "시그니처", "사진 합치기"],
  authors: [{ name: "XIV Frame" }],
  openGraph: {
    title: "XIV Frame - FF14 스크린샷 프레임",
    description: "파이널판타지14 스크린샷을 나만의 스타일로 꾸미고 저장하세요.",
    url: "https://xiv-frame.com",
    siteName: "XIV Frame",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "XIV Frame Preview",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XIV Frame - FF14 스크린샷 프레임",
    description: "파이널판타지14 스크린샷을 나만의 스타일로 꾸미고 저장하세요.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        suppressHydrationWarning
        className="h-full antialiased"
      >
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "XIV Frame",
                "applicationCategory": "MultimediaApplication",
                "operatingSystem": "Web",
                "url": "https://xiv-frame.com",
                "description": "파이널판타지14(FF14) 스크린샷 프레임 제작 도구",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "KRW"
                }
              })
            }}
          />
        </head>
        <body className="min-h-full flex flex-col">
          {children}
          <Script 
            id="adsbygoogle-script"
            async 
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2169729065542563" 
            crossOrigin="anonymous" 
            strategy="afterInteractive"
          />
        </body>
    </html>
  );
}
