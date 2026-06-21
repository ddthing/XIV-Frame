import React from 'react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SketchbookTabsList({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <TabsList className={`flex w-full h-10 p-1 bg-transparent border border-primary/10 rounded-[8px] ${className}`}>
      {children}
    </TabsList>
  )
}

export function SketchbookTabsTrigger({ value, children, className = '' }: { value: string, children: React.ReactNode, className?: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className={`flex-1 text-[13px] h-full rounded-[6px] font-medium text-primary/60 transition-all data-[state=active]:bg-accent data-[state=active]:text-primary data-[state=active]:font-bold ${className}`}
    >
      {children}
    </TabsTrigger>
  )
}
