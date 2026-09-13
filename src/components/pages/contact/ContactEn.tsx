import React from 'react'
import { ExternalLink } from '@/components/content/ExternalLink'
import { ContentPage, ContentPanel } from '@/components/layout/ContentPage'

export function ContactEn() {
  return (
    <ContentPage eyebrow="05 / CONTACT" title="Contact" description="Tell us what happened and what you were using when it happened." size="md" density="editor">
      <ContentPanel className="max-w-3xl [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:text-foreground/75">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">What should I include?</h2>
        <p className="text-muted-foreground leading-relaxed">Include your browser and device, the file type you selected, and the steps that reproduce the issue. A screenshot is helpful when available.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ExternalLink href="https://coner.luv3r.me/" newWindowLabel="opens in a new tab" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Report a bug
          </ExternalLink>
          <ExternalLink href="https://x.com/reconeur" newWindowLabel="opens in a new tab" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            X (Twitter)
          </ExternalLink>
        </div>
      </ContentPanel>
    </ContentPage>
  )
}
