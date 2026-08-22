import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const root = process.cwd()
const contentRoot = path.join(root, 'src', 'content', 'blog')
const locales = ['ko', 'en', 'ja']

function fail(message) {
  console.error(`[content:check] ${message}`)
  process.exitCode = 1
}

if (!fs.existsSync(contentRoot)) {
  fail(`Content directory is missing: ${contentRoot}`)
  process.exit()
}

const slugs = fs.readdirSync(contentRoot)
  .filter((entry) => fs.statSync(path.join(contentRoot, entry)).isDirectory())
  .sort()

if (slugs.length < 1) {
  fail('At least one guide directory is required.')
}

for (const slug of slugs) {
  for (const locale of locales) {
    const filePath = path.join(contentRoot, slug, `${locale}.md`)
    if (!fs.existsSync(filePath)) {
      fail(`Missing ${locale} translation for ${slug}`)
      continue
    }

    const source = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(source)
    const required = ['title', 'description', 'date', 'category', 'tags']

    for (const field of required) {
      const value = data[field]
      const isEmptyArray = Array.isArray(value) && value.length === 0
      if (value == null || value === '' || isEmptyArray) {
        fail(`${filePath} is missing frontmatter field: ${field}`)
      }
    }

    if (typeof data.title !== 'string' || data.title.trim().length < 12) {
      fail(`${filePath} needs a descriptive title.`)
    }
    if (typeof data.description !== 'string' || data.description.trim().length < 40) {
      fail(`${filePath} needs a useful meta description.`)
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) {
      fail(`${filePath} must use an ISO date in YYYY-MM-DD format.`)
    }

    const headingCount = (content.match(/^##\s+/gm) ?? []).length
    const numberedStepCount = (content.match(/^\d+\.\s+/gm) ?? []).length
    const bodyLength = content.replace(/\s/g, '').length

    if (bodyLength < 600) {
      fail(`${filePath} is too short for a task-focused guide (${bodyLength} non-space characters).`)
    }
    if (headingCount < 2) {
      fail(`${filePath} needs at least two section headings.`)
    }
    if (numberedStepCount < 3) {
      fail(`${filePath} needs numbered, actionable steps.`)
    }
  }
}

if (!process.exitCode) {
  console.log(`[content:check] ${slugs.length} guides × ${locales.length} locales passed.`)
}
