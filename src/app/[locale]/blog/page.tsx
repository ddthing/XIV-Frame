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
      <article className={`flex h-full flex-col rounded-xl border border-border p-6 shadow-subtle transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-md sm:p-8 ${isFeatured ? 'bg-sticky-note-mint lg:min-h-[22rem]' : 'bg-card'}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="editor-meta">{isFeatured ? 'FEATURED' : `GUIDE ${String(index + 1).padStart(2, '0')}`}</p>
          <time dateTime={post.metadata.date} className="font-body text-xs font-medium text-muted-foreground">
            {new Date(post.metadata.date).toLocaleDateString(locale)}
          </time>
        </div>
        <h2 className={`mt-8 font-display font-bold leading-tight tracking-[0.02em] text-foreground transition-colors group-hover:text-primary ${isFeatured ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
          {post.metadata.title}
        </h2>
        <p className="mt-4 flex-1 font-body text-base leading-7 text-foreground/75">
          {post.metadata.description}
        </p>
        <div className="mt-8 inline-flex items-center gap-2 font-body text-sm font-bold text-foreground">
          {t('readMore')}
          <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </article>
    </Link>
  )

  return (
    <ContentPage eyebrow="03 / GUIDE" title={t('title')} description={t('description')} size="lg">
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
