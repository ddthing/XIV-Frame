import { useState } from 'react'
import { AlertCircle, Download, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const [exportError, setExportError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!hasImages || isExporting) return
    setExportError(null)
    try {
      await handleExport(stageRef, 'png')
    } catch {
      setExportError(t('exportError'))
    }
  }

  return (
    <header className={`app-header relative flex items-center gap-5 border-b border-primary-foreground/15 bg-primary px-5 text-primary-foreground ${className}`}>
      <div className="flex min-w-0 items-center">
        <Logo size="md" inverse />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {exportError && (
          <span role="alert" className="inline-flex max-w-56 items-center gap-1 text-right text-[11px] leading-4 text-destructive">
            <AlertCircle className="size-3.5" aria-hidden="true" />
            {exportError}
          </span>
        )}
        <LanguageSwitcher inverse />
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
          <RefreshCw aria-hidden="true" className="size-3.5" />
          <span className="hidden xl:inline">{t('reset')}</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          aria-label={`${t('export')} PNG`}
          disabled={!hasImages || isExporting}
          aria-describedby={!hasImages ? 'desktop-export-empty-hint' : undefined}
          className="h-9 rounded-md border-0 bg-primary-foreground px-3 text-xs font-bold text-primary shadow-subtle hover:bg-primary-foreground/90"
          onClick={() => void handleSave()}
        >
          {isExporting ? <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" /> : <Download className="size-3.5" aria-hidden="true" />}
          <span>{isExporting ? t('exporting') : t('export')}<span className="hidden sm:inline">{isExporting ? '' : ' PNG'}</span></span>
        </Button>
        {!hasImages && <span id="desktop-export-empty-hint" className="sr-only">{t('exportDisabledHint')}</span>}
      </div>
    </header>
  )
}
