import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'src', 'content', 'blog')

export interface PostMetadata {
  title: string
  description: string
  date: string
  tags?: string[]
}

export interface Post {
  slug: string
  locale: string
  metadata: PostMetadata
  content: string
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(contentDirectory)) return []
  return fs.readdirSync(contentDirectory).filter(file => {
    return fs.statSync(path.join(contentDirectory, file)).isDirectory()
  })
}

export function getPostBySlug(slug: string, locale: string): Post | null {
  try {
    const fullPath = path.join(contentDirectory, slug, `${locale}.md`)
    if (!fs.existsSync(fullPath)) {
      // Fallback to 'ko' if the requested locale is not available
      const fallbackPath = path.join(contentDirectory, slug, `ko.md`)
      if (!fs.existsSync(fallbackPath)) return null
      
      const fileContents = fs.readFileSync(fallbackPath, 'utf8')
      const { data, content } = matter(fileContents)
      return { slug, locale: 'ko', metadata: data as PostMetadata, content }
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    return { slug, locale, metadata: data as PostMetadata, content }
  } catch (e) {
    console.error(`Error reading post ${slug} for locale ${locale}:`, e)
    return null
  }
}

export function getAllPosts(locale: string): Post[] {
  const slugs = getAllSlugs()
  const posts = slugs
    .map(slug => getPostBySlug(slug, locale))
    .filter((post): post is Post => post !== null)
    .sort((a, b) => (new Date(b.metadata.date).getTime() > new Date(a.metadata.date).getTime() ? 1 : -1))
  return posts
}
