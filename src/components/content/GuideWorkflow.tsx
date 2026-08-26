import Link from 'next/link'
import { Download, ImagePlus, Type, WandSparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface GuideWorkflowStep {
  number: string
  label: string
  description: string
  href: string
  icon: LucideIcon
}

interface GuideWorkflowProps {
  eyebrow: string
  title: string
  description: string
  steps: GuideWorkflowStep[]
}

function StepPreview({ number }: { number: string }) {
  if (number === '01') {
    return (
      <div className="grid h-full grid-cols-3 gap-1.5 p-3">
        <div className="rounded-md border border-primary/15 bg-primary/10" />
        <div className="rounded-md border border-primary/15 bg-accent/70" />
        <div className="grid place-items-center rounded-md border border-dashed border-primary/25 bg-card text-primary/65">
          <ImagePlus className="size-4" aria-hidden="true" />
        </div>
      </div>
    )
  }

  if (number === '02') {
    return (
      <div className="flex h-full items-center justify-center gap-1.5 p-3">
        <div className="h-3/4 w-1/3 rounded-md border border-primary/20 bg-primary/10" />
        <div className="h-3/4 w-1/3 rounded-md border border-primary/20 bg-primary/5" />
        <div className="h-3/4 w-1/3 rounded-md border border-primary/20 bg-primary/10" />
      </div>
    )
  }

  if (number === '03') {
    return (
      <div className="flex h-full items-center justify-center gap-2 p-4">
        <div className="checkerboard grid h-3/4 w-1/3 place-items-center rounded-md border border-primary/20 bg-card">
          <ImagePlus className="size-4 text-primary/70" aria-hidden="true" />
        </div>
        <WandSparkles className="size-4 text-primary/70" aria-hidden="true" />
        <div className="h-3/4 w-1/3 rounded-md border border-dashed border-primary/25 bg-accent/60" />
      </div>
    )
  }

  if (number === '04') {
    return (
      <div className="flex h-full flex-col justify-center gap-2 p-4">
        <div className="flex items-center gap-2">
          <Type className="size-4 text-primary/75" aria-hidden="true" />
          <span className="h-1.5 w-20 rounded-full bg-primary/65" />
        </div>
        <div className="ml-6 h-1 w-14 rounded-full bg-primary/25" />
        <div className="ml-auto h-4 w-10 rounded-sm border border-primary/20 bg-accent/70" />
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-between gap-3 p-4">
      <div className="flex-1 space-y-2">
        <div className="h-2 w-full rounded-full bg-primary/15" />
        <div className="h-2 w-2/3 rounded-full bg-primary/10" />
      </div>
      <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
        <Download className="size-4" aria-hidden="true" />
      </div>
    </div>
  )
}

export function GuideWorkflow({ eyebrow, title, description, steps }: GuideWorkflowProps) {
  return (
    <section className="mb-12" aria-labelledby="guide-workflow-title">
      <div className="flex flex-col gap-3 border-y border-border py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:py-7">
        <div>
          <p className="editor-meta">{eyebrow}</p>
          <h2 id="guide-workflow-title" className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground sm:text-2xl sm:leading-8">{title}</h2>
        </div>
        <p className="max-w-[38rem] font-body text-sm leading-6 text-muted-foreground sm:text-[15px]">{description}</p>
      </div>

      <ol className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <li key={step.number} className="min-w-0">
              <Link
                href={step.href}
                className="group block h-full rounded-xl border border-border bg-card p-4 shadow-subtle transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-subtle-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-5"
              >
                <div className="relative overflow-hidden rounded-lg border border-border bg-surface-inset/55">
                  <div className="absolute left-2.5 top-2.5 z-10 grid size-8 place-items-center rounded-md border border-primary/15 bg-background/90 font-mono text-xs font-bold text-foreground">
                    {step.number}
                  </div>
                  <div className="h-32 transition-transform duration-300 group-hover:scale-[1.03] sm:h-36" aria-hidden="true">
                    <StepPreview number={step.number} />
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2.5">
                  <Icon className="mt-1 size-5 shrink-0 text-primary/70" aria-hidden="true" />
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold leading-7 tracking-[0.01em] text-foreground">{step.label}</h3>
                    <p className="mt-1.5 font-body text-sm leading-6 text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
