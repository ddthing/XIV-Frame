import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { ContentPage } from '@/components/layout/ContentPage'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface FaqItem {
  question: string
  answer: ReactNode
}

export interface FaqGroup {
  number: string
  title: string
  items: FaqItem[]
}

interface FaqPageProps {
  eyebrow: string
  title: string
  description: string
  groups: FaqGroup[]
  helpLabel: string
  helpTitle: string
  helpDescription: string
  helpButton: string
  locale: string
}

export function FaqPage({
  eyebrow,
  title,
  description,
  groups,
  helpLabel,
  helpTitle,
  helpDescription,
  helpButton,
  locale,
}: FaqPageProps) {
  return (
    <ContentPage eyebrow={eyebrow} title={title} description={description} size="lg" density="editor">
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <section key={group.number} className={cn('rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-6', group.number === '03' && 'lg:col-span-2')} aria-labelledby={`faq-group-${group.number}`}>
          <div className="flex items-baseline gap-3 border-b border-border pb-4">
            <span className="editor-meta">{group.number}</span>
            <h2 id={`faq-group-${group.number}`} className="font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{group.title}</h2>
          </div>
          <div className={cn('divide-y divide-border', group.number === '03' && 'lg:grid lg:grid-cols-2 lg:gap-x-8 lg:divide-y-0 [&>details]:border-b [&>details]:border-border')}>
            {group.items.map((item) => (
              <details key={item.question} className="group py-1 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 font-body text-[15px] font-semibold leading-6 text-foreground marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span aria-hidden="true" className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-border font-body text-sm font-normal text-muted-foreground transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="pb-4 pr-8 font-body text-[15px] leading-7 text-foreground/75 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
          </section>
        ))}
      </div>

      <section className="mt-8 flex flex-col gap-4 rounded-xl border border-primary/15 bg-sticky-note-mint p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-labelledby="faq-help-title">
        <div>
          <p className="editor-meta">{helpLabel}</p>
          <h2 id="faq-help-title" className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{helpTitle}</h2>
          <p className="mt-2 max-w-xl font-body text-[13px] leading-5 text-foreground/75">{helpDescription}</p>
        </div>
        <Link href={`/${locale}/contact`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-body text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sticky-note-mint">
          {helpButton}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </ContentPage>
  )
}
