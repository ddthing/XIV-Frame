import { Feed } from 'feed'
import { getAllPosts } from '@/lib/markdown'

export const dynamic = 'force-static'

export async function GET() {
  const site_url = 'https://xiv-frame.com'
  
  const feed = new Feed({
    title: 'XIV Frame Blog',
    description: 'Guides and tips for FFXIV screenshots, GPose, and XIV Frame.',
    id: site_url,
    link: site_url,
    language: 'ko', // default
    image: `${site_url}/og-image.jpg`,
    favicon: `${site_url}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, XIV Frame`,
    author: {
      name: 'XIV Frame',
      email: 'contact@xiv-frame.com',
      link: site_url,
    },
  })

  // Add posts from default locale ('ko') to RSS
  const posts = getAllPosts('ko')

  posts.forEach((post) => {
    feed.addItem({
      title: post.metadata.title,
      id: `${site_url}/ko/blog/${post.slug}`,
      link: `${site_url}/ko/blog/${post.slug}`,
      description: post.metadata.description,
      content: post.metadata.description,
      author: [
        {
          name: 'XIV Frame',
          email: 'contact@xiv-frame.com',
          link: site_url,
        },
      ],
      date: new Date(post.metadata.date),
    })
  })

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
