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
    <Container size="md" className="pt-32 pb-12 lg:pt-40 lg:pb-24">
      <div className="mb-16 text-center space-y-4">
        <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-[6px] bg-[#ffe95c]">
          <span className="text-[14px] font-bold text-[#1a3300] tracking-tight">지식 보관소</span>
        </div>
        <h1 className="text-[55px] lg:text-[72px] font-extrabold tracking-[0.04em] text-foreground leading-[1.1] font-['Bricolage_Grotesque']">
          {t('title')}
        </h1>
        <p className="text-[18px] lg:text-[20px] text-foreground font-normal max-w-2xl mx-auto leading-[1.5] mt-6">
          {t('description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        {posts.map((post, index) => {
          const pastelColors = ['bg-[#fcfaf5]', 'bg-[#d5f5c2]', 'bg-[#fcfaf5]', 'bg-[#a8e5e5]', 'bg-[#fcfaf5]', 'bg-[#f6d0ff]'];
          const bgColor = pastelColors[index % pastelColors.length];
          return (
            <Link key={post.slug} href={`/${locale}/blog/${post.slug}`} className="block group h-full">
              <article className={`p-8 border border-border rounded-[12px] transition-transform hover:-translate-y-1 hover:shadow-subtle ${bgColor} flex flex-col h-full`}>
                <div className="flex flex-col gap-3 mb-4">
                  <time className="text-[14px] text-foreground/60 font-medium font-mono uppercase tracking-wider">
                    {new Date(post.metadata.date).toLocaleDateString(locale)}
                  </time>
                  <h2 className="text-[24px] font-bold tracking-tight text-foreground leading-[1.3] group-hover:text-primary transition-colors line-clamp-3">
                    {post.metadata.title}
                  </h2>
                </div>
                <p className="text-[16px] text-foreground/80 leading-[1.5] tracking-[-0.01em] break-words font-normal flex-1">
                  {post.metadata.description}
                </p>
                <div className="mt-8 flex items-center text-[16px] font-bold text-foreground">
                  {t('readMore')} <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </article>
            </Link>
          )
        })}
      </div>
    </Container>
  )
}
