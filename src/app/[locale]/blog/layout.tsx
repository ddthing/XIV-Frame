import React from 'react'
import { setRequestLocale } from 'next-intl/server'
import { locales } from '@/i18n/request'
import { PageShell } from '@/components/layout/PageShell'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageShell locale={locale}>
      <div className="min-h-full w-full">
        {children}
      </div>
    </PageShell>
  )
}
