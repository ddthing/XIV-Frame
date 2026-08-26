import Link from 'next/link'
import { ArrowUpRight, Check, ShieldCheck } from 'lucide-react'
import type { Locale } from '@/i18n/request'
import { Container } from '@/components/layout/Container'
import { localizedUrl, siteName, siteUrl } from '@/lib/site'

interface LandingCopy {
  eyebrow: string
  title: string
  description: string
  primaryCta: string
  secondaryCta: string
  trustLabel: string
  trustTitle: string
  trustDescription: string
  trustItems: [string, string, string]
}

const copy: Record<Locale, LandingCopy> = {
  ko: {
    eyebrow: 'XIV FRAME / BROWSER EDITOR',
    title: '스크린샷을\n한 장의 결과로.',
    description: '파이널판타지14 스크린샷을 여러 장 배치하고 필요한 요소만 다듬어 브라우저에서 결과 파일로 저장하는 편집기입니다.',
    primaryCta: '편집기 열기',
    secondaryCta: '가이드 보기',
    trustLabel: 'LOCAL-FIRST EDITOR',
    trustTitle: '원본은 브라우저 안에 남습니다.',
    trustDescription: '회원가입 없이 시작하세요. 선택한 이미지는 XIV Frame 이미지 서버에 업로드하지 않습니다.',
    trustItems: ['최대 16장 배치', '레이아웃·합성·시그니처', '결과 파일로 저장'],
  },
  en: {
    eyebrow: 'XIV FRAME / BROWSER EDITOR',
    title: 'Turn FFXIV screenshots\ninto one finished image.',
    description: 'Arrange your screenshots, refine only what you need, and save the result file in the browser.',
    primaryCta: 'Open the editor',
    secondaryCta: 'Read the guide',
    trustLabel: 'LOCAL-FIRST EDITOR',
    trustTitle: 'Your originals stay in the browser.',
    trustDescription: 'Start without an account. Selected images are not uploaded to an XIV Frame image server.',
    trustItems: ['Arrange up to 16 images', 'Layouts, composites, signatures', 'Save the result file'],
  },
  ja: {
    eyebrow: 'XIV FRAME / BROWSER EDITOR',
    title: 'FFXIVのスクリーンショットを\n一枚の成果に。',
    description: '画像を配置し、必要な要素だけを整えて、ブラウザから結果ファイルを保存できます。',
    primaryCta: 'エディターを開く',
    secondaryCta: 'ガイドを見る',
    trustLabel: 'LOCAL-FIRST EDITOR',
    trustTitle: '元画像はブラウザ内に残ります。',
    trustDescription: 'アカウントなしで始められます。選択した画像はXIV Frameの画像サーバーへアップロードしません。',
    trustItems: ['最大16枚を配置', 'レイアウト・合成・署名', '結果ファイルを保存'],
  },
}

export function LandingPage({ locale }: { locale: Locale }) {
  const text = copy[locale]
  const appHref = `/${locale}`
  const guideHref = `/${locale}/blog`

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
      <Container size="lg" className="relative py-12 sm:py-16 lg:min-h-[32rem] lg:py-20">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:items-center lg:gap-16" aria-labelledby="landing-title">
          <div>
            <p className="editor-meta">{text.eyebrow}</p>
            <h1 id="landing-title" className="mt-3 max-w-2xl whitespace-pre-line font-display text-balance text-[clamp(2.25rem,5vw,4.5rem)] font-bold leading-[1.06] tracking-[0.01em] text-foreground">{text.title}</h1>
            <p className="mt-6 max-w-xl font-body text-base leading-7 text-foreground/75 sm:text-lg">{text.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={appHref} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-body text-sm font-bold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                {text.primaryCta}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={guideHref} className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-3 font-body text-sm font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                {text.secondaryCta}
              </Link>
            </div>
          </div>

          <aside className="rounded-xl border border-border bg-card p-5 shadow-subtle sm:p-6" aria-labelledby="landing-trust-title">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <p className="editor-meta">{text.trustLabel}</p>
              <ShieldCheck className="size-5 text-primary/70" aria-hidden="true" />
            </div>
            <h2 id="landing-trust-title" className="mt-5 max-w-sm font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground sm:text-2xl sm:leading-8">{text.trustTitle}</h2>
            <p className="mt-3 max-w-md font-body text-sm leading-6 text-foreground/75">{text.trustDescription}</p>
            <ul className="mt-7 grid gap-3 border-t border-border pt-6" aria-label={text.trustLabel}>
              {text.trustItems.map((item) => (
                <li key={item} className="flex items-start gap-2 font-body text-sm leading-6 text-foreground/80">
                  <Check className="mt-1 size-4 shrink-0 text-primary/70" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>
      </Container>
    </div>
  )
}
