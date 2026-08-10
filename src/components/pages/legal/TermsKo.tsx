import React from 'react'
import { ContentPage } from '@/components/layout/ContentPage'

export function TermsKo() {
  return (
    <ContentPage eyebrow="07 / TERMS" size="sm" contentClassName="!mt-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">이용약관</h1>
      <div className="max-w-2xl space-y-8 text-base leading-7 text-foreground/80 [&>h2]:border-t [&>h2]:border-border [&>h2]:pt-6 [&>h2:first-child]:border-t-0 [&>h2:first-child]:pt-0 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:-mt-5">
        <h2 className="text-xl font-semibold tracking-tight">서비스 이용</h2>
        <p className="mb-4">XIV Frame은 파이널판타지14 스크린샷 프레임 꾸미기를 목적으로 제공되는 무료 웹 서비스입니다.</p>
        <h2 className="text-xl font-semibold tracking-tight">면책 조항</h2>
        <p className="mb-4">본 서비스를 통해 생성된 이미지의 저작권 및 책임은 전적으로 이미지를 생성한 사용자에게 있습니다. 서비스 제공자는 사전 통지 없이 서비스의 내용을 변경하거나 중단할 수 있습니다.</p>
      </div>
    </ContentPage>
  )
}
