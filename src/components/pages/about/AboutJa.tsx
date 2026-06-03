import React from 'react'
import { Container } from '@/components/layout/Container'

export function AboutJa() {
  return (
    <Container size="sm" className="py-12 lg:py-24">
      <h1 className="text-5xl lg:text-6xl font-normal tracking-tight mb-8 text-foreground">概要</h1>
      <div className="prose dark:prose-invert prose-lg max-w-none">
        <h2 className="text-2xl font-normal tracking-tight text-foreground">ミッション</h2>
        <p className="text-muted-foreground leading-relaxed">
          XIV Frameは、ファイナルファンタジーXIVのプレイヤー向けのプレミアムなスクリーンショットフォーマットツールです。複雑な画像編集ソフトウェアを使わずに、ブラウザで簡単に素晴らしいスクリーンショットを作成できます。
        </p>
        <h2 className="text-2xl font-normal tracking-tight text-foreground">オープンソース</h2>
        <p className="text-muted-foreground leading-relaxed">
          このプロジェクトはオープンソースであり、GitHubで公開されています。コミュニティからの貢献やフィードバックを歓迎します。デザインシステムは、すべてのデバイスで完璧な体験を提供するために緻密に設計されています。
        </p>
      </div>
    </Container>
  )
}
