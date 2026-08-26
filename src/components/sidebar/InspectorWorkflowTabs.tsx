import type { LucideIcon } from 'lucide-react'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface InspectorWorkflowTab {
  value: string
  label: string
  role: string
  icon: LucideIcon
}

interface InspectorWorkflowTabsProps {
  ariaLabel: string
  tabs: readonly InspectorWorkflowTab[]
}

export function InspectorWorkflowTabs({ ariaLabel, tabs }: InspectorWorkflowTabsProps) {
  return (
    <TabsList
      aria-label={ariaLabel}
      data-xiv-frame-workflow-tabs="true"
      className="grid min-h-20 w-full min-w-0 grid-cols-3 gap-1.5 rounded-xl border border-border bg-surface-inset/70 p-1.5"
    >
      {tabs.map(({ value, label, role, icon: Icon }, index) => (
        <TabsTrigger
          key={value}
          value={value}
          aria-label={`${label} · ${role}`}
          title={`${label} · ${role}`}
          className="group min-h-16 min-w-0 flex-col items-stretch justify-center gap-1 rounded-lg border border-transparent bg-transparent px-2 py-2 text-left text-muted-foreground shadow-none transition-[background-color,border-color,box-shadow,color] hover:bg-background/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 after:!hidden data-[state=active]:border-primary/25 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-subtle data-active:border-primary/25 data-active:bg-card data-active:text-foreground data-active:shadow-subtle"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          </span>
          <span className="block min-w-0 max-w-full truncate text-[13px] font-semibold leading-4">
            {label}
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
  )
}
