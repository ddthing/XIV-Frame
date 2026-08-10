import React from 'react'
import { ContentPage } from '@/components/layout/ContentPage'

export function PrivacyJa() {
  return (
    <ContentPage eyebrow="06 / PRIVACY" size="sm" contentClassName="!mt-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">プライバシーポリシー</h1>
      <div className="max-w-2xl space-y-8 text-base leading-7 text-foreground/80 [&>h2]:border-t [&>h2]:border-border [&>h2]:pt-6 [&>h2:first-child]:border-t-0 [&>h2:first-child]:pt-0 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:-mt-5">
        <h2 className="text-xl font-semibold tracking-tight">収集する個人情報</h2>
        <p className="mb-4">XIV Frameは会員登録を必要とせず、サーバーに画像をアップロードしたり保存したりすることはありません。すべての画像処理とファイルのダウンロードは、お使いのブラウザ（クライアント側）内でローカルに行われます。</p>
        <h2 className="text-xl font-semibold tracking-tight">クッキーとローカルストレージ</h2>
        <p className="mb-4">お客様の利便性のため、設定（言語、レイアウトオプションなど）はお使いのブラウザのローカルストレージに一時的に保存される場合があります。</p>
        <h2 className="text-xl font-semibold tracking-tight">お問い合わせ</h2>
        <p className="mb-4">ご不明な点がございましたら、サービス提供者までお問い合わせください。</p>
      </div>
    </ContentPage>
  )
}
