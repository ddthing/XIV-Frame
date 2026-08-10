import React from 'react'
import { ContentPage } from '@/components/layout/ContentPage'

export function TermsEn() {
  return (
    <ContentPage eyebrow="07 / TERMS" size="sm" contentClassName="!mt-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">Terms of Service</h1>
      <div className="max-w-2xl space-y-8 text-base leading-7 text-foreground/80 [&>h2]:border-t [&>h2]:border-border [&>h2:first-child]:border-t-0 [&>h2:first-child]:pt-0 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:-mt-5">
        <h2 className="text-xl font-semibold tracking-tight">Service Usage</h2>
        <p className="mb-4">XIV Frame is a free web service provided for the purpose of decorating Final Fantasy XIV screenshots.</p>
        <h2 className="text-xl font-semibold tracking-tight">Disclaimer</h2>
        <p className="mb-4">The copyright and responsibility for images generated through this service lie entirely with the user who created them. The service provider may change or suspend the contents of the service without prior notice.</p>
      </div>
    </ContentPage>
  )
}
