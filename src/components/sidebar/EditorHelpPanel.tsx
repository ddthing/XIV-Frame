'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, BookOpen, CircleHelp, FileText, Heart, Info, Mail, PanelLeftClose, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

interface EditorHelpPanelProps {
  onToggleCollapse: () => void
}

interface HelpLink {
  href: string
  label: string
  description: string
  icon: LucideIcon
  external?: boolean
}

export function EditorHelpPanel({ onToggleCollapse }: EditorHelpPanelProps) {
  const locale = useLocale()
  const t = useTranslations('EditorNavigation')
  const navigationT = useTranslations('Navigation')

  const helpLinks: HelpLink[] = [
    {
      href: `/${locale}/blog`,
      label: navigationT('blog'),
      description: t('guideDescription'),
      icon: BookOpen,
    },
    {
      href: `/${locale}/faq`,
      label: navigationT('faq'),
      description: t('faqDescription'),
      icon: CircleHelp,
    },
  ]

  const serviceLinks: HelpLink[] = [
    {
      href: `/${locale}/about`,
      label: navigationT('about'),
      description: t('aboutDescription'),
      icon: Info,
    },
    {
      href: `/${locale}/contact`,
      label: navigationT('contact'),
      description: t('contactDescription'),
      icon: Mail,
    },
    {
      href: `/${locale}/legal/privacy`,
      label: navigationT('privacy'),
      description: t('privacyDescription'),
      icon: ShieldCheck,
    },
    {
      href: `/${locale}/legal/terms`,
      label: navigationT('terms'),
      description: t('termsDescription'),
      icon: FileText,
    },
    {
      href: 'https://ko-fi.com/reconeur',
      label: navigationT('donate'),
      description: t('donateDescription'),
      icon: Heart,
      external: true,
    },
  ]

  const renderLink = ({ href, label, description, icon: Icon, external }: HelpLink) => {
    const className = 'group flex min-h-14 items-center gap-3 rounded-md border border-transparent px-3 py-2.5 transition-[background-color,border-color,color] hover:border-border hover:bg-surface-inset/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'

    const content = (
      <>
        <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors group-hover:text-foreground">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-foreground">{label}</span>
          <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{description}</span>
        </span>
        {external ? (
          <>
            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="sr-only">({navigationT('opensInNewTab')})</span>
          </>
        ) : <span aria-hidden="true" className="text-sm text-muted-foreground transition-transform group-hover:translate-x-0.5">→</span>}
      </>
    )

    if (external) {
      return (
        <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
        </a>
      )
    }

    return (
      <Link key={href} href={href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="shrink-0 border-b border-border bg-background px-5 pb-5 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="editor-meta">{t('infoEyebrow')}</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-[0.01em] text-foreground">{t('infoTitle')}</h2>
          </div>
          <button
            type="button"
            aria-label={t('collapse')}
            title={t('collapse')}
            onClick={onToggleCollapse}
            className="grid size-10 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-surface-inset hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <PanelLeftClose aria-hidden="true" className="size-4" />
          </button>
        </div>
        <p className="mt-2 max-w-[31rem] font-body text-[13px] leading-5 text-muted-foreground">{t('infoDescription')}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="space-y-7 p-5 pb-10">
          <section aria-labelledby="editor-help-heading">
            <h3 id="editor-help-heading" className="editor-meta">{t('helpHeading')}</h3>
            <div className="mt-2 grid gap-1">{helpLinks.map(renderLink)}</div>
          </section>

          <section aria-labelledby="editor-service-heading">
            <h3 id="editor-service-heading" className="editor-meta">{t('serviceHeading')}</h3>
            <div className="mt-2 grid gap-1">{serviceLinks.map(renderLink)}</div>
          </section>
        </div>
      </div>
    </div>
  )
}
