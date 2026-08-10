import { DrawerDescription, DrawerTitle } from '@/components/ui/drawer'

export function MobileSheetHeader({
  eyebrow,
  title,
  description,
  role,
}: {
  eyebrow: string
  title: string
  description: string
  role: string
}) {
  return (
    <div className="border-b border-border px-5 pb-4 pt-3">
      <p className="editor-meta">{eyebrow}</p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <DrawerTitle className="font-display text-xl font-bold tracking-[0.01em] text-foreground">{title}</DrawerTitle>
        <span className="rounded-full border border-border bg-surface-inset/70 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{role}</span>
      </div>
      <DrawerDescription className="mt-2 text-xs leading-5 text-muted-foreground">{description}</DrawerDescription>
    </div>
  )
}
