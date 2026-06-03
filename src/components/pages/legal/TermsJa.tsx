import React from 'react'
import { Container } from '@/components/layout/Container'

export function TermsJa() {
  return (
    <Container size="sm" className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">利用規約</h1>
      <div className="prose dark:prose-invert">
        <h2 className="text-xl font-semibold tracking-tight">サービスの利用</h2>
        <p className="mb-4">XIV Frameは、ファイナルファンタジーXIVのスクリーンショットを装飾する目的で提供される無料のウェブサービスです。</p>
        <h2 className="text-xl font-semibold tracking-tight">免責事項</h2>
        <p className="mb-4">本サービスを通じて生成された画像の著作権および責任は、画像を生成したユーザーに完全に帰属します。サービス提供者は、事前の通知なしにサービスの内容を変更または一時停止する場合があります。</p>
      </div>
    </Container>
  )
}
