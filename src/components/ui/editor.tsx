import * as React from 'react'

import { cn } from '@/lib/utils'

export function EditorSection({
  title,
  description,
  children,
  className,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-sm font-semibold leading-5 tracking-tight text-foreground">{title}</h3>}
          {description && <p className="text-[13px] leading-5 text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

export function EditorFieldHeader({
  label,
  value,
  htmlFor,
}: {
  label: React.ReactNode
  value?: React.ReactNode
  htmlFor?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="text-xs font-semibold text-foreground">
        {label}
      </label>
      {value !== undefined && (
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{value}</span>
      )}
    </div>
  )
}

export function EditorChoice({
  active = false,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-xs font-semibold transition-all',
        active
          ? 'border-primary bg-sticky-note-mint text-primary shadow-subtle'
          : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/60 hover:text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
