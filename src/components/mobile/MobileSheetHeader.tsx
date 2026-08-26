import { X } from 'lucide-react'

import { DrawerClose, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'

export function MobileSheetHeader({
  eyebrow,
  title,
  description,
  role,
  closeLabel,
}: {
  eyebrow: string
  title: string
  description: string
  role: string
  closeLabel: string
}) {
  return (
    <div className="border-b border-border px-5 pb-4 pt-3">
      <p className="editor-meta">{eyebrow}</p>
      <div className="mt-2 flex items-start gap-3">
        <DrawerTitle className="min-w-0 flex-1 font-display text-lg font-bold tracking-[0.01em] text-foreground">{title}</DrawerTitle>
        <span className="shrink-0 rounded-full border border-border bg-surface-inset/70 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{role}</span>
        <DrawerClose
          type="button"
          aria-label={closeLabel}
          className="grid size-11 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-surface-inset hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <X className="size-4" aria-hidden="true" />
        </DrawerClose>
      </div>
      <DrawerDescription className="mt-2 font-body text-xs leading-5 text-muted-foreground">{description}</DrawerDescription>
    </div>
  )
}
