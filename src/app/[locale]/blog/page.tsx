import React from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getAllPosts } from '@/lib/markdown'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ContentPage } from '@/components/layout/ContentPage'
import { locales } from '@/i18n/request'
import { Metadata } from 'next'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Blog' })

  const title = t('title')
  const description = t('description')
  const canonicalUrl = `https://xiv-frame.com/${locale}/blog`

  const languages = locales.reduce((acc, l) => {
    acc[l] = `https://xiv-frame.com/${l}/blog`
    return acc
  }, {} as Record<string, string>)
  languages['x-default'] = `https://xiv-frame.com/ko/blog`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
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
  const [featured, ...rest] = posts

  const renderPost = (post: (typeof posts)[number], index: number, isFeatured = false) => (
    <Link
      key={post.slug}
      href={`/${locale}/blog/${post.slug}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <article className={`flex h-full flex-col rounded-xl border border-border p-5 shadow-subtle transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-md sm:p-6 ${isFeatured ? 'bg-sticky-note-mint lg:min-h-[20rem]' : 'bg-card'}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="editor-meta">{isFeatured ? 'FEATURED' : `GUIDE ${String(index + 1).padStart(2, '0')}`}</p>
          <time dateTime={post.metadata.date} className="font-body text-xs font-medium text-muted-foreground">
            {new Date(post.metadata.date).toLocaleDateString(locale)}
          </time>
        </div>
        <h2 className={`mt-6 font-display font-bold leading-tight tracking-[0.01em] text-foreground transition-colors group-hover:text-primary ${isFeatured ? 'text-2xl' : 'text-xl'}`}>
          {post.metadata.title}
        </h2>
        <p className="mt-3 flex-1 font-body text-[13px] leading-5 text-foreground/75">
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
    <ContentPage eyebrow="03 / GUIDE" title={t('title')} description={t('description')} size="lg" density="editor">
      <section className="mb-8 border-y border-border py-4" aria-labelledby="guide-flow-title">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <p id="guide-flow-title" className="editor-meta">{t('flowTitle')}</p>
          <p className="max-w-[42rem] font-body text-[13px] leading-5 text-muted-foreground">{t('flowDescription')}</p>
        </div>
        <ol className="mt-4 grid gap-4 sm:grid-cols-4">
          {[
            ['01', t('flowStepUpload'), t('flowStepUploadDescription')],
            ['02', t('flowStepArrange'), t('flowStepArrangeDescription')],
            ['03', t('flowStepStyle'), t('flowStepStyleDescription')],
            ['04', t('flowStepExport'), t('flowStepExportDescription')],
          ].map(([index, title, description]) => (
            <li key={index} className="min-w-0">
              <p className="editor-meta">{index}</p>
              <h2 className="mt-2 font-display text-base font-bold leading-6 tracking-[0.01em] text-foreground">{title}</h2>
              <p className="mt-1 font-body text-[13px] leading-5 text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
      </section>
      {featured ? (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {renderPost(featured, 0, true)}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {rest.map((post, index) => renderPost(post, index + 1))}
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center font-body text-muted-foreground">{t('description')}</p>
      )}
    </ContentPage>
  )
}
