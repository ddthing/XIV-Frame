import React from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getPostBySlug, getAllSlugs } from '@/lib/markdown'
import { notFound } from 'next/navigation'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { ContentPage } from '@/components/layout/ContentPage'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { locales } from '@/i18n/request'
import { Metadata } from 'next'
import Link from 'next/link'

interface PostPageProps {
  params: Promise<{ locale: string, slug: string }>
}

export function generateStaticParams() {
  const slugs = getAllSlugs()
  const params: { locale: string; slug: string }[] = []

  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, slug })
    }
  }

  return params
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const post = getPostBySlug(slug, locale)
  if (!post) {
    return {}
  }

  const canonicalUrl = `https://xiv-frame.com/${locale}/blog/${slug}`

  const languages = locales.reduce((acc, l) => {
    acc[l] = `https://xiv-frame.com/${l}/blog/${slug}`
    return acc
  }, {} as Record<string, string>)
  languages['x-default'] = `https://xiv-frame.com/ko/blog/${slug}`

  return {
    title: `${post.metadata.title} | XIV Frame`,
    description: post.metadata.description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.metadata.date,
      tags: post.metadata.tags,
      images: ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metadata.title,
      description: post.metadata.description,
      images: ['/og-image.jpg'],
    },
  }
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const post = getPostBySlug(slug, locale)
  const t = await getTranslations({ locale, namespace: 'Blog' })

  if (!post) {
    notFound()
  }

  const formattedDate = new Date(post.metadata.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  const faqKeys = {
    questions: ['faqQ1', 'faqQ2', 'faqQ3'],
    answers: ['faqA1', 'faqA2', 'faqA3'],
  } as const

  return (
    <ContentPage eyebrow={`03 / GUIDE · ${formattedDate}`} title={post.metadata.title} description={post.metadata.description} size="sm" density="editor">
      <Link href={`/${locale}/blog`} className="mb-6 inline-flex h-9 items-center gap-2 rounded-md border border-transparent px-3 py-2 font-body text-xs font-semibold text-foreground transition-colors hover:border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('back')}
      </Link>

      <article>
        <div className="prose max-w-none break-words font-body prose-headings:font-display prose-headings:font-bold prose-headings:tracking-[0.01em] prose-headings:text-xl prose-headings:leading-7 prose-headings:text-foreground prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base prose-h3:leading-6 prose-p:text-[13px] prose-p:leading-5 prose-p:text-foreground/80 prose-li:text-[13px] prose-li:leading-5 prose-li:text-foreground/80 prose-ol:list-decimal prose-ol:pl-5 prose-ul:list-disc prose-ul:pl-5 prose-strong:font-semibold prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-primary/75 prose-img:rounded-xl">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      <section className="mt-10 rounded-xl border border-border bg-sticky-note-mint p-5 shadow-subtle sm:p-6">
        <p className="editor-meta">NEXT STEP</p>
        <h2 className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{t('ctaTitle')}</h2>
        <p className="mt-2 max-w-xl font-body text-[13px] leading-5 text-foreground/80">{t('ctaDescription')}</p>
        <Link href={`/${locale}`} className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-body text-xs font-bold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sticky-note-mint">
          {t('ctaButton')}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <p className="editor-meta">FAQ</p>
        <h2 className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{t('faqTitle')}</h2>
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((num) => (
            <div key={num} className="rounded-xl border border-border bg-card p-4 shadow-subtle sm:p-5">
              <h3 className="font-display text-base font-bold leading-6 text-foreground">{t(faqKeys.questions[num - 1])}</h3>
              <p className="mt-2 font-body text-[13px] leading-5 text-foreground/75">{t(faqKeys.answers[num - 1])}</p>
            </div>
          ))}
        </div>
      </section>
    </ContentPage>
  )
}
