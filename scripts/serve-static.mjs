import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'

const rootDirectory = path.resolve(process.argv[2] ?? 'out')
const hostArgumentIndex = process.argv.indexOf('--hostname')
const portArgumentIndex = process.argv.indexOf('--port')
const host = hostArgumentIndex >= 0 ? process.argv[hostArgumentIndex + 1] : '127.0.0.1'
const port = Number(portArgumentIndex >= 0 ? process.argv[portArgumentIndex + 1] : 3100)
const traceRequests = process.env.SMOKE_TRACE === '1'

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
}

function isInsideRoot(candidate) {
  return candidate === rootDirectory || candidate.startsWith(`${rootDirectory}${path.sep}`)
}

async function resolveFile(requestPath) {
  const decodedPath = decodeURIComponent(requestPath)
  const relativePath = decodedPath.replace(/^[/\\]+/, '')
  const directPath = path.resolve(rootDirectory, relativePath)
  if (!isInsideRoot(directPath)) return null

  const candidates = [directPath, `${directPath}.html`, path.join(directPath, 'index.html')]
  const metadataMarker = '__next.$d$locale.'
  const metadataMarkerIndex = relativePath.indexOf(metadataMarker)
  if (metadataMarkerIndex >= 0) {
    const metadataPrefix = relativePath.slice(0, metadataMarkerIndex).replace(/[/\\]+$/, '')
    const metadataTail = relativePath.slice(metadataMarkerIndex + metadataMarker.length)
    const metadataExtension = path.extname(metadataTail)
    const metadataStem = metadataExtension ? metadataTail.slice(0, -metadataExtension.length) : metadataTail
    const metadataSegments = metadataStem.split('.').filter(Boolean)
    const metadataFile = metadataSegments.pop()
    if (metadataFile) {
      candidates.push(path.resolve(
        rootDirectory,
        metadataPrefix,
        '__next.$d$locale',
        ...metadataSegments,
        `${metadataFile}${metadataExtension}`,
      ))
    }
  }

  for (const candidate of candidates) {
    try {
      const fileStats = await stat(candidate)
      if (fileStats.isFile()) return candidate
    } catch {
      // Try the next static export candidate.
    }
  }

  return null
}

const server = http.createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' })
    response.end()
    return
  }

  let requestPath
  try {
    requestPath = new URL(request.url ?? '/', 'http://localhost').pathname
  } catch {
    response.writeHead(400)
    response.end('Bad request')
    return
  }

  let filePath
  try {
    filePath = await resolveFile(requestPath)
  } catch {
    response.writeHead(400)
    response.end('Bad request')
    return
  }

  if (!filePath) {
    if (traceRequests) console.log(`${request.method} ${requestPath} -> 404`)
    response.writeHead(404)
    response.end('Not found')
    return
  }

  const contentType = contentTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream'
  const fileStats = await stat(filePath)
  if (traceRequests) console.log(`${request.method} ${requestPath} -> 200 ${path.relative(rootDirectory, filePath)}`)
  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Length': fileStats.size,
    'Content-Type': contentType,
  })
  if (request.method === 'HEAD') {
    response.end()
    return
  }

  createReadStream(filePath).pipe(response)
})

server.listen(port, host, () => {
  console.log(`Static export server listening on http://${host}:${port}`)
})

function closeServer() {
  server.close(() => process.exit(0))
}

process.once('SIGTERM', closeServer)
process.once('SIGINT', closeServer)
