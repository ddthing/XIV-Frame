import React from 'react'
import { cn } from '@/lib/utils'
import { Container } from './Container'

interface ContentPageProps {
  eyebrow: string
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
  contentClassName?: string
}

export function ContentPage({
  eyebrow,
  title,
  description,
  children,
  size = 'md',
  className,
  contentClassName,
}: ContentPageProps) {
  return (
    <div className={cn('relative isolate min-h-full overflow-hidden bg-background', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,233,92,0.14),transparent_28%)] [background-image:radial-gradient(rgba(26,51,0,0.08)_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <Container size={size} className="relative py-12 sm:py-16 lg:py-20">
        <header className="max-w-3xl">
          <p className="editor-meta">{eyebrow}</p>
          {title && (
            <h1 className="mt-3 max-w-[18ch] font-display text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.08] tracking-[0.02em] text-foreground">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-5 max-w-[62ch] text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
        </header>
        <div className={cn('mt-10 sm:mt-14', contentClassName)}>{children}</div>
      </Container>
    </div>
  )
}

interface ContentPanelProps {
  eyebrow?: string
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ContentPanel({ eyebrow, title, children, className }: ContentPanelProps) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-6 shadow-subtle sm:p-8', className)}>
      {eyebrow && <p className="editor-meta">{eyebrow}</p>}
      {title && <h2 className="mt-3 font-display text-2xl font-bold leading-tight tracking-[0.02em] text-foreground">{title}</h2>}
      <div className={cn(eyebrow || title ? 'mt-5' : undefined, 'text-base leading-7 text-foreground/80 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2:not(:first-child)]:mt-8 [&>p]:text-foreground/75')}>
        {children}
      </div>
    </section>
  )
}

interface ContentSectionProps {
  index: string
  title: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ContentSection({ index, title, children, className }: ContentSectionProps) {
  return (
    <section className={cn('border-t border-border pt-6 first:border-t-0 first:pt-0', className)}>
      <p className="editor-meta">{index}</p>
      <h2 className="mt-3 font-display text-2xl font-bold leading-tight tracking-[0.02em] text-foreground">{title}</h2>
      <div className="mt-4 text-base leading-7 text-foreground/80">{children}</div>
    </section>
  )
}
