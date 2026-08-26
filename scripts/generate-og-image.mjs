import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const iconSource = await readFile(new URL('../src/app/icon.svg', import.meta.url), 'utf8')
const iconMarkup = iconSource
  .replace(/<svg\b[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .replace(/<title>[\s\S]*?<\/title>/, '')

const canvas = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" fill="none">
  <rect width="1024" height="1024" fill="#FFFDF8"/>
  <rect x="96" y="96" width="832" height="832" rx="160" fill="#FFFDF8" stroke="#1A3300" stroke-opacity="0.08" stroke-width="4"/>
  <g transform="translate(192 192) scale(6.6666666667)">
    ${iconMarkup}
  </g>
</svg>`

await sharp(Buffer.from(canvas))
  .jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
  .toFile(fileURLToPath(new URL('../public/og-image.jpg', import.meta.url)))

console.log('[assets:og] Generated public/og-image.jpg from src/app/icon.svg.')
