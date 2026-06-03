import React from 'react'
import { Container } from '@/components/layout/Container'

export function PrivacyJa() {
  return (
    <Container size="sm" className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">プライバシーポリシー</h1>
      <div className="prose dark:prose-invert">
        <h2 className="text-xl font-semibold tracking-tight">収集する個人情報</h2>
        <p className="mb-4">XIV Frameは会員登録を必要とせず、サーバーに画像をアップロードしたり保存したりすることはありません。すべての画像処理とファイルのダウンロードは、お使いのブラウザ（クライアント側）内でローカルに行われます。</p>
        <h2 className="text-xl font-semibold tracking-tight">クッキーとローカルストレージ</h2>
        <p className="mb-4">お客様の利便性のため、設定（言語、レイアウトオプションなど）はお使いのブラウザのローカルストレージに一時的に保存される場合があります。</p>
        <h2 className="text-xl font-semibold tracking-tight">お問い合わせ</h2>
        <p className="mb-4">ご不明な点がございましたら、サービス提供者までお問い合わせください。</p>
      </div>
    </Container>
  )
}
