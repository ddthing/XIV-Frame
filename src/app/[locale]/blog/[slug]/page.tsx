import React from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { getPostBySlug, getRelatedPosts, getAllSlugs } from '@/lib/markdown'
import { notFound } from 'next/navigation'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { ContentPage } from '@/components/layout/ContentPage'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { locales } from '@/i18n/request'
import { Metadata } from 'next'
import Link from 'next/link'
import { articleJsonLd, breadcrumbJsonLd, localizedAlternates, localizedUrl, operatorName } from '@/lib/site'

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

  const canonicalUrl = localizedUrl(locale, `/blog/${slug}`)
  const modifiedDate = post.metadata.updated ?? post.metadata.date

  return {
    title: post.metadata.title,
    description: post.metadata.description,
    alternates: {
      canonical: canonicalUrl,
      languages: localizedAlternates(`/blog/${slug}`),
    },
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.metadata.date,
      modifiedTime: modifiedDate,
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
  const modifiedDate = post.metadata.updated ?? post.metadata.date
  const formattedModifiedDate = new Date(modifiedDate).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  const canonicalUrl = localizedUrl(locale, `/blog/${slug}`)
  const relatedPosts = getRelatedPosts(slug, locale)
  return (
    <ContentPage eyebrow={`03 / GUIDE · ${post.metadata.category ?? 'GUIDE'}`} title={post.metadata.title} description={post.metadata.description} size="sm" density="editor">
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            articleJsonLd({
              url: canonicalUrl,
              title: post.metadata.title,
              description: post.metadata.description,
              datePublished: post.metadata.date,
              dateModified: modifiedDate,
              inLanguage: locale,
              articleSection: post.metadata.category,
            }),
            breadcrumbJsonLd([
              { name: 'XIV Frame', url: localizedUrl(locale) },
              { name: t('title'), url: localizedUrl(locale, '/blog') },
              { name: post.metadata.title },
            ]),
          ],
        }),
      }} />
      <Link href={`/${locale}/blog`} className="mb-6 inline-flex h-9 items-center gap-2 rounded-md border border-transparent px-3 py-2 font-body text-xs font-semibold text-foreground transition-colors hover:border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <ArrowLeft size={16} aria-hidden="true" />
        {t('back')}
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 font-body text-xs text-muted-foreground">
        <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 font-semibold text-foreground">{post.metadata.category ?? t('guideLabel')}</span>
        <span><span className="mr-1.5 font-semibold text-foreground/70">{t('publishedLabel')}</span>{formattedDate}</span>
        <span><span className="mr-1.5 font-semibold text-foreground/70">{t('updatedLabel')}</span><time dateTime={modifiedDate}>{formattedModifiedDate}</time></span>
      </div>

      <aside className="mb-8 rounded-lg border border-primary/15 bg-muted/35 p-4 sm:p-5" aria-label={t('reviewEyebrow')}>
        <p className="editor-meta">{t('reviewEyebrow')}</p>
        <p className="mt-2 max-w-3xl font-body text-[13px] leading-6 text-foreground/75">{t('reviewDescription')}</p>
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/80 pt-3 font-body text-xs text-muted-foreground">
          <div className="flex gap-1.5">
            <dt className="font-semibold text-foreground/70">{t('maintainerLabel')}</dt>
            <dd>{operatorName}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="font-semibold text-foreground/70">{t('reviewedLabel')}</dt>
            <dd><time dateTime={modifiedDate}>{formattedModifiedDate}</time></dd>
          </div>
        </dl>
      </aside>

      <article>
        <div className="prose max-w-none break-words font-body prose-headings:font-display prose-headings:font-bold prose-headings:tracking-[0.01em] prose-headings:text-xl prose-headings:leading-7 prose-headings:text-foreground prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base prose-h3:leading-6 prose-p:text-[13px] prose-p:leading-5 prose-p:text-foreground/80 prose-li:text-[13px] prose-li:leading-5 prose-li:text-foreground/80 prose-ol:list-decimal prose-ol:pl-5 prose-ul:list-disc prose-ul:pl-5 prose-strong:font-semibold prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-primary/75 prose-img:rounded-xl">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      <section className="mt-10 rounded-xl border border-border bg-accent p-5 shadow-subtle sm:p-6">
        <p className="editor-meta">NEXT STEP</p>
        <h2 className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{t('ctaTitle')}</h2>
        <p className="mt-2 max-w-xl font-body text-[13px] leading-5 text-foreground/80">{t('ctaDescription')}</p>
        <Link href={`/${locale}`} className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-body text-xs font-bold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-accent">
          {t('ctaButton')}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <p className="editor-meta">REFERENCE</p>
        <h2 className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{t('faqTitle')}</h2>
        <p className="mt-2 max-w-xl font-body text-[13px] leading-5 text-foreground/75">{t('faqLinkDescription')}</p>
        <Link href={`/${locale}/faq`} className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 font-body text-xs font-bold text-foreground transition-colors hover:border-primary/35 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          {t('faqLink')}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </section>

      {relatedPosts.length > 0 && (
        <section className="mt-10 border-t border-border pt-8" aria-labelledby="related-guides-title">
          <p className="editor-meta">{t('relatedLabel')}</p>
          <h2 id="related-guides-title" className="mt-2 font-display text-xl font-bold leading-7 tracking-[0.01em] text-foreground">{t('relatedTitle')}</h2>
          <p className="mt-2 max-w-xl font-body text-[13px] leading-5 text-foreground/75">{t('relatedDescription')}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.slug} href={`/${locale}/blog/${relatedPost.slug}`} className="group rounded-lg border border-border bg-card p-4 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <p className="editor-meta">{relatedPost.metadata.category ?? t('guideLabel')}</p>
                <h3 className="mt-2 font-display text-base font-bold leading-6 text-foreground transition-colors group-hover:text-primary">{relatedPost.metadata.title}</h3>
                <p className="mt-2 line-clamp-3 font-body text-xs leading-5 text-muted-foreground">{relatedPost.metadata.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </ContentPage>
  )
}
