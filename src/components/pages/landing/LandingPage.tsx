import Link from 'next/link'
import { ArrowUpRight, Check, Download, ImagePlus, LayoutGrid, ShieldCheck, Type, WandSparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Locale } from '@/i18n/request'
import { Container } from '@/components/layout/Container'
import { FeatureCoverageTable } from '@/components/content/FeatureCoverageTable'
import { localizedUrl, siteName, siteUrl } from '@/lib/site'

interface LandingCopy {
  eyebrow: string
  title: string
  description: string
  primaryCta: string
  secondaryCta: string
  previewLabel: string
  previewTitle: string
  previewDescription: string
  workflowEyebrow: string
  workflowTitle: string
  workflowDescription: string
  casesEyebrow: string
  casesTitle: string
  casesDescription: string
  caseTitles: [string, string, string]
  caseDescriptions: [string, string, string]
  caseLinks: [string, string, string]
  evidenceEyebrow: string
  evidenceTitle: string
  evidenceDescription: string
  evidenceHeaders: [string, string, string]
  evidenceRows: Array<{ area: string; support: string; notes: string }>
  trustEyebrow: string
  trustTitle: string
  trustDescription: string
  trustItems: [string, string, string, string]
  finalEyebrow: string
  finalTitle: string
  finalDescription: string
  finalCta: string
  guideLink: string
  aboutLink: string
}

const copy: Record<Locale, LandingCopy> = {
  ko: {
    eyebrow: 'XIV FRAME / BROWSER EDITOR',
    title: '스크린샷을 고르고,\n한 장의 결과로 마무리하세요.',
    description: '파이널판타지14 스크린샷을 최대 4장까지 배치하고, 레이아웃·합성·시그니처를 조정해 PNG로 저장하는 무료 브라우저 편집기입니다.',
    primaryCta: '편집기 열기',
    secondaryCta: '사용 순서 보기',
    previewLabel: 'LOCAL-FIRST WORKFLOW',
    previewTitle: '원본은 브라우저 안에서 처리합니다.',
    previewDescription: '회원가입 없이 시작하고, 선택한 스크린샷은 서버에 업로드하지 않습니다. 중요한 결과는 저장한 PNG로 직접 보관하세요.',
    workflowEyebrow: 'HOW IT WORKS',
    workflowTitle: '결과를 만드는 다섯 단계',
    workflowDescription: '기능을 무작정 나열하지 않고, 실제 편집 순서에 맞춰 필요한 판단과 확인 지점을 함께 보여줍니다.',
    casesEyebrow: 'USE CASES',
    casesTitle: '목적에 따라 기능을 선택하세요.',
    casesDescription: '같은 편집기라도 만들려는 결과가 다르면 순서와 기준이 달라집니다. 먼저 목적을 고른 뒤 필요한 가이드로 이동하세요.',
    caseTitles: ['룩과 장비 쇼케이스', '빛·캐릭터·PNG 합성', '게시 전 최종 검수'],
    caseDescriptions: [
      '앞모습·뒷모습·전신·디테일을 3~4장으로 나누고, 바둑판 레이아웃에서 각 사진의 역할이 겹치지 않도록 정리합니다.',
      '캐릭터뿐 아니라 햇빛·연기·이펙트도 합성할 수 있습니다. 배경 제거 후 복원·지우기 브러시로 경계를 다듬고 위치를 맞춥니다.',
      '권리와 개인정보, 텍스트 가독성, 합성 외곽선, 저장된 PNG의 네 모서리를 순서대로 확인한 뒤 게시합니다.',
    ],
    caseLinks: ['쇼케이스 가이드', '합성 가이드', '게시 전 체크리스트'],
    evidenceEyebrow: 'REVIEW RECORD',
    evidenceTitle: '결과를 확인하는 기준까지 공개합니다.',
    evidenceDescription: '기능이 있다는 말만 남기지 않고, 어떤 입력을 사용하고 무엇을 확인해야 하는지 기록합니다. 이 표는 가이드를 읽기 전에 기대할 결과와 한계를 빠르게 확인하는 용도입니다.',
    evidenceHeaders: ['목적', '작업 기준', '확인할 결과'],
    evidenceRows: [
      { area: '4장 쇼케이스', support: '대표 사진 1장 + 보조 사진 2~3장 · 바둑판 레이아웃', notes: '사진별 크롭과 시선 흐름이 겹치지 않는지 확인' },
      { area: 'PNG 요소 합성', support: '투명 PNG 또는 배경 제거 · 브러시 보정 · 위치 미세조정', notes: '외곽선·접점·그림자가 배경과 자연스럽게 이어지는지 확인' },
      { area: '서명과 로고', support: '짧은 텍스트 · 로고 1개 · 낮은 불투명도에서 비교', notes: '이미지의 핵심을 가리지 않고 작은 화면에서도 읽히는지 확인' },
      { area: '게시 전 저장', support: '100% 미리보기 · PNG 다운로드 후 파일 직접 열기', notes: '네 모서리·투명 영역·개인정보·권리 표시를 최종 확인' },
    ],
    trustEyebrow: 'KNOWN LIMITS',
    trustTitle: '사용 전에 확인할 범위',
    trustDescription: '브라우저에서 실행되는 편집기인 만큼 파일 크기와 기기 메모리가 결과에 영향을 줍니다. 아래 기준을 먼저 확인하면 실패를 줄일 수 있습니다.',
    trustItems: ['사진 최대 4장', '파일 하나 최대 50MB', '배경 제거는 첫 실행이 느릴 수 있음', '설정은 로컬 저장, 원본 이미지는 새로고침 후 재선택'],
    finalEyebrow: 'START WITH YOUR RESULT',
    finalTitle: '이제 만들고 싶은 결과부터 고르세요.',
    finalDescription: '편집기를 바로 열거나, 처음이라면 전체 사용 가이드에서 사진 추가부터 PNG 저장까지 순서대로 따라 할 수 있습니다.',
    finalCta: '편집기 시작하기',
    guideLink: '전체 가이드',
    aboutLink: '처리 방식과 권리 안내',
  },
  en: {
    eyebrow: 'XIV FRAME / BROWSER EDITOR',
    title: 'Choose your screenshots.\nFinish one clear result.',
    description: 'A free browser editor for arranging up to four Final Fantasy XIV screenshots, tuning layouts and composites, adding signatures, and saving a PNG.',
    primaryCta: 'Open the editor',
    secondaryCta: 'See the workflow',
    previewLabel: 'LOCAL-FIRST WORKFLOW',
    previewTitle: 'Your originals stay in the browser.',
    previewDescription: 'Start without an account. Selected screenshots are not uploaded to an XIV Frame image server. Keep important results as downloaded PNG files.',
    workflowEyebrow: 'HOW IT WORKS',
    workflowTitle: 'Five steps to a finished result',
    workflowDescription: 'The workflow follows real editing decisions instead of listing controls without context.',
    casesEyebrow: 'USE CASES',
    casesTitle: 'Choose features by the result you want.',
    casesDescription: 'The right order depends on the image you are making. Pick a goal first, then open the guide that matches it.',
    caseTitles: ['Glamour showcase', 'Light, character, and PNG compositing', 'Final publishing review'],
    caseDescriptions: [
      'Give front, back, full-body, and detail shots distinct roles, then arrange three or four images in a grid without repeating the same information.',
      'Composite more than characters: use light, smoke, effects, or other PNG elements. Remove the background, refine edges, and position the layer precisely.',
      'Check rights, personal information, text readability, composite edges, and all four corners of the downloaded PNG before sharing it.',
    ],
    caseLinks: ['Showcase guide', 'Compositing guide', 'Publishing checklist'],
    evidenceEyebrow: 'REVIEW RECORD',
    evidenceTitle: 'We publish the checks behind each result.',
    evidenceDescription: 'Instead of claiming that a feature exists, we record the input, the editing decision, and the result that must be checked. Use this table to set expectations before opening a guide.',
    evidenceHeaders: ['Goal', 'Working method', 'What to check'],
    evidenceRows: [
      { area: 'Four-shot showcase', support: 'One lead image + two or three supporting shots · grid layout', notes: 'Confirm that each crop has a role and the eye path does not repeat information' },
      { area: 'PNG compositing', support: 'Transparent PNG or background removal · brush refinement · precise nudging', notes: 'Check the edge, contact point, and shadow against the base image' },
      { area: 'Signature and logo', support: 'Short text · one logo · compare at lower opacity', notes: 'Make sure the focal subject stays clear and the text remains readable on small screens' },
      { area: 'Publishing export', support: 'Review at 100% · open the downloaded PNG directly', notes: 'Check all four corners, transparent areas, personal information, and rights notes' },
    ],
    trustEyebrow: 'KNOWN LIMITS',
    trustTitle: 'Know the boundaries before you start',
    trustDescription: 'Because the editor runs in your browser, file size and device memory affect the result. Check these limits first to avoid failed work.',
    trustItems: ['Up to four screenshots', 'Up to 50 MB per file', 'Background removal can be slower on its first run', 'Settings stay local; screenshots must be selected again after refresh'],
    finalEyebrow: 'START WITH YOUR RESULT',
    finalTitle: 'Start with the result you want to make.',
    finalDescription: 'Open the editor now, or follow the complete guide from adding screenshots through saving the final PNG.',
    finalCta: 'Start editing',
    guideLink: 'Complete guide',
    aboutLink: 'Processing and rights',
  },
  ja: {
    eyebrow: 'XIV FRAME / BROWSER EDITOR',
    title: 'スクリーンショットを選び、\n一枚の成果に仕上げます。',
    description: '最大4枚のFFXIVスクリーンショットを配置し、レイアウト・合成・署名を調整してPNGで保存できる無料のブラウザエディターです。',
    primaryCta: 'エディターを開く',
    secondaryCta: '使い方を見る',
    previewLabel: 'LOCAL-FIRST WORKFLOW',
    previewTitle: '元画像はブラウザ内で処理します。',
    previewDescription: 'アカウントなしで始められます。選択したスクリーンショットはXIV Frameの画像サーバーへアップロードしません。重要な結果はPNGで保存してください。',
    workflowEyebrow: 'HOW IT WORKS',
    workflowTitle: '完成までの5ステップ',
    workflowDescription: '機能名を並べるのではなく、実際の編集順と確認ポイントに沿って説明します。',
    casesEyebrow: 'USE CASES',
    casesTitle: '作りたい結果から機能を選びます。',
    casesDescription: '同じエディターでも目的によって順番と判断基準が変わります。まず目的を選び、対応するガイドを開いてください。',
    caseTitles: ['ミラプリのショーケース', '光・キャラクター・PNG合成', '公開前の最終確認'],
    caseDescriptions: [
      '前・後ろ・全身・装備のディテールに役割を分け、3〜4枚をグリッドに配置して情報の重複を減らします。',
      'キャラクターだけでなく光、煙、エフェクトなども合成できます。背景を削除し、ブラシで端を整えて位置を合わせます。',
      '権利、個人情報、文字の可読性、合成の境界、保存したPNGの四隅を確認してから共有します。',
    ],
    caseLinks: ['ショーケースガイド', '合成ガイド', '公開前チェック'],
    evidenceEyebrow: 'REVIEW RECORD',
    evidenceTitle: '結果を確認する基準も公開します。',
    evidenceDescription: '機能があるという説明だけでなく、どの入力を使い、何を確認するかを記録します。ガイドを読む前に、期待する結果と制限を確認できます。',
    evidenceHeaders: ['目的', '作業基準', '確認する結果'],
    evidenceRows: [
      { area: '4枚のショーケース', support: '代表画像1枚 + 補助画像2〜3枚 · グリッドレイアウト', notes: '画像ごとの役割と視線の流れが重複していないか確認' },
      { area: 'PNG素材の合成', support: '透明PNGまたは背景削除 · ブラシ補正 · 微調整', notes: '端・接地点・影がベース画像と自然につながるか確認' },
      { area: '署名とロゴ', support: '短いテキスト · ロゴ1つ · 低い不透明度でも比較', notes: '主役を隠さず、小さい画面でも読めるか確認' },
      { area: '公開前の保存', support: '100%プレビュー · 保存PNGを直接開く', notes: '四隅・透明部分・個人情報・権利表示を最終確認' },
    ],
    trustEyebrow: 'KNOWN LIMITS',
    trustTitle: '始める前に確認する範囲',
    trustDescription: 'ブラウザで動作するため、ファイル容量と端末メモリが結果に影響します。次の制限を先に確認すると失敗を減らせます。',
    trustItems: ['スクリーンショットは最大4枚', '1ファイル最大50MB', '背景削除は初回の準備に時間がかかる場合があります', '設定はローカル保存、画像は更新後に再選択'],
    finalEyebrow: 'START WITH YOUR RESULT',
    finalTitle: 'まず作りたい結果を選んでください。',
    finalDescription: 'すぐにエディターを開くか、画像追加からPNG保存まで完全ガイドに沿って進められます。',
    finalCta: '編集を始める',
    guideLink: '完全ガイド',
    aboutLink: '処理方法と権利について',
  },
}

interface WorkflowStep {
  number: string
  label: string
  description: string
  icon: LucideIcon
}

const workflowIcons: WorkflowStep['icon'][] = [ImagePlus, LayoutGrid, WandSparkles, Type, Download]

export function LandingPage({ locale }: { locale: Locale }) {
  const text = copy[locale]
  const appHref = `/${locale}`
  const guideHref = `/${locale}/blog`
  const caseHrefs = [
    `/${locale}/blog/creating-ffxiv-glamour-showcase`,
    `/${locale}/blog/composite-elements-background-removal`,
    `/${locale}/blog/ffxiv-screenshot-publishing-checklist`,
  ]
  const workflowLabels = locale === 'ko'
    ? ['사진 추가', '레이아웃 선택', '합성 준비', '시그니처 정리', 'PNG 저장']
    : locale === 'ja'
      ? ['画像を追加', 'レイアウトを選択', '合成を準備', '署名を整える', 'PNGを保存']
      : ['Add screenshots', 'Choose a layout', 'Prepare composites', 'Tune the signature', 'Save a PNG']
  const workflowDescriptions = locale === 'ko'
    ? ['최대 4장의 PNG·JPG·WebP를 선택합니다.', '분할·세로·그리드와 비율을 정합니다.', '배경을 제거하고 PNG 요소를 다듬습니다.', '텍스트·로고의 위치와 가독성을 확인합니다.', '미리보기와 최종 파일을 모두 검수합니다.']
    : locale === 'ja'
      ? ['最大4枚のPNG・JPG・WebPを選びます。', '分割・縦・グリッドと比率を決めます。', '背景を削除してPNG素材を整えます。', 'テキスト・ロゴの位置と可読性を確認します。', 'プレビューと最終ファイルを確認します。']
      : ['Select up to four PNG, JPG, or WebP files.', 'Choose split, vertical, grid, and ratio settings.', 'Remove backgrounds and refine PNG elements.', 'Check text and logo position and readability.', 'Review both the preview and final file.']
  const caseLabels = [
    locale === 'ko' ? 'CASE 01 · SHOWCASE' : locale === 'ja' ? 'CASE 01 · SHOWCASE' : 'CASE 01 · SHOWCASE',
    locale === 'ko' ? 'CASE 02 · COMPOSITE' : locale === 'ja' ? 'CASE 02 · COMPOSITE' : 'CASE 02 · COMPOSITE',
    locale === 'ko' ? 'CASE 03 · PUBLISH' : locale === 'ja' ? 'CASE 03 · PUBLISH' : 'CASE 03 · PUBLISH',
  ]

  return (
    <div className="app-backdrop relative isolate min-h-full overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: text.title.replace('\n', ' '),
          description: text.description,
          url: locale === 'ko' ? siteUrl : localizedUrl(locale, '/landing'),
          inLanguage: locale,
          isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
          about: { '@type': 'SoftwareApplication', name: siteName, applicationCategory: 'MultimediaApplication', operatingSystem: 'Web' },
        }),
      }} />
      <Container size="lg" className="relative py-10 sm:py-14 lg:py-20">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)] lg:items-center lg:gap-14" aria-labelledby="landing-title">
          <div>
            <p className="editor-meta">{text.eyebrow}</p>
            <h1 id="landing-title" className="mt-3 max-w-3xl whitespace-pre-line font-display text-[clamp(2.125rem,5vw,4.5rem)] font-bold leading-[1.04] tracking-[0.015em] text-foreground">{text.title}</h1>
            <p className="mt-6 max-w-2xl font-body text-base leading-7 text-foreground/75 sm:text-lg">{text.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={appHref} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-body text-sm font-bold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                {text.primaryCta}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={guideHref} className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-5 py-3 font-body text-sm font-bold text-foreground transition-colors hover:border-primary/35 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                {text.secondaryCta}
              </Link>
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-6" aria-labelledby="landing-preview-title">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <p className="editor-meta">{text.previewLabel}</p>
              <ShieldCheck className="size-5 text-primary/70" aria-hidden="true" />
            </div>
            <h2 id="landing-preview-title" className="mt-5 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{text.previewTitle}</h2>
            <p className="mt-3 font-body text-sm leading-6 text-foreground/75">{text.previewDescription}</p>
            <div className="mt-6 grid gap-2 border-t border-border pt-5">
              {[text.trustItems[0], text.trustItems[1], text.trustItems[3]].map((item) => (
                <div key={item} className="flex items-start gap-2 font-body text-sm leading-6 text-foreground/80">
                  <Check className="mt-1 size-4 shrink-0 text-primary/70" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-20 sm:mt-24" aria-labelledby="landing-workflow-title">
          <div className="flex flex-col gap-3 border-y border-border py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:py-7">
            <div>
              <p className="editor-meta">{text.workflowEyebrow}</p>
              <h2 id="landing-workflow-title" className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground sm:text-2xl sm:leading-8">{text.workflowTitle}</h2>
            </div>
            <p className="max-w-[38rem] font-body text-sm leading-6 text-muted-foreground sm:text-[15px]">{text.workflowDescription}</p>
          </div>
          <ol className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-5">
            {workflowLabels.map((label, index) => {
              const Icon = workflowIcons[index]
              return (
                <li key={label} className="rounded-xl border border-border bg-card p-4 shadow-subtle sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-bold text-primary/70">{String(index + 1).padStart(2, '0')}</span>
                    <Icon className="size-5 text-primary/70" aria-hidden="true" />
                  </div>
                  <h3 className="mt-7 font-display text-lg font-bold leading-7 tracking-[0.01em] text-foreground">{label}</h3>
                  <p className="mt-2 font-body text-sm leading-6 text-foreground/70">{workflowDescriptions[index]}</p>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="mt-20 sm:mt-24" aria-labelledby="landing-cases-title">
          <div className="flex flex-col gap-3 border-y border-border py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:py-7">
            <div>
              <p className="editor-meta">{text.casesEyebrow}</p>
              <h2 id="landing-cases-title" className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground sm:text-2xl sm:leading-8">{text.casesTitle}</h2>
            </div>
            <p className="max-w-[38rem] font-body text-sm leading-6 text-muted-foreground sm:text-[15px]">{text.casesDescription}</p>
          </div>
          <div className="grid gap-4 pt-6 lg:grid-cols-3">
            {text.caseTitles.map((title, index) => (
              <article key={title} className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-6">
                <p className="editor-meta">{caseLabels[index]}</p>
                <h3 className="mt-4 font-display text-lg font-bold leading-7 tracking-[0.01em] text-foreground">{title}</h3>
                <p className="mt-3 flex-1 font-body text-sm leading-6 text-foreground/75">{text.caseDescriptions[index]}</p>
                <Link href={caseHrefs[index]} className="mt-6 inline-flex items-center gap-2 font-body text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {text.caseLinks[index]}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 sm:mt-24" aria-labelledby="landing-evidence-title">
          <div className="flex flex-col gap-3 border-y border-border py-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:py-7">
            <div>
              <p className="editor-meta">{text.evidenceEyebrow}</p>
              <h2 id="landing-evidence-title" className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground sm:text-2xl sm:leading-8">{text.evidenceTitle}</h2>
            </div>
            <p className="max-w-[38rem] font-body text-sm leading-6 text-muted-foreground sm:text-[15px]">{text.evidenceDescription}</p>
          </div>
          <div className="pt-6">
            <FeatureCoverageTable
              areaLabel={text.evidenceHeaders[0]}
              supportLabel={text.evidenceHeaders[1]}
              notesLabel={text.evidenceHeaders[2]}
              rows={text.evidenceRows}
            />
          </div>
        </section>

        <section className="mt-20 rounded-xl border border-border bg-accent p-5 shadow-subtle sm:mt-24 sm:p-7" aria-labelledby="landing-limits-title">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-12">
            <div>
              <p className="editor-meta">{text.trustEyebrow}</p>
              <h2 id="landing-limits-title" className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{text.trustTitle}</h2>
              <p className="mt-3 font-body text-sm leading-6 text-foreground/75">{text.trustDescription}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {text.trustItems.map((item) => (
                <li key={item} className="flex items-start gap-2 rounded-lg border border-primary/15 bg-background/65 px-4 py-3 font-body text-sm leading-6 text-foreground/80">
                  <Check className="mt-1 size-4 shrink-0 text-primary/70" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-20 border-t border-border pt-8 sm:mt-24" aria-labelledby="landing-final-title">
          <p className="editor-meta">{text.finalEyebrow}</p>
          <h2 id="landing-final-title" className="mt-2 max-w-2xl font-display text-2xl font-bold leading-8 tracking-[0.01em] text-foreground">{text.finalTitle}</h2>
          <p className="mt-3 max-w-2xl font-body text-base leading-7 text-foreground/75">{text.finalDescription}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link href={appHref} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-body text-sm font-bold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              {text.finalCta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={guideHref} className="font-body text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{text.guideLink}</Link>
            <Link href={`/${locale}/about`} className="font-body text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{text.aboutLink}</Link>
          </div>
        </section>
      </Container>
    </div>
  )
}
