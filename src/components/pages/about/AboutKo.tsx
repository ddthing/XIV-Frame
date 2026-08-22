import { DocumentPage } from '@/components/content/DocumentPage'
import { FeatureCoverageTable } from '@/components/content/FeatureCoverageTable'
import Link from 'next/link'

export function AboutKo() {
  return (
    <DocumentPage
      eyebrow="04 / ABOUT"
      title="소개"
      description="XIV Frame이 무엇을 만들고, 이미지와 설정을 어떻게 다루는지 한눈에 확인하세요."
      updatedLabel="마지막 업데이트"
      updated="2026년 8월 22일"
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
              <p>공개 운영 식별자는 <strong>ddthing / XIV Frame</strong>입니다. 소스 코드와 변경 이력은 <a href="https://github.com/ddthing/XIV-Frame" target="_blank" rel="noopener noreferrer">GitHub 저장소</a>에서 확인할 수 있으며, 오류 제보와 사용성 피드백은 <Link href="/ko/contact">문의 페이지</Link>를 통해 보내주세요.</p>
              <p>파이널판타지14와 관련된 게임 콘텐츠 및 상표의 권리는 각 권리자에게 있습니다. XIV Frame은 Square Enix와 제휴하거나 공식적으로 승인된 서비스가 아닙니다.</p>
            </>
          ),
        },
        {
          id: 'how-guides-are-maintained',
          index: '05',
          title: '가이드는 어떻게 관리하나요?',
          children: (
            <>
              <p>가이드는 기능 이름만 나열하는 문서가 아니라, 실제 편집 화면에서 하나의 결과를 완성하는 순서와 판단 기준을 설명하는 콘텐츠입니다. 사진 배치, 합성, 파일 용량, 게시 전 검수처럼 목적이 다른 작업은 별도 글로 나누어 같은 설명을 반복하지 않도록 구성합니다.</p>
              <p>기능이 바뀌면 본문과 수정일을 함께 검토합니다. 화면에서 확인되지 않는 기능을 안내하거나 검색어를 반복해 페이지를 부풀리지 않으며, 문제가 생겼을 때 재현 순서와 확인할 항목을 함께 제공합니다. 전체 글은 <Link href="/ko/blog">가이드 목록</Link>에서 확인할 수 있습니다.</p>
            </>
          ),
        },
        {
          id: 'supported-workflow',
          index: '06',
          title: '권장 작업 방식과 한계',
          children: (
            <>
              <p>처음에는 사진을 추가하고 레이아웃을 고른 다음 합성·시그니처·저장을 순서대로 진행하는 것이 가장 안정적입니다. 배경 제거처럼 기기 메모리를 사용하는 작업은 모바일에서 한 장씩 처리하고, 중요한 결과는 PNG로 저장해 별도로 보관하세요.</p>
              <p>XIV Frame은 편집 도구이지 이미지 권리나 게시 허가를 판단하는 서비스가 아닙니다. 다른 사람의 캐릭터·로고·대화가 포함된 이미지는 게시 전에 해당 권리와 동의를 직접 확인해야 합니다.</p>
            </>
          ),
        },
        {
          id: 'feature-coverage',
          index: '07',
          title: '현재 확인된 기능 범위',
          children: (
            <FeatureCoverageTable
              intro="2026년 8월 22일 현재 검수본을 기준으로 실제 편집 화면에서 확인한 기능과 한계입니다. 운영 배포본의 상태는 배포 후 다시 확인하며, 브라우저·기기별 메모리와 파일 상태에 따라 처리 시간은 달라질 수 있습니다."
              areaLabel="영역"
              supportLabel="지원 기능"
              notesLabel="사용 기준"
              rows={[
                { area: '입력 이미지', support: 'PNG · JPG · WebP', notes: '한 장 50MB 이하, 사진 최대 4장. 큰 이미지는 브라우저에서 편집용으로 최적화될 수 있습니다.' },
                { area: '레이아웃', support: '가로 분할 · 세로 분할 · 바둑판', notes: '자동 · 16:9 · 2:1 비율과 간격·테두리·배경을 조정합니다.' },
                { area: '합성', support: '배경 제거 · 지우기 · 복원 · 그림자', notes: '브라우저에서 처리하며 요소 크기는 25~500% 범위에서 조정합니다.' },
                { area: '정밀 이동', support: '데스크톱 방향키 · 모바일 미세조정', notes: '데스크톱은 1px/10px, 모바일은 버튼과 길게 누르기로 이동합니다.' },
                { area: '저장·보관', support: 'PNG 다운로드', notes: '스크린샷은 서버에 저장하지 않으며, 레이아웃·시그니처 설정은 브라우저에 남을 수 있습니다.' },
              ]}
            />
          ),
        },
      ]}
    />
  )
}
