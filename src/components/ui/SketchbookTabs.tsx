import React from 'react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SketchbookTabsList({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <TabsList className={`flex w-full h-10 p-1 bg-surface-inset/70 border border-line-soft rounded-md ${className}`}>
      {children}
    </TabsList>
  )
}

export function SketchbookTabsTrigger({ value, children, className = '' }: { value: string, children: React.ReactNode, className?: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className={`flex-1 text-xs h-full rounded-sm font-semibold text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-subtle ${className}`}
    >
      {children}
    </TabsTrigger>
  )
}
