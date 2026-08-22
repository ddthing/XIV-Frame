export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://xiv-frame.pages.dev').replace(/\/$/, '')
export const siteName = 'XIV Frame'
export const operatorName = 'ddthing / XIV Frame'
export const operatorUrl = 'https://github.com/ddthing/XIV-Frame'

export function localizedUrl(locale: string, path = '') {
  const normalizedPath = path ? `/${path.replace(/^\//, '')}` : ''
  return `${siteUrl}/${locale}${normalizedPath}`
}

export function localizedAlternates(path = '') {
  return {
    ko: localizedUrl('ko', path),
    en: localizedUrl('en', path),
    ja: localizedUrl('ja', path),
    'x-default': localizedUrl('ko', path),
  }
}

export function homeAlternates() {
  return {
    ko: siteUrl,
    en: `${siteUrl}/en/landing`,
    ja: `${siteUrl}/ja/landing`,
    'x-default': siteUrl,
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; url?: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  }
}

export function articleJsonLd({
  url,
  title,
  description,
  datePublished,
  dateModified = datePublished,
  inLanguage,
  articleSection,
}: {
  url: string
  title: string
  description: string
  datePublished: string
  dateModified?: string
  inLanguage: string
  articleSection?: string
}) {
  return {
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished,
    dateModified,
    inLanguage,
    ...(articleSection ? { articleSection } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: {
      '@type': 'Organization',
      name: operatorName,
      url: operatorUrl,
      sameAs: [operatorUrl],
    },
    publisher: {
      '@type': 'Organization',
      name: operatorName,
      url: operatorUrl,
      sameAs: [operatorUrl],
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/og-image.jpg`,
      },
    },
    image: `${siteUrl}/og-image.jpg`,
  }
}
