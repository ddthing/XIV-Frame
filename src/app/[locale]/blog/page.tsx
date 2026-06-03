import React from 'react'
import Link from 'next/link'
import { getAllPosts } from '@/lib/markdown'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Container } from '@/components/layout/Container'
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

  return (
    <Container size="md" className="py-12 lg:py-24">
      <div className="mb-16 text-center space-y-4">
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-[1.75] tracking-[-0.01em] break-keep">
          {t('description')}
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className="block group">
            <article className="p-6 sm:p-8 bg-card border border-border rounded-[24px] shadow-none hover:bg-muted/50 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 mb-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {post.metadata.title}
                </h2>
                <time className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(post.metadata.date).toLocaleDateString(locale)}
                </time>
              </div>
              <p className="text-muted-foreground leading-[1.75] tracking-[-0.01em] break-keep">
                {post.metadata.description}
              </p>
              <div className="mt-6 flex items-center text-sm font-normal text-primary">
                {t('readMore')} <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </Container>
  )
}
