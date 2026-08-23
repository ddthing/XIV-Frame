# Google AdSense ‘가치가 별로 없는 콘텐츠’ 대응 연구 노트

- 조사일: 2026년 8월 22일
- 조사 범위: 사용자가 지정한 Google 공식 문서 4개
- 적용 대상: XIV Frame의 가이드, FAQ, 소개 및 연결된 콘텐츠 구조
- 변경 범위: 이 연구 노트를 기준으로 공개 랜딩, 색인 정책, 광고 태그, 콘텐츠 검수 기록을 단계적으로 반영합니다. 운영 배포는 별도 확인 후 진행합니다.

이 문서는 AdSense 승인이나 재심사를 보장하는 문서가 아닙니다. Google이 공개한 원칙을 현재 저장소의 콘텐츠 구조에 대입해, 다음 콘텐츠 작업에서 확인할 기준을 정리한 연구 결과입니다.

## 이번 구현에서 반영한 결정

- `/`는 편집기만 노출하지 않고 서비스 목적·작업 순서·사용 사례·한계를 설명하는 공개 랜딩으로 사용합니다.
- `/ko`, `/en`, `/ja`는 기존 편집기 주소와 사용자 설정을 유지하되 검색 색인에서는 제외합니다.
- 실제 광고 슬롯과 동의 관리가 준비되지 않은 동안에는 Google 광고 태그를 로드하지 않습니다.
- 실제 본문이 바뀌지 않은 기존 가이드는 `updated` 날짜를 제거해 인위적인 최신성 표시를 피합니다.
- 가이드의 관련 문서는 글 순서가 아니라 작업 목적에 따라 명시적으로 연결합니다.
- 공개 운영 식별자와 GitHub 저장소를 소개·개인정보처리방침·구조화 데이터에 일치시킵니다.
- 개별 가이드에 실제 기능 라벨·기능 범위와 대조한 검수 기록을 표시합니다.
- `content:check`와 `postbuild` 검증으로 번역 누락·메타데이터 누락·빈약한 가이드·잘못된 색인·광고 태그·끊긴 내부 링크를 빌드에서 차단합니다.

## 현재 단계와 남은 검증

소스와 로컬 정적 산출물 기준으로 완료한 항목과, 운영 환경에서 별도로 확인해야 할 항목을 분리합니다.

- [x] 공개 루트 랜딩과 기존 편집기 경로 분리
- [x] 편집기 경로 `noindex`, 공개 콘텐츠 경로 `index` 설정
- [x] 현재 광고 태그 미로드 및 정책 문구 일치
- [x] 8개 가이드 × 3개 언어의 콘텐츠·메타데이터 검증
- [x] 54개 정적 페이지 생성, 51개 HTML·45개 사이트맵 URL·내부 링크 검증
- [ ] 운영 URL에서 새 산출물 배포 후 실제 응답 헤더·HTML·사이트맵 재확인
- [ ] 실제 사용자에게 가이드만 제공하고 편집·저장까지 완료하는 사용성 테스트
- [ ] 자체 제작 또는 사용 허가가 확인된 실제 결과 이미지와 전후 설명 추가
- [ ] 광고를 다시 도입할 경우 CMP·동의 흐름·제공자 공개·광고 위치를 별도 구현 후 재검토

## 핵심 결론

1. Google이 요구하는 것은 임의의 글자 수가 아니라, 사이트의 주제를 이해할 수 있을 만큼 충분한 고유 콘텐츠와 사용자가 다시 방문할 이유가 되는 실질적 가치입니다. 조사한 문서에는 최소 단어 수나 최소 글자 수가 제시되어 있지 않습니다. 따라서 분량을 부풀리는 것보다 각 페이지가 하나의 사용자 목적을 깊이 해결하는지가 우선입니다. ([S2](https://support.google.com/adsense/answer/10015918))
2. 광고를 붙일 수 있는 화면과 콘텐츠 페이지를 분리해야 합니다. 게시자 콘텐츠가 없거나 가치가 낮은 화면, 아직 완성되지 않은 화면, 알림·탐색·행동 목적의 화면에는 Google 게재 광고를 표시할 수 없습니다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
3. 다른 사이트의 글·이미지·영상·자료를 단순 복사, 약간 바꾸기, 삽입하는 것만으로는 충분한 부가 가치가 되지 않습니다. 고유한 전문 지식, 실제 사용 판단, 개선 아이디어, 리뷰 또는 직접 작성한 설명을 더해야 합니다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements), [S2](https://support.google.com/adsense/answer/10015918))
4. ‘가치가 별로 없는 콘텐츠’와 관련해 Google이 예시로 드는 문제는 빈약한 제휴 페이지, 다른 출처의 콘텐츠, 도어웨이 페이지입니다. 공통 문제는 사용자에게 실질적으로 차별화된 가치가 없다는 점입니다. ([S3](https://support.google.com/webmasters/answer/9044175#thin-content))
5. 검색어를 반복해 넣거나, 실제로 제공하지 않는 콘텐츠·서비스를 제공한다고 주장하거나, 검색엔진만을 위한 도어웨이·틀에 박힌 페이지를 만드는 것은 피해야 합니다. ([S4](https://support.google.com/adsense/answer/1348737))
6. 고유 콘텐츠만으로 끝나지 않습니다. 사용자가 쉽게 읽고 탐색할 수 있어야 하며, 메뉴의 정렬·가독성·기능·연결 정확성, 누락·무관·오해를 부르는 링크 여부도 점검 대상입니다. ([S2](https://support.google.com/adsense/answer/10015918))

## 공식 문서별 확정 원칙

### S1. Google 게시자 정책

원문: [Google 게시자 정책](https://support.google.com/adsense/answer/9335564#minimum_content_requirements)

2026년 8월 22일 확인 시 지정 URL은 현재 Google 게시자 정책 페이지로 리디렉션되었습니다. 아래 내용은 지정 URL에서 현재 제공되는 정책 내용을 기준으로 정리했습니다.

- Google 게재 광고는 게시자 콘텐츠가 없거나 가치가 별로 없는 화면, 미완성 화면, 알림·탐색·행동 목적 화면에 표시할 수 없습니다.
- 다른 사용자의 콘텐츠를 논평·선별·기타 부가 가치 없이 삽입하거나 복사한 화면에는 Google 게재 광고를 표시할 수 없습니다.
- 광고 또는 유료 프로모션 자료가 게시자 콘텐츠보다 많은 화면은 허용되지 않습니다.
- 게시자는 Google 제품 사용으로 발생하는 데이터 수집·공유·사용과 쿠키, 웹 비콘, IP 주소 등 사용 기술을 명확히 공개하는 개인정보처리방침을 마련하고 준수해야 합니다.

이 문서에서 바로 적용할 수 있는 판단은 “광고를 모든 화면에 넣지 않는다”는 것입니다. 편집기의 캔버스·업로드·설정·내비게이션·빈 상태·오류 상태는 콘텐츠를 읽거나 탐색하는 페이지와 목적이 다르므로, 광고 배치 전에 화면별 게시자 콘텐츠가 실제로 존재하는지 별도로 판단해야 합니다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))

### S2. Google 애드센스 콘텐츠 및 사용자 환경

원문: [Google 애드센스 콘텐츠 및 사용자 환경](https://support.google.com/adsense/answer/10015918)

- Google이 사이트의 주제를 판단할 수 있도록 페이지에 충분한 고유 콘텐츠가 있어야 합니다.
- 사용자가 방문할 이유와 다시 방문할 이유가 되는 콘텐츠를 제공해야 합니다.
- 유사한 주제를 다루는 다른 사이트와 비교해 실질적 가치와 독창성이 있는지 스스로 점검해야 합니다.
- 사이트는 정기적으로 갱신하고 새로운 고유 콘텐츠를 꾸준히 추가해야 합니다.
- 다른 사이트의 콘텐츠를 복사해 다시 게시하거나, 동의어 치환·자동화 등으로 조금만 바꾸어 게시하거나, 외부 미디어를 실질적인 부가 가치 없이 삽입하는 방식은 피해야 합니다.
- 외부 자료를 사용할 때는 전문 지식, 개선 제안, 리뷰, 개인적인 의견 등 사이트만의 고유한 내용을 추가해야 합니다.
- 같은 내용이 한 페이지 안에서 또는 여러 페이지에 걸쳐 반복되지 않아야 합니다. 유사 페이지가 많으면 각 페이지를 확장하거나 하나로 통합하고, 긴 공통 문구는 요약 후 상세 페이지로 연결하는 방식을 권장합니다.
- 콘텐츠는 유익하고 탐색하기 쉬워야 합니다. 메뉴는 모든 기기에서 정렬·가독성·기능·연결 정확성을 갖추고, 누락·무관·오해를 부르는 페이지로 연결되지 않아야 합니다.
- 사이트는 다양한 브라우저에서 올바르게 표시되어야 합니다.

### S3. Search Console 직접 조치 보고서

원문: [직접 조치 보고서 - 부가 가치가 전혀 또는 거의 없는 빈약한 콘텐츠](https://support.google.com/webmasters/answer/9044175#thin-content)

- Google은 품질이 낮거나 얕은 페이지를 “부가 가치가 전혀 또는 거의 없는 빈약한 콘텐츠”의 예로 설명합니다.
- 대표적인 예시는 빈약한 제휴 페이지, 다른 출처에서 가져온 콘텐츠, 도어웨이 페이지입니다.
- 이런 페이지가 다른 페이지와 실질적으로 구별되지 않고 사용자에게 가치가 없다면 스팸 정책 위반이 될 수 있습니다.
- 권장 조치는 다른 곳에서 복제한 콘텐츠, 빈약한 제휴 페이지, 도어웨이 페이지를 점검하고, 사이트가 사용자에게 상당한 부가 가치를 제공하는지 판단한 뒤 개선하는 것입니다.
- 재검토를 요청할 때는 삭제한 문제 콘텐츠와 추가한 양질의 콘텐츠 사례를 제시할 수 있도록 변경 내용을 기록해야 합니다.
- 사이트와 관계없는 실제 사용자에게 사용과 비평을 부탁하는 방법도 개선 아이디어를 얻는 방법으로 제시됩니다.

### S4. Google 웹 검색 스팸 정책 안내

원문: [Google 웹 검색의 스팸 정책 안내](https://support.google.com/adsense/answer/1348737)

- 가치를 더하지 않는 불필요하고 반복적인 키워드 사용을 피해야 합니다.
- 실제로 제공하지 않는 콘텐츠나 서비스를 제공한다고 주장해서는 안 됩니다.
- 검색엔진만을 위해 만든 도어웨이 페이지와, 고유 콘텐츠가 거의 없는 틀에 박힌 페이지를 만들지 않아야 합니다.
- Google 광고 프로그램 참여 자체가 Google 검색 순위를 올리거나 기본 크롤러의 크롤링 순서를 앞당기는 것은 아닙니다.

## 현재 저장소 구조와 적용 대상

현재 한국어 콘텐츠 기준으로 확인한 구조는 다음과 같습니다. 이 목록은 “현재 무엇이 있는가”를 정리한 것이며, Google의 승인 기준을 충족했다는 의미는 아닙니다.

| 영역 | 현재 구조 | 콘텐츠 작업에서 확인할 점 |
| --- | --- | --- |
| 가이드 목록 | `/ko/blog` 및 개별 글 8편 | 목록 카드의 제목·요약만으로 끝나지 않고 개별 글이 고유한 작업을 해결하는가 |
| 가이드 주제 | 이미지 2~16장 결합, 전체 사용 흐름, 시그니처, 로고, 룩덕 쇼케이스, 합성, 대용량 파일, 게시 전 검수 | 전체 흐름과 세부 기능 가이드가 같은 설명을 반복하지 않는가 |
| FAQ | `/ko/faq`, 4개 그룹·14개 문항 | 질문마다 실제 문제를 독립적으로 해결하고 관련 가이드로 정확히 연결되는가 |
| 소개 | `/ko/about`, 7개 섹션 | 서비스 목적·범위·한계·데이터 처리·권리·콘텐츠 관리·기능 검수 범위가 구체적인가 |
| 정책·문의 | 개인정보처리방침, 이용약관, 문의 페이지 | 실제 운영 방식과 문구가 일치하고 링크가 끊기지 않는가 |
| 언어 | `ko`, `en`, `ja` | 각 언어 페이지가 단순한 제목·메타데이터 복제에 그치지 않고 실제 사용자에게 읽을 수 있는 내용을 제공하는가 |

## 페이지별 체크리스트

아래 체크리스트의 `[Google 원칙]`은 공식 문서에서 직접 도출한 항목이고, `[사이트 적용]`은 그 원칙을 XIV Frame의 현재 구조에 적용한 실행 기준입니다.

### P0 — 재심사 전에 반드시 확인할 항목

#### 1. 광고가 표시되는 화면의 범위

- [ ] [Google 원칙] 게시자 콘텐츠가 없거나 가치가 낮은 화면, 미완성 화면, 탐색·알림·행동 목적 화면에는 Google 게재 광고를 표시하지 않는다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
- [ ] [사이트 적용] 편집기 홈, 이미지 업로드·설정 패널, 캔버스 빈 상태, 오류·로딩 상태, 저장·다운로드 행동 화면을 콘텐츠 페이지와 분리해 광고 배치 후보에서 제외한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
- [ ] [Google 원칙] 광고 또는 유료 프로모션이 게시자 콘텐츠보다 많아 보이지 않도록 한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
- [ ] [사이트 적용] 가이드·FAQ·소개 페이지에서 본문보다 광고가 먼저 보이거나, 광고가 제목·본문·버튼과 혼동되거나, 콘텐츠를 밀어내지 않는지 데스크톱·모바일로 확인한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))

#### 2. 고유성과 실질적 가치

- [ ] [Google 원칙] 각 색인 대상 페이지에 사이트의 주제를 이해할 수 있을 만큼 고유하고 충분한 내용이 있다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [사이트 적용] 가이드마다 “이 글을 읽으면 사용자가 무엇을 완성할 수 있는가”를 한 문장으로 정하고, 제목만 바꾼 유사 글을 만들지 않는다. ([S2](https://support.google.com/adsense/answer/10015918), [S3](https://support.google.com/webmasters/answer/9044175#thin-content))
- [ ] [Google 원칙] 외부 자료·이미지·영상·게임 관련 자료를 보여줄 때는 실질적인 설명, 판단 기준, 사용 경험 또는 개선 아이디어를 함께 제공한다. 단순 삽입이나 복제만으로 페이지를 구성하지 않는다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements), [S2](https://support.google.com/adsense/answer/10015918))
- [ ] [사이트 적용] 가이드의 스크린샷·예시 이미지마다 “무엇을 보여주는지”, “왜 이 설정을 선택했는지”, “다른 선택지와 언제 바꾸는지”를 설명한다. 이미지가 설명을 대신하지 않도록 한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [Google 원칙] 같은 내용이 페이지 안이나 여러 페이지에서 긴 문장 단위로 반복되면 페이지를 확장하거나 통합하고, 공통 내용은 짧게 요약한 뒤 대표 문서로 연결한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [사이트 적용] 전체 사용 가이드를 기준 문서로 두고, 이미지 결합·시그니처·로고·쇼케이스 글은 해당 기능의 선택 기준과 예외·문제 해결에 집중한다. 전체 순서를 각 글에서 다시 복사하지 않는다. ([S2](https://support.google.com/adsense/answer/10015918))

#### 3. 검색용 과장과 오해 방지

- [ ] [Google 원칙] 가치를 더하지 않는 키워드 반복을 제거한다. ([S4](https://support.google.com/adsense/answer/1348737))
- [ ] [사이트 적용] “파판14”, “스크린샷”, “PNG”, “이미지 편집” 같은 핵심어를 제목·본문·메타데이터에 자연스럽게 사용하고, 같은 문장을 반복해 검색어 밀도를 높이지 않는다. ([S4](https://support.google.com/adsense/answer/1348737))
- [ ] [Google 원칙] 실제로 제공하지 않는 기능·콘텐츠·서비스를 제공한다고 주장하지 않는다. ([S4](https://support.google.com/adsense/answer/1348737))
- [ ] [사이트 적용] 배경 제거, 이미지 합성, 로컬 처리, 파일 제한, 저장 방식 등은 현재 배포된 기능과 정확히 일치할 때만 가이드·FAQ·소개·메타데이터에 쓴다. 지원 범위가 다른 브라우저·모바일 환경을 일괄적으로 보장한다고 표현하지 않는다. ([S4](https://support.google.com/adsense/answer/1348737))
- [ ] [Google 원칙] 검색엔진만을 위한 도어웨이 페이지나 고유 내용이 거의 없는 틀에 박힌 페이지를 만들지 않는다. ([S4](https://support.google.com/adsense/answer/1348737), [S3](https://support.google.com/webmasters/answer/9044175#thin-content))
- [ ] [사이트 적용] 언어별 URL을 만들더라도 각 페이지가 실제 독자를 위한 번역·설명·탐색 경험을 제공하는지 확인한다. 단순히 URL과 제목만 늘리는 페이지를 만들지 않는다. ([S4](https://support.google.com/adsense/answer/1348737), [S2](https://support.google.com/adsense/answer/10015918))

### P1 — 가이드 품질 보강

각 가이드는 다음 순서와 깊이를 갖추는 것을 권장합니다. 이는 Google이 고정한 글자 수가 아니라, 고유한 사용자 가치를 검증하기 위한 사이트 내부의 품질 기준입니다. 근거가 되는 Google 원칙은 고유성·실질적 가치·탐색성입니다. ([S2](https://support.google.com/adsense/answer/10015918), [S3](https://support.google.com/webmasters/answer/9044175#thin-content))

- [ ] 사용 목적: 어떤 결과물을 만들 때 읽는 글인지 첫 화면에서 설명한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] 시작 조건: 필요한 이미지 수, 지원 파일, 사전에 알아야 할 편집 상태를 설명한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] 번호가 있는 실행 단계: 실제 UI의 탭·버튼·슬라이더 이름과 사용 순서를 일치시킨다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] 선택 기준: 레이아웃·비율·배율·위치·합성·시그니처 중 어떤 상황에서 무엇을 선택할지 설명한다. ([S2](https://support.google.com/adsense/answer/10015918), [S3](https://support.google.com/webmasters/answer/9044175#thin-content))
- [ ] 결과 확인: 저장 전에 잘림, 겹침, 글자 대비, 저작권 표시, 모바일 화면을 확인하는 방법을 제시한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] 문제 해결: 이미지가 보이지 않음, 용량 초과, 배경 제거 실패, 모바일 처리 지연 등 실제 오류 상황별 확인 순서를 제공한다. ([S2](https://support.google.com/adsense/answer/10015918), [S3](https://support.google.com/webmasters/answer/9044175#thin-content))
- [ ] 한계와 보존: 새로고침 후 이미지가 유지되는지, 설정이 어디에 남는지, 브라우저·기기 차이가 있는지 정확히 밝힌다. ([S2](https://support.google.com/adsense/answer/10015918), [S4](https://support.google.com/adsense/answer/1348737))
- [ ] 고유한 시각 자료: 직접 만든 예시와 설명을 사용하고, 외부 이미지나 게임 자료를 사용할 경우 권리·출처·추가 설명을 함께 확인한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements), [S2](https://support.google.com/adsense/answer/10015918))
- [ ] 관련 문서 연결: 현재 단계에서 필요한 다음 단계만 연결하고, 모든 글에 같은 링크 묶음과 같은 긴 문단을 반복하지 않는다. ([S2](https://support.google.com/adsense/answer/10015918))

기존 5개 가이드와 새로 보강한 3개 가이드의 역할 분리는 다음과 같습니다.

| 가이드 | 고유한 답변으로 남겨야 할 범위 |
| --- | --- |
| 전체 사용 흐름 | 처음 방문한 사용자가 사진 추가부터 PNG 저장까지 완료하는 기준 경로 |
| 이미지 2~16장 결합 | 사진 수·레이아웃·비율·간격·크롭을 선택하는 판단 기준 |
| 시그니처 | 텍스트 입력, 두 줄 구성, 스타일·위치·불투명도·저작권 표시의 조정 기준 |
| 로고 | 로고 준비·업로드·교체·삭제·배치 및 텍스트와 함께 사용할 때의 충돌 방지 |
| 룩덕 쇼케이스 | 앞·뒤·디테일 사진의 역할 배분과 3~4장 쇼케이스를 한 장으로 정리하는 구성 원칙 |
| 합성·배경 제거 | 캐릭터·빛·이펙트 PNG를 배경 제거하고 브러시 보정·배치하는 작업 |
| 대용량 파일 | 50MB 제한, 브라우저 메모리, 형식·해상도 선택과 업로드 실패 진단 |
| 게시 전 검수 | 이미지 권리·개인정보·가독성·합성 경계·저장 PNG를 확인하는 점검표 |

### P1 — FAQ 품질 보강

- [ ] [Google 원칙] FAQ의 각 문항이 단순 키워드 나열이 아니라 사용자의 구체적인 문제를 해결하는 답변인지 확인한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [사이트 적용] 답변 첫 문장에서 결론을 말하고, 이어서 확인 순서·예외·관련 가이드 링크를 제공한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [Google 원칙] 가이드 본문을 FAQ에 그대로 복사하지 않고, FAQ에는 짧은 해결 요약과 대표 가이드 링크만 둔다. 긴 공통 문구 반복을 줄인다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [사이트 적용] 현재 FAQ의 파일 제한, 브라우저 지원, 저장 방식, 배경 제거, 이미지 합성 답변이 실제 기능·오류 메시지·운영 배포본과 일치하는지 확인한다. ([S4](https://support.google.com/adsense/answer/1348737))
- [ ] [사이트 적용] “왜 실패하는가”뿐 아니라 “사용자가 지금 무엇을 하면 되는가”를 단계로 안내한다. ([S2](https://support.google.com/adsense/answer/10015918), [S3](https://support.google.com/webmasters/answer/9044175#thin-content))
- [ ] [Google 원칙] 질문과 무관한 검색어, 반복된 질문, 존재하지 않는 기능을 추가하지 않는다. ([S4](https://support.google.com/adsense/answer/1348737))

### P1 — 소개 페이지의 신뢰성

- [ ] [Google 원칙] 게시자, 콘텐츠 제작자, 콘텐츠 목적 또는 서비스와의 제휴 관계를 오해하게 만들지 않는다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
- [ ] [사이트 적용] XIV Frame이 누구를 위한 도구인지, 무엇을 할 수 있는지, 무엇을 하지 않는지, 이미지가 어디에서 처리되는지, 설정이 어떻게 보존되는지를 한 페이지에서 명확히 설명한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements), [S2](https://support.google.com/adsense/answer/10015918))
- [ ] [사이트 적용] Square Enix와의 공식 제휴·승인 여부, 게임 콘텐츠·상표 권리, 사용자가 업로드하는 자료의 권리 책임을 사실대로 구분한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
- [ ] [사이트 적용] 오픈 소스 저장소·문의 경로·정책 문서·마지막 업데이트 날짜를 실제 링크와 함께 제공하고, 없는 기능이나 예정 기능을 현재 제공하는 것처럼 쓰지 않는다. ([S4](https://support.google.com/adsense/answer/1348737))
- [ ] [Google 원칙] 소개 페이지를 키워드용 랜딩 페이지로 만들지 않고 서비스 이해에 필요한 독자적인 설명을 제공한다. ([S2](https://support.google.com/adsense/answer/10015918), [S4](https://support.google.com/adsense/answer/1348737))

### P1 — 탐색·링크·다국어 검수

- [ ] [Google 원칙] 메뉴의 정렬, 가독성, 클릭 가능 여부, 올바른 목적지 연결을 모든 기기에서 확인한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [사이트 적용] 홈·가이드·FAQ·소개·문의·개인정보처리방침·이용약관의 헤더·푸터 링크를 로그인하지 않은 사용자 기준으로 모두 열어 본다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [Google 원칙] 누락된 페이지, 무관한 페이지, 오해를 부르는 페이지로 연결되는 링크를 제거하거나 수정한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [사이트 적용] 한국어·영어·일본어의 메뉴, 제목, 본문, 관련 링크, 날짜가 서로 맞고, 번역되지 않은 문장·깨진 변수·잘못된 언어로 된 페이지가 없는지 확인한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] [Google 원칙] Google에 보이는 내용과 일반 사용자에게 보이는 내용이 달라지는 클로킹이나 부적절한 리디렉션을 사용하지 않는다. ([S3](https://support.google.com/webmasters/answer/9044175#thin-content), [S2](https://support.google.com/adsense/answer/10015918))
- [ ] [사이트 적용] 정적 생성·언어별 경로·canonical·sitemap을 배포 후 실제 공개 URL에서 확인하고, 검색봇용 문구와 사용자용 문구를 따로 만들지 않는다. ([S3](https://support.google.com/webmasters/answer/9044175#thin-content))

### P1 — 개인정보처리방침과 광고 고지

- [ ] [Google 원칙] Google 제품·광고 사용 결과로 발생하는 데이터 수집·공유·사용, 쿠키·웹 비콘·IP 주소 등 기술 사용을 개인정보처리방침에 명확히 공개한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
- [ ] [사이트 적용] 개인정보처리방침에서 실제 광고 태그·쿠키·외부 리소스·호스팅/CDN 처리 방식만 정확히 설명하고, 아직 사용하지 않는 공급자나 기능을 확정적으로 쓰지 않는다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements), [S4](https://support.google.com/adsense/answer/1348737))
- [ ] [Google 원칙] 광고가 콘텐츠·탐색·작업을 방해하거나 사용자가 광고를 클릭하지 않고 화면을 나갈 수 없는 형태가 되지 않도록 한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
- [ ] [사이트 적용] 개인정보처리방침 링크는 푸터와 필요한 안내 위치에서 쉽게 찾을 수 있고, 광고가 없는 사용자에게도 정책을 확인할 수 있게 한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements), [S2](https://support.google.com/adsense/answer/10015918))

## 재심사 전 검증 절차

1. **색인 대상 목록을 고정합니다.** 홈, 언어별 가이드 목록, 5개 가이드, FAQ, 소개, 문의, 개인정보처리방침, 이용약관을 표로 만들고 각 URL의 목적과 담당 콘텐츠를 적습니다. Google은 사이트의 주제를 이해할 수 있는 충분한 고유 콘텐츠와 정리된 탐색을 요구합니다. ([S2](https://support.google.com/adsense/answer/10015918))
2. **페이지별 고유 가치를 한 문장으로 씁니다.** 문장을 쓰지 못하는 페이지는 다른 페이지와 통합하거나 콘텐츠를 보강할 후보입니다. 이는 빈약한 페이지가 사용자에게 실질적 부가 가치를 주는지 확인하라는 Google의 권고를 적용한 것입니다. ([S3](https://support.google.com/webmasters/answer/9044175#thin-content))
3. **실제 사용자 테스트를 합니다.** XIV Frame을 모르는 사용자에게 가이드만 읽고 사진 추가·레이아웃 선택·합성·시그니처·저장을 완료하게 한 뒤, 막힌 지점과 이해되지 않은 문장을 기록합니다. ([S3](https://support.google.com/webmasters/answer/9044175#thin-content))
4. **중복을 줄입니다.** 전체 사용 가이드와 기능별 가이드의 공통 문단을 비교해 대표 설명 하나만 남기고, 다른 글은 그 설명으로 연결합니다. ([S2](https://support.google.com/adsense/answer/10015918))
5. **사실성을 확인합니다.** 파일 제한, 지원 형식, 배경 제거, 로컬 처리, 저장, 브라우저 지원, 제휴·권리 문구를 현재 공개 서비스와 대조합니다. 제공하지 않는 기능을 주장하면 안 됩니다. ([S4](https://support.google.com/adsense/answer/1348737))
6. **광고 위치를 별도로 검수합니다.** 편집·탐색·빈 상태·오류 화면과 콘텐츠 페이지를 구분하고, 콘텐츠보다 광고가 많거나 작업을 가리는 위치를 제거합니다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
7. **변경 증거를 남깁니다.** 수정 전 문제 URL, 삭제·통합한 문서, 새로 추가한 고유 내용, 사용자 테스트 결과, 수정 후 URL을 기록합니다. Google은 재검토 시 문제 콘텐츠를 제거한 사례와 양질의 콘텐츠를 추가한 사례를 제시하라고 안내합니다. ([S3](https://support.google.com/webmasters/answer/9044175#thin-content))
8. **모든 조치를 마친 뒤에만 재검토를 요청합니다.** Google은 사이트 품질 개선 후 AdSense 계정의 사이트 페이지에서 검토를 제출하도록 안내합니다. ([S2](https://support.google.com/adsense/answer/10015918))

## 완료 기준

- [ ] 모든 색인 대상 페이지가 하나의 명확한 사용자 목적을 가진다. ([S2](https://support.google.com/adsense/answer/10015918), [S3](https://support.google.com/webmasters/answer/9044175#thin-content))
- [ ] 각 가이드가 다른 가이드와 구별되는 고유한 답변, 단계, 선택 기준, 예외, 문제 해결을 제공한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] FAQ가 가이드 본문을 장문으로 복사하지 않고 구체적인 질문을 해결한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] 소개 페이지가 기능·한계·데이터 처리·권리·문의 경로를 사실대로 설명한다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements), [S4](https://support.google.com/adsense/answer/1348737))
- [ ] 가이드·FAQ·소개·법적 문서·문의 페이지의 링크와 언어별 경로가 모두 정상 작동한다. ([S2](https://support.google.com/adsense/answer/10015918))
- [ ] 광고가 콘텐츠가 없는 화면, 행동 중심 화면, 오류·빈 상태 화면에 표시되지 않는다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
- [ ] 광고·프로모션이 게시자 콘텐츠보다 많지 않고 본문·탐색·작업을 가리지 않는다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements))
- [ ] 반복 키워드, 허위 기능 주장, 검색엔진 전용 페이지, 복제·재작성 콘텐츠가 없다. ([S1](https://support.google.com/adsense/answer/9335564#minimum_content_requirements), [S2](https://support.google.com/adsense/answer/10015918), [S4](https://support.google.com/adsense/answer/1348737))
- [ ] 임의의 단어 수를 채우기보다, 각 페이지가 실제 사용자에게 제공하는 독창적 결과와 사용 증거를 설명할 수 있다. ([S2](https://support.google.com/adsense/answer/10015918), [S3](https://support.google.com/webmasters/answer/9044175#thin-content), [S4](https://support.google.com/adsense/answer/1348737))

## 조사 범위의 한계

이 노트는 사용자가 지정한 Google 공식 문서 4개만 조사했습니다. 따라서 Google Search Essentials의 세부 기술 요건, 구조화된 데이터의 별도 가이드라인, 동의 관리 플랫폼의 구현 요건, `ads.txt` 설정, 실제 AdSense 계정 상태와 심사 결과는 이 노트의 판단 범위에 포함하지 않습니다. 이 문서의 체크리스트를 완료해도 승인 결과는 Google의 실제 검토에 따라 달라집니다.
