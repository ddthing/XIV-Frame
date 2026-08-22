import React from 'react'
import { ContentPage } from '@/components/layout/ContentPage'

export interface DocumentSection {
  id: string
  index: string
  title: string
  children: React.ReactNode
}

interface DocumentPageProps {
  eyebrow: string
  title: string
  description: string
  updatedLabel: string
  updated: string
  sections: DocumentSection[]
  asideLabel: string
  className?: string
}

export function DocumentPage({
  eyebrow,
  title,
  description,
  updatedLabel,
  updated,
  sections,
  asideLabel,
  className,
}: DocumentPageProps) {
  return (
    <ContentPage eyebrow={eyebrow} title={title} description={description} size="lg" density="editor" className={className}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start lg:gap-12">
        <article className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-5 font-body text-xs text-muted-foreground">
            <span className="editor-meta">{updatedLabel}</span>
            <time dateTime="2026-08-22">{updated}</time>
          </div>

          <div className="mt-1 divide-y divide-border">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 py-7 first:pt-6 last:pb-2">
                <div className="flex items-baseline gap-3">
                  <span className="editor-meta shrink-0">{section.index}</span>
                  <h2 className="font-display text-lg font-bold leading-7 tracking-[0.01em] text-foreground sm:text-xl">{section.title}</h2>
                </div>
                <div className="mt-4 space-y-4 font-body text-[15px] leading-7 text-foreground/78 [&>p]:max-w-[68ch] [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-5 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-foreground">
                  {section.children}
                </div>
              </section>
            ))}
          </div>
        </article>

        <aside className="lg:sticky lg:top-24">
          <p className="editor-meta">{asideLabel}</p>
          <nav className="mt-3 border-l border-border pl-4" aria-label={asideLabel}>
            <ol className="space-y-2.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="font-body text-xs leading-5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <span className="mr-2 font-mono text-[10px]">{section.index}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>
    </ContentPage>
  )
}
