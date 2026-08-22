import React from 'react'
import { ContentPage, ContentPanel } from '@/components/layout/ContentPage'

export function ContactEn() {
  return (
    <ContentPage eyebrow="05 / CONTACT" title="Contact" description="Send a bug report or product feedback and help shape the next update." size="md" density="editor">
      <ContentPanel className="max-w-3xl [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:text-foreground/75">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">What should I include?</h2>
        <p className="text-muted-foreground leading-relaxed">Include your browser and device, the file type you selected, and the steps that reproduce the issue. A screenshot is helpful when available.</p>
        <ol className="mt-5 grid gap-3 border-y border-border py-5 font-body text-sm leading-6 text-foreground/75">
          <li><strong className="mr-2 text-foreground">01</strong>Name the screen and control you used.</li>
          <li><strong className="mr-2 text-foreground">02</strong>Compare the result you expected with what appeared.</li>
          <li><strong className="mr-2 text-foreground">03</strong>Include the error text, frequency, and whether it happened on desktop or mobile.</li>
        </ol>
        <p className="text-sm leading-6 text-muted-foreground">If a source screenshot contains another person&apos;s name or conversation, remove or hide it before sharing. The report link opens an external service with its own policies.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href="https://coner.luv3r.me/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Report a bug
          </a>
          <a href="https://x.com/reconeur" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            X (Twitter)
          </a>
        </div>
      </ContentPanel>
    </ContentPage>
  )
}
