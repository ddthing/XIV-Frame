import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { EditorHelpPopover } from '@/components/ui/EditorHelpPopover'

export function MobileSheetHeader({
  open,
  eyebrow,
  title,
  description,
  onClose,
}: {
  open: boolean
  eyebrow: string
  title: string
  description: string
  onClose: () => void
}) {
  const t = useTranslations('MobileLayout')
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  return (
    <div className="border-b border-border px-5 pb-4 pt-3">
      <p className="editor-meta">{eyebrow}</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <DrawerTitle className="font-display text-xl font-bold tracking-[0.01em] text-foreground">{title}</DrawerTitle>
          <EditorHelpPopover description={description} />
        </div>
        <button ref={closeButtonRef} type="button" aria-label={t('closeSheet')} onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <DrawerDescription className="sr-only">{description}</DrawerDescription>
    </div>
  )
}
