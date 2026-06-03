import React from 'react'
import Link from 'next/link'
import { getAllPosts } from '@/lib/markdown'
import { getTranslations, setRequestLocale } from 'next-intl/server'
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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{t('title')}</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className="group flex flex-col h-full">
            <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full transition-all hover:shadow-md hover:border-slate-200">
              <div className="p-6 flex flex-col h-full flex-1">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <time dateTime={post.metadata.date}>
                    {new Date(post.metadata.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                  <div className="flex gap-2">
                    {post.metadata.tags?.map(tag => (
                      <span key={tag} className="bg-slate-100 px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
                  {post.metadata.title}
                </h2>
                <p className="text-sm text-slate-600 line-clamp-3 mb-6">
                  {post.metadata.description}
                </p>
                <div className="mt-auto pt-4 flex items-center text-sm font-semibold text-primary">
                  {t('readMore')} <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
