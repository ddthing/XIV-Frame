import Link from 'next/link'
import { ClipboardCheck, LayoutGrid, WandSparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type ScenarioKind = 'showcase' | 'composite' | 'publish'

export interface GuideScenario {
  kind: ScenarioKind
  eyebrow: string
  title: string
  description: string
  decisionLabel: string
  decision: string
  href: string
  linkLabel: string
}

interface GuideScenariosProps {
  eyebrow: string
  title: string
  description: string
  scenarios: GuideScenario[]
}

const scenarioIcons: Record<ScenarioKind, LucideIcon> = {
  showcase: LayoutGrid,
  composite: WandSparkles,
  publish: ClipboardCheck,
}

function ScenarioPreview({ kind }: { kind: ScenarioKind }) {
  if (kind === 'showcase') {
    return (
      <div className="grid h-full grid-cols-2 gap-1.5 p-3">
        <div className="row-span-2 rounded-md border border-primary/20 bg-primary/15" />
        <div className="rounded-md border border-primary/15 bg-primary/5" />
        <div className="rounded-md border border-primary/15 bg-accent/70" />
      </div>
    )
  }

  if (kind === 'composite') {
    return (
      <div className="relative h-full overflow-hidden p-3">
        <div className="absolute inset-x-6 bottom-3 top-3 rounded-md border border-primary/15 bg-primary/5" />
        <div className="absolute bottom-4 left-1/2 grid size-16 -translate-x-1/2 place-items-center rounded-full border border-primary/25 bg-accent/80 shadow-subtle">
          <WandSparkles className="size-5 text-primary/75" aria-hidden="true" />
        </div>
        <div className="absolute right-5 top-5 h-1.5 w-12 rounded-full bg-primary/30" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col justify-center gap-2 p-4">
      <div className="flex items-center gap-2 rounded-md border border-primary/15 bg-primary/5 px-3 py-2">
        <span className="size-2 rounded-full bg-primary/70" />
        <span className="h-1.5 flex-1 rounded-full bg-primary/20" />
      </div>
      <div className="flex items-center gap-2 rounded-md border border-primary/15 bg-card px-3 py-2">
        <span className="size-2 rounded-full border border-primary/40" />
        <span className="h-1.5 w-2/3 rounded-full bg-primary/15" />
      </div>
      <div className="ml-auto h-1.5 w-16 rounded-full bg-primary/35" />
    </div>
  )
}

export function GuideScenarios({ eyebrow, title, description, scenarios }: GuideScenariosProps) {
  return (
    <section className="mb-12" aria-labelledby="guide-scenarios-title">
      <div className="flex flex-col gap-3 border-y border-border py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:py-7">
        <div>
          <p className="editor-meta">{eyebrow}</p>
          <h2 id="guide-scenarios-title" className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground sm:text-2xl sm:leading-8">{title}</h2>
        </div>
        <p className="max-w-[38rem] font-body text-sm leading-6 text-muted-foreground sm:text-[15px]">{description}</p>
      </div>

      <div className="grid gap-4 pt-6 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const Icon = scenarioIcons[scenario.kind]
          return (
            <article key={scenario.kind} className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-subtle transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-subtle-2 sm:p-5">
              <div className="relative overflow-hidden rounded-lg border border-border bg-surface-inset/55">
                <div className="absolute left-2.5 top-2.5 z-10 grid size-8 place-items-center rounded-md border border-primary/15 bg-background/90 text-primary/75">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <div className="h-32 transition-transform duration-300 group-hover:scale-[1.03]" aria-hidden="true">
                  <ScenarioPreview kind={scenario.kind} />
                </div>
              </div>
              <p className="editor-meta mt-4">{scenario.eyebrow}</p>
              <h3 className="mt-2 font-display text-lg font-bold leading-7 tracking-[0.01em] text-foreground">{scenario.title}</h3>
              <p className="mt-2 font-body text-sm leading-6 text-foreground/75">{scenario.description}</p>
              <div className="mt-4 border-t border-border pt-3">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{scenario.decisionLabel}</p>
                <p className="mt-1 font-body text-sm leading-5 text-foreground/80">{scenario.decision}</p>
              </div>
              <Link href={scenario.href} className="mt-5 inline-flex items-center gap-2 font-body text-xs font-bold text-primary underline-offset-4 transition-colors hover:text-primary/70 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {scenario.linkLabel}
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
