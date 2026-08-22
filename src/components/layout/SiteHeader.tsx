'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Logo'
import { ArrowUpRight, Menu, X } from 'lucide-react'

export function SiteHeader({ locale, hideBorder = false, className = '' }: { locale: string, hideBorder?: boolean, className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations('Navigation')
  const pathname = usePathname()
  const isPublicHome = pathname === '/' || pathname.endsWith('/landing')
  const homeHref = isPublicHome
    ? (pathname === '/' ? '/' : `/${locale}/landing`)
    : `/${locale}`

  const navLinks = [
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/faq`, label: t('faq') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  return (
    <div className="sticky top-0 z-50 w-full">
      <a href="#main-content" className="sr-only fixed left-4 top-3 z-[60] rounded-md bg-sticky-note-yellow px-3 py-2 text-xs font-bold text-primary shadow-subtle focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-sticky-note-yellow focus:ring-offset-2 focus:ring-offset-primary">
        {t('skipToContent')}
      </a>
      <header className={`app-header border-b bg-primary text-primary-foreground ${hideBorder ? 'border-transparent' : 'border-primary-foreground/15'} transition-colors ${className}`}>
        <div className="app-header-inner mx-auto w-full justify-between gap-6 px-4 sm:px-5">
          <Link href={homeHref} className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sticky-note-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
            <Logo size="md" inverse />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label={t('primaryNavigation')}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sticky-note-yellow ${pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'bg-primary-foreground/12 text-primary-foreground' : 'text-primary-foreground/70'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2">
            <div className="hidden sm:block">
              <LanguageSwitcher inverse />
            </div>
            <Link href={`/${locale}`} className="hidden items-center gap-1 rounded-md bg-sticky-note-yellow px-3 py-2 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5 hover:bg-sticky-note-yellow/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sticky-note-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-primary md:inline-flex">
              {t('app')}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
            <button type="button" className="rounded-md p-2 text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sticky-note-yellow md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label={t('toggleMenu')} aria-expanded={isMobileMenuOpen}>
              {isMobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
        <div className="border-t border-primary-foreground/15 bg-primary px-4 py-4 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1" aria-label={t('mobileNavigation')}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sticky-note-yellow ${pathname === link.href || pathname.startsWith(`${link.href}/`) ? 'bg-primary-foreground/12 text-primary-foreground' : 'text-primary-foreground/70'}`} onClick={() => setIsMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between gap-3 border-t border-primary-foreground/15 pt-3">
            <LanguageSwitcher inverse />
            <Link href={`/${locale}`} className="inline-flex items-center gap-1 rounded-md bg-sticky-note-yellow px-3 py-2 text-sm font-bold text-primary hover:bg-sticky-note-yellow/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sticky-note-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-primary" onClick={() => setIsMobileMenuOpen(false)}>
              {t('app')}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
        )}
      </header>
    </div>
  )
}
