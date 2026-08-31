import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getAllPosts } from '@/lib/markdown'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ContentPage } from '@/components/layout/ContentPage'
import { locales } from '@/i18n/request'
import { Metadata } from 'next'
import { Download, ImagePlus, LayoutGrid, Type, WandSparkles } from 'lucide-react'
import { GuideWorkflow } from '@/components/content/GuideWorkflow'
import { GuideScenarios } from '@/components/content/GuideScenarios'
import { localizedAlternates, localizedUrl } from '@/lib/site'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Blog' })

  const title = t('title')
  const description = t('description')
  const canonicalUrl = localizedUrl(locale, '/blog')

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: localizedAlternates('/blog'),
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
  }
}

export default async function BlogIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const posts = getAllPosts(locale)
  const t = await getTranslations({ locale, namespace: 'Blog' })
  const featured = posts.find((post) => post.slug === 'edit-ffxiv-screenshots-without-photoshop') ?? posts[0]
  const rest = featured ? posts.filter((post) => post.slug !== featured.slug) : []

  const renderPost = (post: (typeof posts)[number], index: number, isFeatured = false) => (
    <Link
      key={post.slug}
      href={`/${locale}/blog/${post.slug}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <article className={`flex flex-col rounded-xl border border-border p-5 shadow-subtle transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-subtle-2 sm:p-6 ${isFeatured ? 'bg-accent' : 'bg-card'}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="editor-meta">{isFeatured ? t('featuredLabel') : `${t('guideLabel')} ${String(index + 1).padStart(2, '0')}`}</p>
          <div className="flex items-center gap-2 font-body text-xs font-medium text-foreground/70">
            <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/70">{post.metadata.category ?? t('guideLabel')}</span>
            <time dateTime={post.metadata.updated ?? post.metadata.date}>
              {new Date(post.metadata.updated ?? post.metadata.date).toLocaleDateString(locale)}
            </time>
          </div>
        </div>
        <h2 className={`mt-6 font-display font-bold leading-tight tracking-[0.01em] text-foreground transition-colors group-hover:text-primary ${isFeatured ? 'text-xl' : 'text-lg'}`}>
          {post.metadata.title}
        </h2>
        <p className="mt-3 font-body text-[13px] leading-5 text-foreground/75">
          {post.metadata.description}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 font-body text-xs font-bold text-foreground">
          {t('readMore')}
          <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </article>
    </Link>
  )

  return (
    <ContentPage eyebrow={t('guideEyebrow')} title={t('title')} description={t('description')} size="lg" density="editor">
      <GuideWorkflow
        eyebrow={t('startHereLabel')}
        title={t('flowTitle')}
        description={t('flowDescription')}
        steps={[
          {
            number: '01',
            label: t('flowStepUpload'),
            description: t('flowStepUploadDescription'),
            href: `/${locale}/blog/edit-ffxiv-screenshots-without-photoshop`,
            icon: ImagePlus,
          },
          {
            number: '02',
            label: t('flowStepArrange'),
            description: t('flowStepArrangeDescription'),
            href: `/${locale}/blog/how-to-combine-ffxiv-screenshots`,
            icon: LayoutGrid,
          },
          {
            number: '03',
            label: t('flowStepComposite'),
            description: t('flowStepCompositeDescription'),
            href: `/${locale}/blog/composite-elements-background-removal`,
            icon: WandSparkles,
          },
          {
            number: '04',
            label: t('flowStepStyle'),
            description: t('flowStepStyleDescription'),
            href: `/${locale}/blog/ffxiv-screenshot-character-signature`,
            icon: Type,
          },
          {
            number: '05',
            label: t('flowStepExport'),
            description: t('flowStepExportDescription'),
            href: `/${locale}/blog/edit-ffxiv-screenshots-without-photoshop`,
            icon: Download,
          },
        ]}
      />
      <section className="mb-12 grid gap-5 rounded-xl border border-border bg-card p-5 shadow-subtle sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:p-6" aria-labelledby="guide-editorial-note-title">
        <div>
          <p className="editor-meta">{t('contentNoteEyebrow')}</p>
          <h2 id="guide-editorial-note-title" className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{t('contentNoteTitle')}</h2>
          <p className="mt-2 max-w-2xl font-body text-[13px] leading-6 text-foreground/75">{t('contentNoteDescription')}</p>
        </div>
        <ul className="grid content-start gap-2 font-body text-sm leading-6 text-foreground/80 sm:pl-4">
          <li className="flex gap-2"><span className="font-mono text-xs font-bold text-primary">01</span>{t('contentNoteOriginal')}</li>
          <li className="flex gap-2"><span className="font-mono text-xs font-bold text-primary">02</span>{t('contentNotePractical')}</li>
          <li className="flex gap-2"><span className="font-mono text-xs font-bold text-primary">03</span>{t('contentNoteReviewed')}</li>
        </ul>
      </section>
      <GuideScenarios
        eyebrow={t('scenarioEyebrow')}
        title={t('scenarioTitle')}
        description={t('scenarioDescription')}
        scenarios={[
          {
            kind: 'showcase',
            eyebrow: t('scenarioShowcaseEyebrow'),
            title: t('scenarioShowcaseTitle'),
            description: t('scenarioShowcaseDescription'),
            decisionLabel: t('scenarioDecisionLabel'),
            decision: t('scenarioShowcaseDecision'),
            href: `/${locale}/blog/creating-ffxiv-glamour-showcase`,
            linkLabel: t('scenarioReadMore'),
          },
          {
            kind: 'composite',
            eyebrow: t('scenarioCompositeEyebrow'),
            title: t('scenarioCompositeTitle'),
            description: t('scenarioCompositeDescription'),
            decisionLabel: t('scenarioDecisionLabel'),
            decision: t('scenarioCompositeDecision'),
            href: `/${locale}/blog/composite-elements-background-removal`,
            linkLabel: t('scenarioReadMore'),
          },
          {
            kind: 'publish',
            eyebrow: t('scenarioPublishEyebrow'),
            title: t('scenarioPublishTitle'),
            description: t('scenarioPublishDescription'),
            decisionLabel: t('scenarioDecisionLabel'),
            decision: t('scenarioPublishDecision'),
            href: `/${locale}/blog/ffxiv-screenshot-publishing-checklist`,
            linkLabel: t('scenarioReadMore'),
          },
        ]}
      />
      {featured ? (
        <div className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {renderPost(featured, 0, true)}
          {rest.map((post, index) => renderPost(post, index + 1))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center font-body text-muted-foreground">{t('description')}</p>
      )}
    </ContentPage>
  )
}
