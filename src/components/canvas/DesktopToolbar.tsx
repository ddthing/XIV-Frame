import { useState } from 'react'
import { AlertCircle, BookOpen, Download, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { useCanvasActions } from '@/hooks/useCanvasActions'

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
  const [exportError, setExportError] = useState<string | null>(null)

  const handleSave = async () => {
    setExportError(null)
    try {
      await handleExport(stageRef, 'png')
    } catch {
      setExportError(t('exportError'))
    }
  }

  return (
    <header className={`app-header flex items-center gap-5 border-b border-primary-foreground/15 bg-primary px-5 text-primary-foreground ${className}`}>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isExporting ? t('exporting') : ''}
      </span>
      <div className="flex min-w-0 items-center gap-3">
        <Logo size="md" inverse />
        <span className="hidden font-body text-[11px] text-primary-foreground/55 xl:inline">{t('appSubtitle')}</span>
      </div>

      <div className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.1em] text-primary-foreground/55 lg:flex">
        <span className="size-1.5 rounded-full bg-accent shadow-[0_0_0_3px_rgba(255,233,92,0.14)]" />
        {t('savedLocally')}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {exportError && (
          <span role="alert" className="hidden items-center gap-1 text-[11px] text-accent lg:inline-flex">
            <AlertCircle className="size-3.5" aria-hidden="true" />
            {exportError}
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
