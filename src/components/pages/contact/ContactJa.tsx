import React from 'react'
import { ContentPage, ContentPanel } from '@/components/layout/ContentPage'

export function ContactJa() {
  return (
    <ContentPage eyebrow="05 / CONTACT" title="お問い合わせ" description="バグ報告や使い心地のフィードバックをお送りください。次回のアップデートに活用します。" size="md" density="editor">
      <ContentPanel className="max-w-3xl [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:text-foreground/75">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">何を送ればよいですか？</h2>
        <p className="text-muted-foreground leading-relaxed">使用ブラウザと端末、選択したファイル形式、問題が再現する手順を添えてください。可能であれば画面のスクリーンショットも役立ちます。</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href="https://coner.luv3r.me/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            バグを報告
          </a>
          <a href="https://x.com/reconeur" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            X (Twitter)
          </a>
        </div>
      </ContentPanel>
    </ContentPage>
  )
}
