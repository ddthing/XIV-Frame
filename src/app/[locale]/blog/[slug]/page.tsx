import React from 'react'
import { getPostBySlug, getAllSlugs } from '@/lib/markdown'
import { notFound } from 'next/navigation'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
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
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href={`/${locale}/blog`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        ← {t('backToList')}
      </Link>
      
      <article className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12">
        <header className="mb-10 text-center">
          <div className="flex justify-center gap-2 mb-6">
            {post.metadata.tags?.map(tag => (
              <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            {post.metadata.title}
          </h1>
          <time dateTime={post.metadata.date} className="text-sm text-slate-500 font-medium">
            {new Date(post.metadata.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        </header>

        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
          <MarkdownRenderer content={post.content} />
        </div>
      </article>

      {/* CTA Section */}
      <section className="mt-12 bg-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto text-lg">{t('ctaDescription')}</p>
          <Link href={`/${locale}`} className="inline-block bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-full transition-transform hover:scale-105 shadow-lg shadow-primary/25">
            {t('ctaButton')}
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">{t('faqTitle')}</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[1, 2, 3].map((num) => (
            <div key={num} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">{t(`faqQ${num}` as any)}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t(`faqA${num}` as any)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
