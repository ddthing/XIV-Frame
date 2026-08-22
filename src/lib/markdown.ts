import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'src', 'content', 'blog')

export interface PostMetadata {
  title: string
  description: string
  date: string
  updated?: string
  category?: string
  tags?: string[]
}

export interface Post {
  slug: string
  locale: string
  metadata: PostMetadata
  content: string
}

const relatedGuideSlugs: Record<string, string[]> = {
  'adding-custom-logos-ffxiv-screenshots': [
    'ffxiv-screenshot-character-signature',
    'ffxiv-screenshot-publishing-checklist',
    'edit-ffxiv-screenshots-without-photoshop',
  ],
  'composite-elements-background-removal': [
    'large-ffxiv-screenshots-upload',
    'ffxiv-screenshot-publishing-checklist',
    'edit-ffxiv-screenshots-without-photoshop',
  ],
  'creating-ffxiv-glamour-showcase': [
    'how-to-combine-ffxiv-screenshots',
    'ffxiv-screenshot-character-signature',
    'ffxiv-screenshot-publishing-checklist',
  ],
  'edit-ffxiv-screenshots-without-photoshop': [
    'how-to-combine-ffxiv-screenshots',
    'composite-elements-background-removal',
    'ffxiv-screenshot-character-signature',
  ],
  'ffxiv-screenshot-character-signature': [
    'adding-custom-logos-ffxiv-screenshots',
    'edit-ffxiv-screenshots-without-photoshop',
    'ffxiv-screenshot-publishing-checklist',
  ],
  'ffxiv-screenshot-publishing-checklist': [
    'composite-elements-background-removal',
    'ffxiv-screenshot-character-signature',
    'large-ffxiv-screenshots-upload',
  ],
  'how-to-combine-ffxiv-screenshots': [
    'creating-ffxiv-glamour-showcase',
    'large-ffxiv-screenshots-upload',
    'edit-ffxiv-screenshots-without-photoshop',
  ],
  'large-ffxiv-screenshots-upload': [
    'composite-elements-background-removal',
    'how-to-combine-ffxiv-screenshots',
    'ffxiv-screenshot-publishing-checklist',
  ],
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

export function getRelatedPosts(slug: string, locale: string): Post[] {
  const postsBySlug = new Map(getAllPosts(locale).map((post) => [post.slug, post]))
  const preferredSlugs = relatedGuideSlugs[slug] ?? []

  return preferredSlugs
    .map((relatedSlug) => postsBySlug.get(relatedSlug))
    .filter((post): post is Post => Boolean(post))
}
