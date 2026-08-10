import React from 'react'
import { ContentPage } from '@/components/layout/ContentPage'

export function PrivacyKo() {
  return (
    <ContentPage eyebrow="06 / PRIVACY" size="sm" contentClassName="!mt-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">개인정보처리방침</h1>
      <div className="max-w-2xl space-y-8 text-base leading-7 text-foreground/80 [&>h2]:border-t [&>h2]:border-border [&>h2]:pt-6 [&>h2:first-child]:border-t-0 [&>h2:first-child]:pt-0 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:-mt-5">
        <h2 className="text-xl font-semibold tracking-tight">수집하는 개인정보</h2>
        <p className="mb-4">XIV Frame은 회원가입을 요구하지 않으며, 서버에 이미지를 업로드하거나 저장하지 않습니다. 모든 이미지 처리 및 파일 다운로드는 사용자의 브라우저(클라이언트) 내부에서만 이루어집니다.</p>
        <h2 className="text-xl font-semibold tracking-tight">쿠키 및 로컬 스토리지</h2>
        <p className="mb-4">사용자의 편의를 위해 설정 내역(언어, 레이아웃 옵션 등)은 브라우저의 로컬 스토리지에 임시 저장될 수 있습니다.</p>
        <h2 className="text-xl font-semibold tracking-tight">문의</h2>
        <p className="mb-4">관련 문의 사항은 서비스 제공자에게 문의해 주시기 바랍니다.</p>
      </div>
    </ContentPage>
  )
}
