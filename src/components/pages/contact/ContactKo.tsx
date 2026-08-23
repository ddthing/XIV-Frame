import React from 'react'
import { ContentPage, ContentPanel } from '@/components/layout/ContentPage'

export function ContactKo() {
  return (
    <ContentPage eyebrow="05 / CONTACT" title="문의" description="버그 제보와 사용성 피드백을 보내주시면 다음 업데이트에 반영하겠습니다." size="md" density="editor">
      <ContentPanel className="max-w-3xl [&>h2]:font-display [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:text-foreground/75">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">어떤 내용을 보내면 좋나요?</h2>
        <p className="text-muted-foreground leading-relaxed">사용 중인 브라우저와 기기, 선택한 파일 형식, 문제가 재현되는 순서를 함께 보내주세요. 화면 캡처가 있으면 확인이 더 쉽습니다.</p>
        <ol className="mt-5 grid gap-3 border-y border-border py-5 font-body text-sm leading-6 text-foreground/75">
          <li><strong className="mr-2 text-foreground">01</strong>어떤 화면에서 어떤 기능을 눌렀는지 적어주세요.</li>
          <li><strong className="mr-2 text-foreground">02</strong>기대했던 결과와 실제로 보인 결과를 비교해 주세요.</li>
          <li><strong className="mr-2 text-foreground">03</strong>오류 문구, 재현 빈도, 모바일·데스크톱 여부를 함께 보내주세요.</li>
        </ol>
        <p className="text-sm leading-6 text-muted-foreground">원본 스크린샷에 다른 사람의 이름이나 대화가 포함되어 있다면, 공유 전에 해당 정보를 가려 주세요. 문의 링크는 외부 서비스로 열리며 그 서비스의 정책이 함께 적용됩니다.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href="https://coner.luv3r.me/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            버그 제보하기
          </a>
          <a href="https://x.com/reconeur" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            X (Twitter)
          </a>
        </div>
      </ContentPanel>
    </ContentPage>
  )
}
