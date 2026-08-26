import { useState } from 'react'
import { AlertCircle, BookOpen, CloudCheck, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { MouseEvent } from 'react'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { useCanvasActions } from '@/hooks/useCanvasActions'
import { localizedLandingPath } from '@/lib/site'
import { ExportFileTooLargeError } from '@/lib/export'

import type Konva from 'konva'

interface DesktopToolbarProps {
  stageRef: React.MutableRefObject<Konva.Stage | null>
  className?: string
}

export function DesktopToolbar({ stageRef, className = '' }: DesktopToolbarProps) {
  const { handleReset, handleExport, isExporting, hasImages } = useCanvasActions()
  const t = useTranslations('DesktopToolbar')
  const tNav = useTranslations('Navigation')
  const locale = useLocale()
  const homeHref = localizedLandingPath(locale)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  const handleSave = async () => {
    setExportError(null)
    setExportNotice(null)
    try {
      const result = await handleExport(stageRef, 'png')
      if (result?.optimizedFrom) setExportNotice(t('exportOptimized'))
    } catch (error) {
      setExportError(error instanceof ExportFileTooLargeError ? t('exportTooLarge') : t('exportError'))
    }
  }

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (hasImages && !window.confirm(t('leaveConfirm'))) event.preventDefault()
  }

  return (
    <header className={`app-header flex items-center gap-4 border-b border-primary-foreground/15 bg-primary px-4 text-primary-foreground sm:px-6 ${className}`}>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isExporting ? t('exporting') : ''}
      </span>
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={homeHref}
          aria-label={tNav('home')}
          title={tNav('home')}
          onClick={handleHomeClick}
          className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <Logo size="sm" inverse />
        </Link>
        <span className="hidden font-body text-[11px] text-primary-foreground/55 xl:inline">{t('appSubtitle')}</span>
      </div>

      <div className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.1em] text-primary-foreground/55 lg:flex">
        <CloudCheck className="size-3.5" aria-hidden="true" />
        {t('savedLocally')}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {exportError && (
          <span role="alert" className="hidden max-w-[22rem] items-center gap-1 text-[11px] text-destructive lg:inline-flex">
            <AlertCircle className="size-3.5" aria-hidden="true" />
            <span className="min-w-0 flex-1">{exportError}</span>
            <Button
              variant="ghost"
              size="xs"
              className="h-6 shrink-0 px-1.5 text-[11px] text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => void handleSave()}
              disabled={isExporting}
              aria-label={t('exportRetryAria')}
            >
              <RefreshCw className="size-3" aria-hidden="true" />
              {t('exportRetry')}
            </Button>
          </span>
        )}
        {exportNotice && (
          <span role="status" aria-live="polite" className="hidden items-center text-[11px] text-primary-foreground/70 lg:inline-flex">
            {exportNotice}
          </span>
        )}
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
            onClick={() => {
              if (hasImages && !window.confirm(t('resetConfirm'))) return
              handleReset()
            }}
            className="h-9 rounded-md px-3 text-xs font-semibold text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
          <RefreshCw className="size-3.5" />
          <span className="hidden xl:inline">{t('reset')}</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          aria-label={`${t('export')} PNG`}
          disabled={!hasImages || isExporting}
          className="h-9 rounded-md border-0 bg-accent px-3 text-xs font-bold text-accent-foreground shadow-subtle hover:bg-accent/90"
          onClick={() => void handleSave()}
        >
          {isExporting ? <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" /> : <Download className="size-3.5" aria-hidden="true" />}
          <span>{isExporting ? t('exporting') : t('export')}<span className="hidden sm:inline">{isExporting ? '' : ' PNG'}</span></span>
        </Button>
      </div>
    </header>
  )
}
