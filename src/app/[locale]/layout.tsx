import type { Metadata } from 'next'
import '../globals.css'
import { RootDocument } from '@/components/layout/RootDocument'
import { rootMetadata } from '@/lib/metadata'
import { isLocale, locales } from '@/i18n/request'

export const metadata: Metadata = rootMetadata

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <RootDocument locale={isLocale(locale) ? locale : 'ko'}>{children}</RootDocument>
}
