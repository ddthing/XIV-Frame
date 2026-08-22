import { DocumentPage } from '@/components/content/DocumentPage'
import Link from 'next/link'

export function PrivacyKo() {
  return (
    <DocumentPage
      eyebrow="06 / PRIVACY"
      title="개인정보처리방침"
      description="XIV Frame이 편집 이미지, 브라우저 설정, 외부 리소스와 현재 광고 미제공 상태를 어떻게 다루는지 설명합니다."
      updatedLabel="시행일"
      updated="2026년 8월 22일"
      asideLabel="목차"
      sections={[
        {
          id: 'scope',
          index: '01',
          title: '적용 범위',
          children: (
            <>
              <p>이 방침은 XIV Frame 웹사이트와 브라우저 기반 편집 기능에 적용됩니다. 회원가입, 로그인, 유료 결제 기능은 현재 제공하지 않습니다.</p>
              <p>이용자가 외부 링크를 통해 X, GitHub, Ko-fi 또는 문의 서비스로 이동한 경우에는 해당 서비스의 개인정보처리방침이 적용됩니다.</p>
            </>
          ),
        },
        {
          id: 'images-and-editor',
          index: '02',
          title: '업로드 이미지와 편집 데이터',
          children: (
            <>
              <p>스크린샷은 브라우저에서 읽어 캔버스에 표시하고 합성합니다. 현재 XIV Frame은 스크린샷을 서버에 업로드하거나 계정에 저장하는 기능을 제공하지 않습니다. 스크린샷은 페이지를 새로고침하면 다시 선택해야 합니다.</p>
              <p>레이아웃, 캔버스 비율, 시그니처 문구·위치·스타일 같은 편집 설정은 다음 방문에 사용할 수 있도록 브라우저의 로컬 저장소에 보관될 수 있습니다. 업로드한 로고는 브라우저에서 크기를 조정한 뒤 로컬 데이터로 저장될 수 있습니다. 이 데이터는 XIV Frame 서버에서 조회할 수 없습니다.</p>
            </>
          ),
        },
        {
          id: 'technical-requests',
          index: '03',
          title: '접속 기록과 외부 리소스',
          children: (
            <>
              <p>웹사이트를 제공·보호하는 호스팅 또는 CDN은 요청 처리와 보안을 위해 IP 주소, 브라우저 정보, 요청 시간, 요청한 경로와 같은 기술 정보를 자체적으로 기록할 수 있습니다. XIV Frame 운영자는 편집 이미지의 내용을 이 기록과 연결해 프로필을 만들지 않습니다.</p>
              <p>페이지에는 글꼴이나 아이콘을 제공하는 외부 리소스가 포함될 수 있습니다. 현재 공개 페이지는 Google 광고 태그를 로드하지 않습니다. 외부 리소스를 불러오면 해당 제공자가 요청에 필요한 정보를 처리할 수 있으며, 각 제공자의 정책이 함께 적용됩니다.</p>
            </>
          ),
        },
        {
          id: 'ads-and-cookies',
          index: '04',
          title: '쿠키와 Google 광고',
          children: (
            <>
              <p>현재 XIV Frame은 광고 슬롯과 Google 광고 태그를 제공하지 않습니다. 따라서 이 버전에서는 Google 광고 제공을 위한 광고 쿠키를 목적으로 정보를 수집하지 않습니다.</p>
              <p>향후 광고를 도입할 경우, 광고 제공 전에 Google의 동의 요구사항과 관련 법령을 검토하고, 필요한 동의 관리 화면·제공자 공개·쿠키 안내를 먼저 적용합니다. 광고는 메뉴나 다운로드 버튼처럼 보이게 배치하지 않습니다.</p>
              <p>광고를 다시 제공하는 버전은 이 정책의 시행일과 광고 제공 상태를 함께 갱신한 뒤 공개합니다.</p>
            </>
          ),
        },
        {
          id: 'your-controls',
          index: '05',
          title: '이용자가 할 수 있는 조치',
          children: (
            <>
              <p>브라우저 설정에서 로컬 저장소와 쿠키를 삭제하거나 차단할 수 있습니다. 다만 로컬 저장소를 삭제하면 저장된 레이아웃·시그니처·로고 설정이 초기화될 수 있습니다.</p>
              <p>개인정보, 서비스 이용, 정책 관련 문의는 <Link href="/ko/contact">문의 페이지</Link>를 이용해 주세요. 외부 서비스가 직접 처리한 정보의 열람·삭제 요청은 해당 서비스에 문의해야 합니다.</p>
            </>
          ),
        },
        {
          id: 'changes-and-contact',
          index: '06',
          title: '방침 변경과 문의',
          children: (
            <>
              <p>공개 운영 식별자는 <strong>ddthing / XIV Frame</strong>입니다. 소스 코드와 변경 이력은 <a href="https://github.com/ddthing/XIV-Frame" target="_blank" rel="noopener noreferrer">GitHub 저장소</a>에서 확인할 수 있습니다. 개인정보 관련 문의는 <Link href="/ko/contact">문의 페이지</Link>로 보내 주세요.</p>
              <p>서비스 기능, 광고 제공 방식 또는 관련 법령이 바뀌면 이 방침을 갱신할 수 있습니다. 변경된 내용은 이 페이지의 시행일과 함께 게시합니다.</p>
              <p>최종 업데이트: 2026년 8월 22일</p>
            </>
          ),
        },
      ]}
    />
  )
}
