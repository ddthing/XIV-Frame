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
    <Container size="sm" className="pt-24 pb-8 lg:pt-32 lg:pb-16">
      <Link href={`/${locale}/blog`} className="inline-flex items-center text-[14px] font-medium text-foreground hover:bg-muted px-4 py-2 rounded-md border border-transparent hover:border-border transition-colors mb-8">
        ← {t('back')}
      </Link>
      
      <article>
        <header className="mb-10 text-center">
          <h1 className="text-[32px] lg:text-[40px] font-extrabold tracking-[0.04em] text-foreground mb-4 leading-[1.2] font-['Bricolage_Grotesque']">
            {post.metadata.title}
          </h1>
          <time dateTime={post.metadata.date} className="text-[14px] text-muted-foreground font-medium">
            {new Date(post.metadata.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        </header>

        <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-[16px] prose-p:text-foreground prose-p:leading-[1.6] prose-li:text-[16px] prose-li:text-foreground prose-li:leading-[1.6] prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl break-words">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      {/* CTA Section */}
      <section className="mt-12 bg-muted border border-border shadow-subtle rounded-xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-[28px] font-extrabold tracking-[0.04em] mb-3 text-foreground font-['Bricolage_Grotesque']">{t('ctaTitle')}</h2>
          <p className="text-[16px] text-foreground mb-6 max-w-xl mx-auto font-normal leading-[1.5]">{t('ctaDescription')}</p>
          <Link 
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-[40px] py-[19px] text-[16px] font-medium text-[#fcfaf5] bg-[#1a3300] rounded-[6px] shadow-subtle hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            {t('ctaButton')} →
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-12">
        <h2 className="text-[28px] font-extrabold tracking-[0.04em] text-foreground mb-6 text-center font-['Bricolage_Grotesque']">{t('faqTitle')}</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[1, 2, 3].map((num) => (
            <div key={num} className="bg-card border border-border rounded-xl shadow-subtle p-6 sm:p-8">
              <h3 className="font-semibold text-[20px] text-foreground mb-3">{t(`faqQ${num}` as any)}</h3>
              <p className="text-[16px] text-foreground leading-[1.5] tracking-[-0.01em] break-words font-normal">{t(`faqA${num}` as any)}</p>
            </div>
          ))}
        </div>
      </section>
    </Container>
  )
}
