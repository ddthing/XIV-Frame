import React from 'react'
import { Container } from '@/components/layout/Container'

export function ContactJa() {
  return (
    <Container size="sm" className="py-12 lg:py-24">
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-8 text-foreground">お問い合わせ</h1>
      <div className="prose dark:prose-invert  max-w-none">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">連絡先</h2>
        <p className="text-muted-foreground leading-relaxed">
          ご質問がある場合やバグを見つけた場合は、以下の方法でお気軽にお問い合わせください。
        </p>
        <div className="mt-8 flex gap-4">
          <a href="https://coner.luv3r.me/" target="_blank" rel="noopener noreferrer" className="bg-foreground text-background px-6 py-3 rounded-full font-medium hover:bg-foreground/90 transition-colors">
            問題を報告
          </a>
          <a href="https://x.com/reconeur" target="_blank" rel="noopener noreferrer" className="bg-muted text-foreground px-6 py-3 rounded-full font-medium hover:bg-muted/80 transition-colors">
            X (Twitter)
          </a>
        </div>
      </div>
    </Container>
  )
}
