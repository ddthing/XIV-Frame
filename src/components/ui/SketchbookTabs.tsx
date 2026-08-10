import React from 'react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SketchbookTabsList({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <TabsList className={`grid w-full grid-cols-2 gap-1.5 rounded-xl border border-border bg-surface-inset/70 p-1.5 ${className}`}>
      {children}
    </TabsList>
  )
}

export function SketchbookTabsTrigger({ value, children, className = '' }: { value: string, children: React.ReactNode, className?: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className={`flex min-h-9 h-full items-center justify-center rounded-lg border border-transparent px-3 text-xs font-semibold text-muted-foreground transition-[background-color,border-color,box-shadow,color] hover:bg-background/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 after:!hidden data-[state=active]:border-primary/25 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-subtle data-active:border-primary/25 data-active:bg-card data-active:text-foreground data-active:shadow-subtle ${className}`}
    >
      {children}
    </TabsTrigger>
  )
}
