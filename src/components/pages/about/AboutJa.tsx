import React from 'react'
import { ContentPage, ContentPanel } from '@/components/layout/ContentPage'

export function AboutJa() {
  return (
    <ContentPage eyebrow="04 / ABOUT" size="md" contentClassName="!mt-8">
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-8 text-foreground">概要</h1>
      <ContentPanel className="max-w-3xl [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2:not(:first-child)]:mt-8 [&>p]:text-foreground/75">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ミッション</h2>
        <p className="text-muted-foreground leading-relaxed">
          XIV Frameは、ファイナルファンタジーXIVのプレイヤー向けのプレミアムなスクリーンショットフォーマットツールです。複雑な画像編集ソフトウェアを使わずに、ブラウザで簡単に素晴らしいスクリーンショットを作成できます。
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">オープンソース</h2>
        <p className="text-muted-foreground leading-relaxed">
          このプロジェクトはオープンソースであり、GitHubで公開されています。コミュニティからの貢献やフィードバックを歓迎します。デザインシステムは、すべてのデバイスで完璧な体験を提供するために緻密に設計されています。
        </p>
      </ContentPanel>
    </ContentPage>
  )
}
