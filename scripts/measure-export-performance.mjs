import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'

import { chromium } from '@playwright/test'
import sharp from 'sharp'

import { findAvailablePerfPort, findRunningPerfUrl } from './perf-port.mjs'

const projectRoot = process.cwd()
const nextEntrypoint = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
const MAX_UPLOAD_BYTES = 5_000_000
const SOURCE_WIDTH = 3840
const SOURCE_HEIGHT = 2160

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function waitForServer(server, baseUrl, timeoutMilliseconds = 120_000) {
  const deadline = Date.now() + timeoutMilliseconds
  let serverExitCode
  server.once('exit', (code) => { serverExitCode = code })

  while (Date.now() < deadline) {
    if (serverExitCode !== undefined) throw new Error(`Next.js dev server exited before becoming ready (code ${serverExitCode}).`)
    try {
      const response = await fetch(baseUrl)
      if (response.status < 500) return
    } catch {
      // The server is still starting.
    }
    await wait(250)
  }

  throw new Error(`Timed out waiting for ${baseUrl}.`)
}

function stopProcessTree(child) {
  if (!child?.pid) return
  if (process.platform === 'win32') {
    child.kill()
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
      windowsHide: true,
      timeout: 5_000,
    })
  } else {
    child.kill('SIGTERM')
  }
}

function readNumberOption(name, fallback) {
  const argument = process.argv.find((value) => value.startsWith(`${name}=`))
  const value = Number(argument ? argument.slice(name.length + 1) : fallback)
  return Number.isFinite(value) ? value : Number(fallback)
}

function round(value) {
  return Math.round(value * 100) / 100
}

function createHighEntropyRgb(width, height) {
  const buffer = Buffer.allocUnsafe(width * height * 3)
  let state = 0x9e3779b9

  for (let index = 0; index < buffer.length; index += 1) {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    buffer[index] = state & 0xff
  }

  return buffer
}

async function createFixture() {
  const raw = createHighEntropyRgb(SOURCE_WIDTH, SOURCE_HEIGHT)
  return sharp(raw, {
    raw: { width: SOURCE_WIDTH, height: SOURCE_HEIGHT, channels: 3 },
  }).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toBuffer()
}

async function readPageMemory(page) {
  return page.evaluate(() => {
    const memory = performance.memory
    return memory?.usedJSHeapSize ?? null
  })
}

async function measureExport(browser, fixturePath, fixtureBuffer, ratio, run, imageCount) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  await context.addInitScript(() => window.localStorage.clear())
  const page = await context.newPage()
  const pageErrors = []
  const requestFailures = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('requestfailed', (request) => requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'unknown'}`))

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 })
    const uploadStart = await page.evaluate(() => performance.now())
    await page.locator('input[type="file"]').first().setInputFiles(
      Array.from({ length: imageCount }, () => fixturePath),
    )

    await page.getByText(`${String(imageCount).padStart(2, '0')} / 16`, { exact: true }).waitFor({ state: 'visible', timeout: 60_000 })
    const uploadEnd = await page.evaluate(() => performance.now())
    const layoutStart = uploadEnd
    await page.locator('[data-xiv-frame-workflow-tabs="true"] [role="tab"]').nth(1).click()
    await page.getByRole('button', { name: /^4×4 equal grid/ }).click()
    await page.waitForTimeout(300)

    if (ratio === 'original') {
      await page.getByRole('button', { name: 'Original ratio', exact: true }).click()
    } else {
      await page.getByRole('button', { name: 'X timeline', exact: true }).click()
    }
    if (backgroundMode === 'transparent') {
      await page.getByRole('button', { name: 'Transparent', exact: true }).click()
    }
    await page.waitForTimeout(300)
    const layoutEnd = await page.evaluate(() => performance.now())

    const beforeMemory = await readPageMemory(page)
    const beforeCanvas = await page.evaluate(() => Array.from(document.querySelectorAll('canvas')).map((canvas) => ({
      width: canvas.width,
      height: canvas.height,
    })))
    const exportStart = await page.evaluate(() => performance.now())
    const downloadPromise = page.waitForEvent('download', { timeout: 120_000 })
    await page.getByRole('button', { name: 'Export PNG', exact: true }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    if (!downloadPath) throw new Error('Playwright did not expose the export download path.')
    const [downloaded, exportEnd] = await Promise.all([
      fs.readFile(downloadPath),
      page.evaluate(() => performance.now()),
    ])
    const metadata = await sharp(downloaded).metadata()
    const expectedNotice = backgroundMode === 'transparent'
      ? 'The image was resized to fit X\'s 5 MB upload limit.'
      : 'Saved the highest-quality JPEG that fits X\'s 5 MB upload limit.'
    await page.getByText(expectedNotice, { exact: true }).waitFor({ state: 'visible', timeout: 30_000 })
    const afterMemory = await readPageMemory(page)
    const afterCanvas = await page.evaluate(() => Array.from(document.querySelectorAll('canvas')).map((canvas) => ({
      width: canvas.width,
      height: canvas.height,
    })))
    if (downloaded.byteLength > MAX_UPLOAD_BYTES) {
      throw new Error(`Export exceeded the X upload limit: ${downloaded.byteLength} bytes.`)
    }
    if (pageErrors.length > 0 || requestFailures.length > 0) {
      throw new Error(`Browser errors during export: ${JSON.stringify({ pageErrors, requestFailures })}`)
    }

    return {
      run,
      ratio,
      background: backgroundMode,
      imageCount,
      source: {
        width: SOURCE_WIDTH,
        height: SOURCE_HEIGHT,
        bytes: fixtureBuffer.byteLength,
      },
      output: {
        suggestedFilename: download.suggestedFilename(),
        format: metadata.format ?? null,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        bytes: downloaded.byteLength,
        withinXLimit: downloaded.byteLength <= MAX_UPLOAD_BYTES,
      },
      uploadMs: round(uploadEnd - uploadStart),
      layoutMs: round(layoutEnd - layoutStart),
      exportMs: round(exportEnd - exportStart),
      heapBeforeBytes: beforeMemory,
      heapAfterBytes: afterMemory,
      heapDeltaBytes: beforeMemory === null || afterMemory === null ? null : afterMemory - beforeMemory,
      beforeCanvas,
      afterCanvas,
      pageErrors,
      requestFailures,
    }
  } finally {
    await context.close()
  }
}

const requestedPort = Number(process.env.PERF_PORT ?? 3000)
const backgroundMode = process.argv.find((value) => value.startsWith('--background='))?.slice('--background='.length) === 'transparent'
  ? 'transparent'
  : 'opaque'
const configuredBaseUrl = process.env.PERF_BASE_URL?.replace(/\/$/, '')
const runningBaseUrl = await findRunningPerfUrl(requestedPort)
const existingBaseUrl = configuredBaseUrl || runningBaseUrl?.replace(/\/ko$/, '/en')
const port = existingBaseUrl ? null : await findAvailablePerfPort(requestedPort)
const baseUrl = existingBaseUrl ?? `http://127.0.0.1:${port}/en`
const server = existingBaseUrl ? null : spawn(process.execPath, [nextEntrypoint, 'dev', '--hostname', '127.0.0.1', '--port', String(port)], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
})

let browser
try {
  if (server) await waitForServer(server, baseUrl)
  browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-precise-memory-info'],
  })

  const imageCount = 16
  const requestedRuns = Math.max(1, Math.min(3, Math.floor(readNumberOption('--runs', 1))))
  const fixtureBuffer = await createFixture()
  const fixtureDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'xiv-frame-export-fixture-'))
  const fixturePath = path.join(fixtureDirectory, 'export-4k.jpg')
  await fs.writeFile(fixturePath, fixtureBuffer)

  try {
    const samples = []
    for (const ratio of ['original', 'x']) {
      for (let run = 1; run <= requestedRuns; run += 1) {
        samples.push(await measureExport(browser, fixturePath, fixtureBuffer, ratio, run, imageCount))
      }
    }

    console.log(JSON.stringify({
      baseUrl,
      viewport: '1440x960',
      imageCount,
      background: backgroundMode,
      requestedRuns,
      source: { width: SOURCE_WIDTH, height: SOURCE_HEIGHT, bytes: fixtureBuffer.byteLength },
      maxUploadBytes: MAX_UPLOAD_BYTES,
      samples,
    }, null, 2))
  } finally {
    await fs.rm(fixtureDirectory, { recursive: true, force: true })
  }
} finally {
  await browser?.close()
  stopProcessTree(server)
}
