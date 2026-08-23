import React from 'react'
import { cn } from '@/lib/utils'
import { Container } from './Container'

interface ContentPageProps {
  eyebrow: string
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  density?: 'default' | 'editor'
  className?: string
  contentClassName?: string
}

export function ContentPage({
  eyebrow,
  title,
  description,
  children,
  size = 'md',
  density = 'default',
  className,
  contentClassName,
}: ContentPageProps) {
  const isEditorDensity = density === 'editor'

  return (
    <div className={cn('app-backdrop relative isolate min-h-full overflow-hidden', className)}>
      <Container size={size} className={cn('relative', isEditorDensity ? 'py-8 sm:py-10 lg:py-12' : 'py-12 sm:py-16 lg:py-20')}>
        <header className={cn('max-w-3xl', isEditorDensity && 'max-w-2xl')}>
          <p className="editor-meta">{eyebrow}</p>
          {title && (
            <h1 className={cn(
              'font-display font-bold text-foreground',
              isEditorDensity
                ? 'mt-2 max-w-none text-xl leading-7 tracking-[0.01em]'
                : 'mt-3 max-w-[18ch] text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.08] tracking-[0.02em]',
            )}>
              {title}
            </h1>
          )}
          {description && (
            <p className={cn(
              'font-body text-muted-foreground',
              isEditorDensity ? 'mt-2 max-w-[31rem] text-sm leading-5' : 'mt-5 max-w-[62ch] text-base leading-7 sm:text-lg',
            )}>
              {description}
            </p>
          )}
        </header>
        <div className={cn(isEditorDensity ? 'mt-8 sm:mt-10' : 'mt-10 sm:mt-14', contentClassName)}>{children}</div>
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
      {title && <h2 className="mt-3 font-display text-xl font-bold leading-tight tracking-[0.02em] text-foreground">{title}</h2>}
      <div className={cn(eyebrow || title ? 'mt-5' : undefined, 'font-body text-base leading-7 text-foreground/80 [&>h2]:font-display [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2:not(:first-child)]:mt-8 [&>p]:text-foreground/75')}>
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
      <h2 className="mt-3 font-display text-xl font-bold leading-tight tracking-[0.02em] text-foreground">{title}</h2>
      <div className="mt-4 font-body text-base leading-7 text-foreground/80">{children}</div>
    </section>
  )
}
