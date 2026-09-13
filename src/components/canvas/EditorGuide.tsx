'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight, CircleHelp, X } from 'lucide-react'

interface EditorGuideProps {
  idSuffix?: string
}

export function EditorGuide({ idSuffix = 'desktop' }: EditorGuideProps) {
  const locale = useLocale()
  const t = useTranslations('EditorGuide')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = `editor-guide-${idSuffix}`
  const titleId = `${panelId}-title`

  useEffect(() => {
    if (!open) return

    const focusFrame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLButtonElement>('[data-guide-close]')?.focus()
    })

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const steps = [
    { number: '01', title: t('stepLayout'), description: t('stepLayoutDescription') },
    { number: '02', title: t('stepPhotos'), description: t('stepPhotosDescription') },
    { number: '03', title: t('stepSignature'), description: t('stepSignatureDescription') },
    { number: '04', title: t('stepExport'), description: t('stepExportDescription') },
  ]

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={t('trigger')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(value => !value)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary-foreground/15 px-3 text-xs font-semibold text-primary-foreground/75 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        <CircleHelp aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">{t('trigger')}</span>
      </button>

      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-labelledby={titleId}
        hidden={!open}
        className="absolute right-0 top-[calc(100%+8px)] z-40 max-h-[calc(100dvh-5rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border bg-card p-4 text-foreground shadow-xl max-md:fixed max-md:left-4 max-md:right-4 max-md:top-[64px] max-md:w-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="editor-meta">{t('eyebrow')}</p>
            <h2 id={titleId} className="mt-1 font-display text-base font-bold tracking-[0.01em]">{t('title')}</h2>
            <p className="mt-1.5 font-body text-xs leading-5 text-muted-foreground">{t('description')}</p>
          </div>
          <button
            type="button"
            data-guide-close
            aria-label={t('close')}
            onClick={() => {
              setOpen(false)
              triggerRef.current?.focus()
            }}
            className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <ol className="mt-4 grid gap-3" aria-label={t('stepsLabel')}>
          {steps.map(step => (
            <li key={step.number} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2.5">
              <span aria-hidden="true" className="grid size-7 place-items-center rounded-md bg-muted font-mono text-[10px] font-bold tabular-nums text-foreground">
                {step.number}
              </span>
              <div className="min-w-0">
                <p className="font-body text-xs font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 font-body text-[11px] leading-4 text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href={`/${locale}/blog`}
          onClick={() => setOpen(false)}
          className="mt-4 inline-flex items-center gap-1.5 font-body text-xs font-semibold text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {t('fullGuide')}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
