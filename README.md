# XIV Frame

파이널판타지14 스크린샷을 한 장의 PNG로 구성하는 브라우저 기반 편집기입니다. 사진을 배치하고, 레이아웃과 시그니처를 조정하고, 배경 제거가 필요한 이미지 요소를 합성한 뒤 결과물을 저장합니다.

XIV Frame의 기준은 단순합니다. 편집은 즉시 보여야 하고, 원본 이미지는 사용자의 기기를 벗어나지 않아야 하며, 데스크톱과 모바일에서 같은 작업 흐름을 제공해야 합니다.

## 제공하는 기능

### 사진 구성

- 사진을 최대 16장까지 추가합니다. 3×3·4×4 격자 템플릿은 각각 9장·16장의 사진을 사용합니다.
- 가로 분할, 세로 분할, 바둑판 배치를 선택합니다.
- 자동, 16:9, 2:1 캔버스 비율을 제공합니다.
- 사진별 배율과 위치를 조정하고, 순서를 바꾸거나 개별 사진을 교체합니다.
- 사진 사이 간격, 자연스러운 연결 효과, 테두리, 배경, 필름 노이즈를 조정합니다.

### 오버레이와 시그니처

- 상단 텍스트와 하단 텍스트를 별도로 입력합니다.
- 글꼴, 크기, 굵기, 기울임, 자간, 색상, 불투명도, 위치, 정렬을 조정합니다.
- PNG 로고를 추가하고 위치, 크기, 불투명도를 조정합니다.
- 텍스트 영역에서 저작권 표시를 켜고 위치와 색상을 선택합니다.

### 이미지 합성

- 캐릭터뿐 아니라 햇빛, 이펙트, 장식 등 모든 이미지 요소를 합성할 수 있습니다.
- ORMBG ONNX 모델로 이미지 배경을 브라우저에서 제거합니다.
- 지우기·복원 브러시로 결과를 세밀하게 보정합니다.
- 합성 요소의 크기, 위치, 투명도, 좌우 반전, 그림자를 조정합니다.
- 데스크톱에서는 방향키와 Shift+방향키로 1px 또는 10px 단위 이동을 지원합니다.
- 모바일에서는 방향 버튼과 길게 누르기로 미세 조정합니다.

### 저장과 접근성

- 결과물을 PNG로 저장합니다.
- 미리보기 확대/축소와 저장되는 이미지의 해상도는 분리되어 있습니다.
- 이미지 카드와 합성 요소는 키보드로 선택하고 이동할 수 있습니다.
- 포커스 표시, 오류 알림, 처리 진행률을 보조기술에 전달합니다.
- 한국어, 영어, 일본어 화면을 제공합니다.

## 사용 순서

1. **사진 추가**
   이미지 탭에서 빈 카드에 사진을 추가합니다. 사진이 추가된 순서가 기본 구성 순서가 됩니다.

2. **레이아웃 선택**
   레이아웃 탭에서 사진 수와 보여주고 싶은 흐름에 맞는 배치를 선택합니다. 세 장 이상이면 바둑판 배치를 사용할 수 있습니다.

3. **사진별 구도 조정**
   사진 카드를 선택하고 배율과 위치를 조정합니다. 데스크톱에서는 캔버스에서 드래그하거나 방향키를 사용할 수 있습니다.

4. **합성 요소 추가**
   이미지 탭의 합성에서 PNG 요소를 추가합니다. 필요하면 브라우저에서 배경을 제거하고, 브러시로 가장자리를 보정합니다.

5. **시그니처 구성**
   시그니처 탭의 텍스트에서 이름과 서버명 등을 입력합니다. 로고는 로고 업로드에서 추가하고, 저작권 표시는 텍스트 영역에서 관리합니다.

6. **PNG 저장**
   미리보기에서 가장자리, 얼굴, 텍스트가 잘리지 않았는지 확인한 뒤 상단 또는 하단의 저장 버튼을 누릅니다.

처음 사용하는 방법은 [가이드](https://xiv-frame.pages.dev/ko/blog)에서 실제 화면 순서대로 확인할 수 있습니다. 문제 해결은 [자주 묻는 질문](https://xiv-frame.pages.dev/ko/faq)을 참고하세요.

## 데이터 처리 원칙

이미지 편집은 브라우저 안에서 수행됩니다.

- 선택한 스크린샷은 XIV Frame의 이미지 서버나 사용자 계정으로 업로드하지 않습니다.
- 큰 이미지는 편집에 맞는 크기와 형식으로 브라우저에서 최적화합니다.
- 배경 제거는 브라우저 Worker에서 실행되며, 데스크톱에서는 WebGPU를 우선 사용하고 필요하면 WASM으로 대체합니다.
- 배경 제거 모델 파일은 첫 실행 시 외부 모델 저장소에서 내려받아 브라우저 캐시에 저장합니다. 모델 다운로드와 이미지 업로드는 서로 다른 작업입니다.
- 스크린샷과 현재 캔버스의 Blob URL은 새로고침 후 유지되지 않습니다. 원본 파일은 사용자가 별도로 보관해야 합니다.
- 레이아웃, 시그니처, 로고 등 일부 설정은 localStorage에 저장될 수 있습니다. 브라우저 데이터를 삭제하거나 저장공간이 부족하면 설정이 초기화될 수 있습니다.

XIV Frame은 계정, 로그인, 유료 플랜, 서버 기반 프로젝트 보관 기능을 제공하지 않습니다.

## 파일 제한과 처리 범위

| 항목 | 기준 |
| --- | --- |
| 사진 개수 | 최대 16장 |
| 파일 크기 | 파일 하나당 최대 50MB |
| 지원 형식 | AVIF, BMP, GIF, JPG/JPEG, PNG, WebP |
| 일반 이미지 정규화 | 긴 변 최대 4096px |
| 합성 이미지 전처리 | 데스크톱 최대 1536px, 모바일 최대 1024px |
| 배경 제거 | 브라우저 모델 실행, 첫 실행 시 준비 시간과 모델 다운로드 필요 |
| 결과 저장 | PNG |

파일 크기와 처리 시간은 브라우저, 기기 메모리, GPU 지원 여부에 따라 달라집니다. 특히 모바일에서 처음 배경 제거를 실행할 때는 화면을 닫지 않고 완료를 기다려야 합니다.

## 기술 구성

| 영역 | 선택 |
| --- | --- |
| 애플리케이션 | Next.js 16 App Router, React 19, TypeScript |
| 렌더링 | Konva, react-konva |
| 상태 관리 | Zustand |
| 스타일 | Tailwind CSS 4, shadcn/ui |
| 이미지 처리 | Canvas API, Web Worker |
| 배경 제거 | Transformers.js, ORMBG ONNX |
| 다국어 | next-intl (ko, en, ja) |
| 배포 형태 | Next.js static export |

## 프로젝트 구조

    src/
    ├─ app/                 라우트, 메타데이터, sitemap, robots, RSS
    ├─ components/
    │  ├─ canvas/           Konva 미리보기와 캔버스 레이어
    │  ├─ mobile/           모바일 편집 및 저장 UI
    │  ├─ pages/            소개, FAQ, 문의, 법적 고지
    │  ├─ sidebar/          사진, 레이아웃, 시그니처 설정
    │  └─ ui/               공통 인터페이스 컴포넌트
    ├─ content/blog/        다국어 가이드 Markdown
    ├─ lib/                 업로드, 배경 제거, 내보내기, SEO 유틸리티
    ├─ messages/            한국어·영어·일본어 번역
    └─ store/               Zustand 상태와 로컬 저장소 정책

    scripts/
    ├─ sync-transformers-worker.mjs
    ├─ validate-content.mjs
    └─ validate-static-output.mjs

`sync-transformers-worker.mjs`는 개발 서버와 빌드 전에 Transformers.js Worker 번들을 `public/vendor`에 동기화합니다. `validate-content.mjs`는 8개 가이드의 3개 언어 파일, front matter, 본문 구조와 번호 단계를 확인합니다. `validate-static-output.mjs`는 빌드 후 HTML의 색인 신호, 광고 태그, 사이트맵과 내부 링크를 확인합니다. 생성된 Worker 번들과 `out/`은 저장소에 커밋하지 않습니다.

## 로컬 개발

### 요구 사항

- Node.js 20.9.0 이상
- npm

### 설치와 실행

    npm ci
    npm run dev

개발 서버가 실행되면 터미널에 표시된 로컬 주소를 엽니다. 별도의 계정이나 데이터베이스는 필요하지 않습니다.

### 검증 명령

    npm run content:check
    npm run lint
    npx tsc --noEmit
    npm run build

`npm run build`는 `prebuild`에서 Worker와 콘텐츠를 확인하고, 정적 결과물을 `out/`에 생성한 뒤 `postbuild` 검사를 실행합니다. 현재 기준으로 정적 페이지 54개, HTML 51개, 사이트맵 URL 45개를 검사합니다.

## 정적 배포

이 프로젝트는 next.config.ts에서 output: "export"를 사용합니다. 따라서 Node.js 서버 런타임을 배포하는 프로젝트가 아니라 정적 파일을 배포하는 프로젝트입니다.

Cloudflare Pages에서는 다음 값을 사용합니다.

| 설정 | 값 |
| --- | --- |
| Build command | npm run build |
| Output directory | out |
| 선택 환경 변수 | NEXT_PUBLIC_SITE_URL=https://xiv-frame.pages.dev |

NEXT_PUBLIC_SITE_URL은 canonical URL, sitemap, robots, RSS, 구조화 데이터 생성에 사용됩니다. 사용자 정의 도메인을 연결할 때는 실제 운영 주소로 바꿉니다.

정적 export에서는 npm start 또는 next start를 사용할 수 없습니다. 로컬에서 빌드 결과를 확인하려면 정적 파일 서버를 사용합니다.

    npx serve out

## 콘텐츠와 검색 노출

- /: 한국어 공개 랜딩
- /en/landing, /ja/landing: 영어·일본어 공개 랜딩
- /ko, /en, /ja: 기존 편집기 진입점(`noindex`, 사용자 설정·북마크 보존)
- /{locale}/blog: 사용 가이드
- /{locale}/faq: 자주 묻는 질문
- /{locale}/about: 서비스 소개
- /{locale}/contact: 문의
- /{locale}/legal/privacy: 개인정보처리방침
- /{locale}/legal/terms: 이용약관
- /sitemap.xml, /robots.txt, /rss.xml: 검색 및 피드 엔드포인트

각 언어 페이지는 canonical URL과 언어별 alternate URL을 생성합니다. 가이드 글은 Markdown front matter의 제목, 설명, 날짜, 태그를 기준으로 정적 생성됩니다.

한국어 공개 랜딩의 정식 주소는 `/`이며 `/ko/landing`은 생성하지 않습니다. 편집기 루트와 검색용 콘텐츠를 분리하는 이유와 점검 결과는 [`docs/adsense-content-research.md`](docs/adsense-content-research.md)에 기록합니다.

## 유지보수 계약

### 설정값 보존

편집 설정은 Zustand `persist`로 `localStorage`에 저장됩니다. 저장소 키는 `xiv-frame-settings-v2`이며, 구현은 [`src/store/useStore.ts`](src/store/useStore.ts)에 있습니다.

사용자 설정과 관련된 코드를 수정할 때는 다음 순서를 지킵니다.

1. `src/store/slices/`에서 상태와 초기값을 확인합니다.
2. `partialize`에서 새 필드를 저장할지 결정합니다.
3. 저장 필드 이름이나 형식을 바꾸면 `version`을 올리고 `migrate`를 추가합니다.
4. 사진 Blob URL, 배경 제거 임시 결과처럼 새로고침 후 유지하면 안 되는 데이터는 저장하지 않습니다.
5. 기존 텍스트·레이아웃·시그니처·로고 설정이 유지되는지 기존 브라우저 저장값으로 확인합니다.

저장소 용량이 부족하거나 비공개 브라우징에서 `localStorage`를 사용할 수 없어도 현재 세션의 편집이 중단되지 않도록 저장은 best-effort로 처리합니다.

### 가이드 콘텐츠

새 가이드는 세 언어 파일을 함께 추가합니다.

    src/content/blog/my-guide/ko.md
    src/content/blog/my-guide/en.md
    src/content/blog/my-guide/ja.md

각 파일에는 `title`, `description`, `date`, `category`, `tags` front matter가 필요합니다. `updated`는 실제 본문이나 기능 설명을 수정했을 때만 갱신합니다.

가이드에는 다음 내용을 포함합니다.

- 첫 문단의 사용 목적과 완성할 결과
- 실제 UI 라벨과 일치하는 번호 단계
- 레이아웃·배율·위치·합성 선택 기준
- 실패·용량 초과·처리 지연 시 확인 순서
- 저장 전 잘림·가독성·권리·개인정보 점검

새 slug를 추가하면 [`src/lib/markdown.ts`](src/lib/markdown.ts)의 `relatedGuideSlugs`에서 관련 문서 연결도 검토합니다. `npm run content:check`가 번역 누락, 필수 메타데이터 누락, 지나치게 짧은 본문과 번호 단계 부족을 빌드에서 차단합니다.

FAQ·소개·정책 문서는 `src/components/pages/`의 언어별 컴포넌트를 수정하고, UI 문자열은 `src/messages/ko.json`, `en.json`, `ja.json`의 같은 키를 함께 수정합니다.

### 캔버스와 성능

- 배경 제거 연산은 [`src/lib/backgroundRemoval.ts`](src/lib/backgroundRemoval.ts)의 Worker 우선 경로를 유지합니다.
- 이미지 파일을 불필요하게 Base64로 복제하지 말고 Blob URL 수명을 관리합니다.
- Konva 레이어의 `listening`, `React.memo`, 선택 상태를 확인해 다른 편집 요소를 가리지 않게 합니다.
- 모바일 전처리 해상도와 Worker timeout을 임의로 늘리지 않습니다.
- 변경 후 50MB 입력, 첫 모델 준비, 배경 제거 실패, 복원 브러시, 500% 합성 배율을 회귀 확인합니다.

### 글꼴과 디자인

- 공통 CSS 토큰은 [`src/app/globals.css`](src/app/globals.css)에서 확인합니다.
- 전체 기본 UI와 설명·본문은 `Pretendard`를 사용합니다. 사용자가 저장한 시그니처 폰트 선택값은 유지하며, Terrarum은 기존 선택값 호환을 위해 남겨둡니다.
- 색상·간격·모서리·포커스 스타일은 기존 토큰과 공통 컴포넌트를 우선 재사용합니다.
- 시각 디자인 변경 시 `DESIGN.md`와 실제 CSS 토큰의 차이도 함께 확인합니다.

## 배포 전 릴리스 체크리스트

```text
[ ] git diff --check
[ ] npm run content:check
[ ] npm run lint
[ ] npx tsc --noEmit
[ ] npm run build
[ ] /, /ko, /ko/blog, /ko/faq, /ko/about 실제 응답 확인
[ ] /sitemap.xml, /robots.txt, /rss.xml, /ads.txt 확인
[ ] 데스크톱·모바일 사진 추가 및 PNG 저장 확인
[ ] 합성 배경 제거·복원·삭제와 키보드/터치 미세조정 확인
[ ] 기존 localStorage 설정값 보존 확인
[ ] .env, 인증서, 토큰, 개인 키가 diff에 없는지 확인
```

`npm run build`가 성공해도 실제 브라우저에서의 파일 선택, GPU/WASM fallback, 모바일 메모리, 다운로드 동작까지 자동으로 보장하지는 않습니다. 배포 후에는 익명 상태로 공개 페이지와 편집기 양쪽을 확인합니다.

## 광고·검색 정책 유지

현재 Google 광고 스크립트와 광고 슬롯은 로드하지 않습니다. 편집기·빈 상태·오류·저장 화면은 행동 목적 화면이므로 광고 후보에서 제외합니다.

광고를 다시 도입하려면 다음을 먼저 완료합니다.

1. 동의 관리와 지역별 동의 흐름을 구현합니다.
2. 개인정보처리방침에 광고 공급자·쿠키·웹 비콘·데이터 처리 내용을 실제 동작과 일치하게 반영합니다.
3. 콘텐츠 페이지와 편집기·행동 화면의 광고 영역을 분리합니다.
4. `ads.txt`와 게시자 ID를 실제 광고 설정과 대조합니다.
5. `validate-static-output.mjs`의 광고 태그 검사 기준을 의도한 공개 범위에 맞춰 갱신합니다.

콘텐츠는 검색어 반복보다 고유한 사용 기준과 문제 해결을 우선합니다. 변경 기록은 [`docs/adsense-content-research.md`](docs/adsense-content-research.md)에 남깁니다.

## 권리와 라이선스

XIV Frame은 Square Enix와 제휴하거나 공식 승인된 서비스가 아닙니다. Final Fantasy XIV와 관련 게임 콘텐츠·상표의 권리는 각 권리자에게 있습니다. 업로드하거나 게시하는 이미지, 텍스트, 로고에 필요한 권리와 허락이 있는지 사용자가 확인해야 합니다.

이 저장소에는 현재 코드의 사용·재배포 조건을 정한 별도 LICENSE 파일이 포함되어 있지 않습니다. 코드나 리소스를 재사용하거나 재배포하려면 저장소 소유자에게 먼저 확인하세요. 의존성과 배경 제거 모델에는 각자의 라이선스가 적용됩니다.

## 문제 제보

문제를 재현할 때 다음 정보를 함께 보내면 확인이 빠릅니다.

1. 브라우저와 운영체제
2. 데스크톱 또는 모바일 여부
3. 파일 형식과 대략적인 파일 크기
4. 문제가 발생한 탭과 클릭 순서
5. 오류 메시지 또는 화면 캡처

문의는 [문의 페이지](https://xiv-frame.pages.dev/ko/contact) 또는 저장소의 이슈를 이용해 주세요.
