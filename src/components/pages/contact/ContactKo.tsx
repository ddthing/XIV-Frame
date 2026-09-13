import React from 'react'
import { ExternalLink } from '@/components/content/ExternalLink'
import { ContentPage, ContentPanel } from '@/components/layout/ContentPage'

export function ContactKo() {
  return (
    <ContentPage eyebrow="05 / CONTACT" title="문의" description="문제가 생긴 상황과 사용 중인 환경을 보내주시면 원인을 확인하겠습니다." size="md" density="editor">
      <ContentPanel className="max-w-3xl [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:text-foreground/75">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">어떤 내용을 보내면 좋나요?</h2>
        <p className="text-muted-foreground leading-relaxed">사용 중인 브라우저와 기기, 선택한 파일 형식, 문제가 재현되는 순서를 함께 보내주세요. 화면 캡처가 있으면 확인이 더 쉽습니다.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ExternalLink href="https://coner.luv3r.me/" newWindowLabel="새 탭에서 열림" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            버그 제보하기
          </ExternalLink>
          <ExternalLink href="https://x.com/reconeur" newWindowLabel="새 탭에서 열림" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            X (Twitter)
          </ExternalLink>
        </div>
      </ContentPanel>
    </ContentPage>
  )
}
