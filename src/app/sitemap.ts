import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/markdown'
import { locales } from '@/i18n/request'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs()
  const siteUrl = 'https://xiv-frame.com'

  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  for (const locale of locales) {
    routes.push({
      url: `${siteUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })

    for (const slug of slugs) {
      routes.push({
        url: `${siteUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return routes
}
