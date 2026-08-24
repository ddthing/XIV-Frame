import fs from 'node:fs'
import path from 'node:path'

const sourcePath = path.join(process.cwd(), 'src', 'components', 'canvas', 'layers', 'ImageGridLayer.tsx')
const source = fs.readFileSync(sourcePath, 'utf8')
const errors = []

function fail(message) {
  errors.push(`[render:check] ${message}`)
}

const mapStart = source.indexOf('{images.map')
const mapSource = mapStart >= 0 ? source.slice(mapStart) : ''

if (/<Layer>\s*\{images\.map/s.test(source)) {
  fail('ImageGridLayer must not share one Konva Layer across all images.')
}

if (!/\{images\.map[\s\S]*?return \(\s*<Layer\s+key=\{index\}>/s.test(source)) {
  fail('Each rendered image must have its own Konva Layer.')
}

if (mapSource.includes('globalCompositeOperation="destination-in"') && !mapSource.includes('<Layer key={index}>')) {
  fail('destination-in blend masks must be isolated inside an image layer.')
}

if (!/Promise\.allSettled\(filesToPrepare\.map\(prepareImageForCanvas\)\)/.test(fs.readFileSync(path.join(process.cwd(), 'src', 'components', 'canvas', 'PreviewCanvas.tsx'), 'utf8'))) {
  fail('Multi-file upload must prepare all selected files together.')
}

if (errors.length > 0) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
} else {
  console.log('[render:check] multi-image render tree passed.')
}
