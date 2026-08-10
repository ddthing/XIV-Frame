import { BookOpen, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { useCanvasActions } from '@/hooks/useCanvasActions'

import type Konva from 'konva'

interface DesktopToolbarProps {
  stageRef: React.MutableRefObject<Konva.Stage | null>
  className?: string
}

export function DesktopToolbar({ stageRef, className = '' }: DesktopToolbarProps) {
  const { handleReset, handleExport } = useCanvasActions()
  const t = useTranslations('DesktopToolbar')
  const tNav = useTranslations('Navigation')
  const locale = useLocale()

  return (
    <header className={`flex h-[64px] shrink-0 items-center gap-5 border-b border-primary-foreground/15 bg-primary px-5 text-primary-foreground ${className}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-[32px] shrink-0 place-items-center rounded-md border border-accent/70 font-display text-[10px] font-bold tracking-[-0.08em] text-accent">
          XIV
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="font-display text-sm font-bold leading-none tracking-[0.01em]">XIV Frame</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-primary-foreground/55">{t('appSubtitle')}</p>
        </div>
      </div>

      <div className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.1em] text-primary-foreground/55 lg:flex">
        <span className="size-1.5 rounded-full bg-accent shadow-[0_0_0_3px_rgba(255,233,92,0.14)]" />
        {t('savedLocally')}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher inverse />
        <Link
          href={`/${locale}/blog`}
          aria-label={tNav('blog')}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-transparent px-3 text-xs font-semibold text-primary-foreground/70 transition-colors hover:border-primary-foreground/15 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <BookOpen className="size-4" />
          <span className="hidden lg:inline">{tNav('blog')}</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t('reset')}
          onClick={handleReset}
          className="h-9 rounded-md px-3 text-xs font-semibold text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <RefreshCw className="size-3.5" />
          <span className="hidden xl:inline">{t('reset')}</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          aria-label={`${t('export')} PNG`}
          className="h-9 rounded-md border-0 bg-accent px-3 text-xs font-bold text-accent-foreground shadow-subtle hover:bg-accent/90"
          onClick={() => handleExport(stageRef, 'png')}
        >
          <Download className="size-3.5" />
          <span>{t('export')}<span className="hidden sm:inline"> PNG</span></span>
        </Button>
      </div>
    </header>
  )
}
