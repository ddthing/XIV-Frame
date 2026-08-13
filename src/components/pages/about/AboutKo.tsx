import { DocumentPage } from '@/components/content/DocumentPage'
import Link from 'next/link'

export function AboutKo() {
  return (
    <DocumentPage
      eyebrow="04 / ABOUT"
      title="소개"
      description="XIV Frame이 무엇을 만들고, 이미지와 설정을 어떻게 다루는지 한눈에 확인하세요."
      updatedLabel="마지막 업데이트"
      updated="2026년 8월 13일"
      asideLabel="이 페이지"
      sections={[
        {
          id: 'what-is-xiv-frame',
          index: '01',
          title: 'XIV Frame이란?',
          children: (
            <>
              <p>XIV Frame은 파이널판타지14(FF14) 스크린샷을 한 장의 PNG로 구성하는 브라우저 기반 편집 도구입니다. 복잡한 이미지 편집 프로그램을 열지 않고도 여러 장의 스크린샷을 배치하고, 캐릭터 이름과 서버명 또는 로고를 더한 뒤 결과를 저장할 수 있습니다.</p>
              <ul>
                <li>스크린샷을 최대 4장까지 추가하고 순서를 바꿀 수 있습니다.</li>
                <li>분할, 세로, 그리드 레이아웃과 캔버스 비율을 조정할 수 있습니다.</li>
                <li>각 이미지의 배율과 위치를 직접 조정하고 텍스트 시그니처 또는 로고를 배치할 수 있습니다.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'who-it-is-for',
          index: '02',
          title: '어떤 작업에 유용한가요?',
          children: (
            <>
              <p>캐릭터의 앞·뒤 모습이나 의상 디테일을 함께 보여주고 싶을 때, 하우징·글래머·스튜디오 촬영 결과를 정리할 때, 또는 SNS에 올릴 한 장의 쇼케이스 이미지를 만들 때 사용할 수 있습니다.</p>
              <p>처음에는 <strong>사진 추가 → 레이아웃 선택 → 시그니처 조정 → PNG 저장</strong> 순서로 사용하면 됩니다. 각 단계의 실제 조작은 <Link href="/ko/blog">가이드</Link>에서 화면 흐름에 맞춰 설명합니다.</p>
            </>
          ),
        },
        {
          id: 'data-and-storage',
          index: '03',
          title: '이미지와 설정은 어떻게 처리하나요?',
          children: (
            <>
              <p>업로드한 스크린샷은 브라우저에서 읽어 캔버스에 표시하며, 현재 편집기에는 회원가입이나 이미지 서버 업로드 기능이 없습니다. 스크린샷 파일 자체는 새로고침 후 다시 선택해야 합니다.</p>
              <p>레이아웃, 시그니처 문구, 위치와 같은 설정은 다음 방문에 편리하도록 브라우저의 로컬 저장소에 남을 수 있습니다. 업로드한 로고는 크기를 줄인 데이터로 로컬 저장소에 보관되므로, 공용 컴퓨터에서는 작업 후 브라우저 데이터를 확인해 주세요.</p>
            </>
          ),
        },
        {
          id: 'open-source-and-rights',
          index: '04',
          title: '오픈 소스와 권리 안내',
          children: (
            <>
              <p>XIV Frame의 소스 코드는 <a href="https://github.com/ddthing/XIV-Frame" target="_blank" rel="noopener noreferrer">GitHub 저장소</a>에서 확인할 수 있습니다. 오류 제보와 사용성 피드백은 <Link href="/ko/contact">문의 페이지</Link>를 통해 보내주세요.</p>
              <p>파이널판타지14와 관련된 게임 콘텐츠 및 상표의 권리는 각 권리자에게 있습니다. XIV Frame은 Square Enix와 제휴하거나 공식적으로 승인된 서비스가 아닙니다.</p>
            </>
          ),
        },
      ]}
    />
  )
}
