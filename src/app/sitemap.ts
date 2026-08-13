import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/markdown'
import { locales } from '@/i18n/request'
import { localizedUrl, siteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date('2026-08-13T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  for (const locale of locales) {
    const contentRoutes = ['', '/blog', '/faq', '/about', '/contact', '/legal/privacy', '/legal/terms']
    for (const path of contentRoutes) {
      routes.push({
        url: localizedUrl(locale, path),
        lastModified: new Date('2026-08-13T00:00:00.000Z'),
        changeFrequency: path === '/blog' ? 'weekly' : 'monthly',
        priority: path === '' ? 0.9 : path === '/blog' ? 0.8 : 0.6,
      })
    }

    for (const post of getAllPosts(locale)) {
      routes.push({
        url: localizedUrl(locale, `/blog/${post.slug}`),
        lastModified: new Date(post.metadata.date),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return routes
}
