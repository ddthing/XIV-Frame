import React from 'react'
import { ContentPage, ContentPanel } from '@/components/layout/ContentPage'

export function AboutKo() {
  return (
    <ContentPage eyebrow="04 / ABOUT" size="md" contentClassName="!mt-8">
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-8 text-foreground">소개</h1>
      <ContentPanel className="max-w-3xl [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2:not(:first-child)]:mt-8 [&>p]:text-foreground/75">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">우리의 미션</h2>
        <p className="text-muted-foreground leading-relaxed">
          XIV Frame은 파이널판타지14 플레이어를 위한 프리미엄 스크린샷 프레임 제작 도구입니다. 복잡한 사진 편집 프로그램 없이 브라우저에서 몇 번의 클릭만으로 멋진 스크린샷을 연출할 수 있습니다.
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">오픈 소스</h2>
        <p className="text-muted-foreground leading-relaxed">
          이 프로젝트는 깃허브에 완전히 오픈소스로 공개되어 있습니다. 여러분의 기여와 피드백을 언제나 환영합니다. 디자인 토큰, 컴포넌트 시스템, 글로벌 내비게이션은 모든 환경에서 완벽하게 동작하도록 정교하게 설계되었습니다.
        </p>
      </ContentPanel>
    </ContentPage>
  )
}
