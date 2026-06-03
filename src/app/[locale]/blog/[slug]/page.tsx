import React from 'react'
import { getPostBySlug, getAllSlugs } from '@/lib/markdown'
import { notFound } from 'next/navigation'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { Container } from '@/components/layout/Container'
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

  return (
    <Container size="sm" className="py-12 lg:py-24">
      <Link href={`/${locale}/blog`} className="inline-flex items-center text-sm font-normal text-muted-foreground hover:text-foreground mb-12 transition-colors">
        ← {t('back')}
      </Link>
      
      <article>
        <header className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-normal tracking-tight text-foreground mb-6">
            {post.metadata.title}
          </h1>
          <time dateTime={post.metadata.date} className="text-sm text-muted-foreground font-normal">
            {new Date(post.metadata.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        </header>

        <div className="prose dark:prose-invert prose-lg max-w-none prose-headings:font-normal prose-headings:tracking-tight prose-p:leading-[1.75] prose-p:tracking-[-0.01em] prose-li:leading-[1.75] prose-li:tracking-[-0.01em] prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl break-keep">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      {/* CTA Section */}
      <section className="mt-16 bg-muted rounded-[32px] p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl font-normal tracking-tight mb-4 text-foreground">{t('ctaTitle')}</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">{t('ctaDescription')}</p>
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-10 py-6 text-base font-normal text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-colors"
          >
            {t('ctaButton')}
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-20">
        <h2 className="text-3xl font-normal tracking-tight text-foreground mb-8 text-center">{t('faqTitle')}</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[1, 2, 3].map((num) => (
            <div key={num} className="bg-card border border-border rounded-[24px] p-6 sm:p-8">
              <h3 className="font-normal text-xl tracking-tight text-foreground mb-3">{t(`faqQ${num}` as any)}</h3>
              <p className="text-muted-foreground leading-[1.75] tracking-[-0.01em] break-keep">{t(`faqA${num}` as any)}</p>
            </div>
          ))}
        </div>
      </section>
    </Container>
  )
}
