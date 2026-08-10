import React from 'react'
import { ContentPage } from '@/components/layout/ContentPage'

export function TermsJa() {
  return (
    <ContentPage eyebrow="07 / TERMS" size="sm" contentClassName="!mt-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">利用規約</h1>
      <div className="max-w-2xl space-y-8 text-base leading-7 text-foreground/80 [&>h2]:border-t [&>h2]:border-border [&>h2]:pt-6 [&>h2:first-child]:border-t-0 [&>h2:first-child]:pt-0 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:-mt-5">
        <h2 className="text-xl font-semibold tracking-tight">サービスの利用</h2>
        <p className="mb-4">XIV Frameは、ファイナルファンタジーXIVのスクリーンショットを装飾する目的で提供される無料のウェブサービスです。</p>
        <h2 className="text-xl font-semibold tracking-tight">免責事項</h2>
        <p className="mb-4">本サービスを通じて生成された画像の著作権および責任は、画像を生成したユーザーに完全に帰属します。サービス提供者は、事前の通知なしにサービスの内容を変更または一時停止する場合があります。</p>
      </div>
    </ContentPage>
  )
}
