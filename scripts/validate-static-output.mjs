import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outputRoot = path.join(root, 'out')
const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || 'https://xiv-frame.pages.dev').replace(/\/$/, '')
let hasError = false

function fail(message) {
  console.error(`[static:check] ${message}`)
  hasError = true
}

function readOutput(relativePath) {
  const filePath = path.join(outputRoot, relativePath)
  if (!fs.existsSync(filePath)) {
    fail(`Missing output file: ${relativePath}`)
    return ''
  }
  return fs.readFileSync(filePath, 'utf8')
}

function walkHtml(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return walkHtml(entryPath)
    return entry.name.endsWith('.html') ? [entryPath] : []
  })
}

if (!fs.existsSync(outputRoot)) {
  fail(`Static output directory is missing: ${outputRoot}`)
} else {
  const landing = readOutput('index.html')
  const editorPages = ['ko.html', 'en.html', 'ja.html']
  const runtimeAssets = [
    'vendor/transformers.web.min.js',
    'vendor/onnxruntime/ort-wasm-simd-threaded.asyncify.mjs',
    'vendor/onnxruntime/ort-wasm-simd-threaded.asyncify.wasm',
    'vendor/onnxruntime/ort-wasm-simd-threaded.mjs',
    'vendor/onnxruntime/ort-wasm-simd-threaded.wasm',
  ]
  for (const relativePath of runtimeAssets) {
    if (!fs.existsSync(path.join(outputRoot, relativePath))) {
      fail(`Missing runtime asset in static output: ${relativePath}`)
    }
  }
  const publicPages = [
    'ko/blog.html',
    'ko/faq.html',
    'ko/about.html',
    'ko/contact.html',
    'ko/legal/privacy.html',
    'ko/legal/terms.html',
  ]

  if (!/<meta name="robots" content="index, follow"\/?\s*>/.test(landing)) {
    fail('The public landing page must be indexable.')
  }
  if (!/<h1[\s>]/.test(landing)) {
    fail('The public landing page is missing a visible h1.')
  }
  if (!landing.includes('"@type":"WebPage"')) {
    fail('The public landing page is missing WebPage structured data.')
  }

  for (const relativePath of editorPages) {
    const html = readOutput(relativePath)
    if (html && !/<meta name="robots" content="noindex, follow"\/?\s*>/.test(html)) {
      fail(`The editor route must be noindex: ${relativePath}`)
    }
  }

  for (const relativePath of publicPages) {
    const html = readOutput(relativePath)
    if (html && /<meta name="robots" content="noindex/.test(html)) {
      fail(`A public content page must remain indexable: ${relativePath}`)
    }
    if (html && !/<h1[\s>]/.test(html)) {
      fail(`A public content page is missing a visible h1: ${relativePath}`)
    }
  }

  const htmlFiles = walkHtml(outputRoot)
  for (const filePath of htmlFiles) {
    const html = fs.readFileSync(filePath, 'utf8')
    if (/adsbygoogle|pagead2\.googlesyndication\.com/i.test(html)) {
      fail(`An advertising tag was found in ${path.relative(outputRoot, filePath)}`)
    }

    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1]
      if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/_next')) continue

      const pathname = new URL(href, 'https://xiv-frame.local').pathname
      const relativeTarget = pathname === '/'
        ? 'index.html'
        : pathname.endsWith('.html') || pathname.endsWith('.xml') || pathname.endsWith('.svg')
          ? pathname.slice(1)
          : `${pathname.replace(/\/$/, '').slice(1)}.html`
      if (!fs.existsSync(path.join(outputRoot, relativeTarget))) {
        fail(`Broken internal link in ${path.relative(outputRoot, filePath)}: ${href}`)
      }
    }
  }

  const sitemap = readOutput('sitemap.xml')
  const locs = sitemap.match(/<loc>[^<]+<\/loc>/g) ?? []
  if (locs.length < 1) fail('Sitemap contains no URLs.')
  if (!sitemap.includes(`<loc>${siteOrigin}</loc>`)) fail('Sitemap is missing the public root URL.')
  if (!sitemap.includes(`${siteOrigin}/en/landing`)) fail('Sitemap is missing the English landing URL.')
  if (!sitemap.includes(`${siteOrigin}/ja/landing`)) fail('Sitemap is missing the Japanese landing URL.')
  if (new RegExp(`${siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\/(ko|en|ja)<\\/loc>`).test(sitemap)) {
    fail('Sitemap must not advertise localized editor root routes.')
  }

  if (!hasError) {
    console.log(`[static:check] ${htmlFiles.length} HTML files, ${locs.length} sitemap URLs passed.`)
  }
}

if (hasError) process.exitCode = 1
