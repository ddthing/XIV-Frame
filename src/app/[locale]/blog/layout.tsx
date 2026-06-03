import React from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { locales } from '@/i18n/request'
import { setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function BlogLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          <Link href={`/${locale}`} className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              X
            </div>
            <span className="font-bold text-slate-800">XIV Frame</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/blog`} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Blog
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} XIV Frame. Not affiliated with Square Enix.</p>
          <div className="flex gap-4">
            <Link href={`/${locale}/legal/privacy`} className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link href={`/${locale}/legal/terms`} className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
    </NextIntlClientProvider>
  )
}
