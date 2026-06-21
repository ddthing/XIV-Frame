'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/ui/Logo'
import { Menu, X } from 'lucide-react'
import { Container } from './Container'

export function SiteHeader({ locale, hideBorder = false, className = '' }: { locale: string, hideBorder?: boolean, className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const t = useTranslations('Navigation')

  const navLinks = [
    { href: `/${locale}`, label: t('app') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/about`, label: t('about') },
  ]

  return (
    <div className="fixed top-0 left-0 w-full z-50 md:top-4 md:left-1/2 md:-translate-x-1/2 md:w-[calc(100%-2rem)] md:max-w-xl">
      <header className={`bg-[#fcfaf5] border-b border-[#b6b6b6] md:border md:rounded-[12px] shadow-[rgba(255,235,90,0.05)_0px_20px_40px_-10px] transition-all ${className}`}>
        <div className="h-12 px-4 flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link href={`/${locale}`} className="flex items-center">
              <Logo size="sm" />
            </Link>
          </div>
          
          {/* Center: Nav Links */}
          <nav className="hidden md:flex items-center justify-center gap-2 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="px-3 py-1.5 text-[14px] font-medium text-[#1a3300] hover:bg-[#d5f5c2] rounded-[6px] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            <button 
              className="md:hidden p-2 text-[#1a3300]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-xl transition-colors font-sans"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-2 border-t border-border flex justify-end">
            <LanguageSwitcher />
          </div>
        </div>
      )}
      </header>
    </div>
  )
}
