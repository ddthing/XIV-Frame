import React from 'react'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

interface PageShellProps {
  children: React.ReactNode
  locale: string
  hideFooter?: boolean
  hideHeader?: boolean
  hideHeaderBorder?: boolean
  headerClassName?: string
}

export async function PageShell({ children, locale, hideFooter = false, hideHeader = false, hideHeaderBorder = false, headerClassName = '' }: PageShellProps) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-[100dvh] h-[100dvh] bg-background flex flex-col font-sans selection:bg-primary/20">
      {!hideHeader && <SiteHeader locale={locale} hideBorder={hideHeaderBorder} className={headerClassName} />}
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      
      {!hideFooter && <SiteFooter locale={locale} />}
    </div>
    </NextIntlClientProvider>
  )
}
