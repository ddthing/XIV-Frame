import React from 'react'
import { ContentPage, ContentPanel } from '@/components/layout/ContentPage'

export function ContactJa() {
  return (
    <ContentPage eyebrow="05 / CONTACT" size="md" contentClassName="!mt-8">
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-8 text-foreground">お問い合わせ</h1>
      <ContentPanel className="max-w-3xl [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:text-foreground/75">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">連絡先</h2>
        <p className="text-muted-foreground leading-relaxed">
          ご質問がある場合やバグを見つけた場合は、以下の方法でお気軽にお問い合わせください。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="https://coner.luv3r.me/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            問題を報告
          </a>
          <a href="https://x.com/reconeur" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            X (Twitter)
          </a>
        </div>
      </ContentPanel>
    </ContentPage>
  )
}
