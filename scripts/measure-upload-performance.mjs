import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { findAvailablePerfPort, findRunningPerfUrl } from './perf-port.mjs'

const projectRoot = process.cwd()
const nextEntrypoint = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
const fixturePath = path.join(projectRoot, 'public', 'og-image.jpg')
const STRESS_FIXTURE_WIDTH = 3840
const STRESS_FIXTURE_HEIGHT = 2160

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function waitForServer(server, timeoutMilliseconds = 120_000) {
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
  const rawValue = argument ? argument.slice(name.length + 1) : fallback
  const value = Number(rawValue)
  const fallbackValue = Number(fallback)
  return Number.isFinite(value) ? value : fallbackValue
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

async function createStressFixture() {
  const raw = createHighEntropyRgb(STRESS_FIXTURE_WIDTH, STRESS_FIXTURE_HEIGHT)
  return sharp(raw, {
    raw: { width: STRESS_FIXTURE_WIDTH, height: STRESS_FIXTURE_HEIGHT, channels: 3 },
  }).jpeg({ quality: 92, chromaSubsampling: '4:4:4' }).toBuffer()
}

async function measureRun(browser, uploadInput, run) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36',
  })
  await context.addInitScript(({ forceDesktopPolicy }) => {
    window.localStorage.clear()
    if (!forceDesktopPolicy) return

    // Keep the mobile viewport/touch surface while selecting the desktop
    // preparation-concurrency branch as a comparison candidate. This does not
    // change the application's production policy.
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
    })
    Object.defineProperty(window.navigator, 'platform', {
      configurable: true,
      value: 'Win32',
    })
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
    })
  }, { forceDesktopPolicy: concurrencyCandidate })
  const page = await context.newPage()
  const pageErrors = []
  const requestFailures = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('requestfailed', (request) => requestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'unknown'}`))

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 })
    try {
      await page.waitForLoadState('networkidle', { timeout: 60_000 })
    } catch {
      // Dev HMR can keep a connection open; DOM hydration is still checked by
      // the real button interaction below.
    }
    // Next's development overlay can leave a zero-sized portal as the hit-test
    // target in headless mobile contexts. It is not shipped to production.
    await page.evaluate(() => document.querySelector('script[data-nextjs-dev-overlay]')?.remove())
    await page.getByRole('button', { name: 'Photo', exact: true }).click()
    await page.getByText('00 / 16', { exact: true }).waitFor({ state: 'visible', timeout: 30_000 })
    const before = await page.evaluate(() => {
      const memory = performance.memory
      return { time: performance.now(), heap: memory?.usedJSHeapSize ?? null }
    })
    await page.evaluate(() => {
      const tracker = {
        peakHeap: performance.memory?.usedJSHeapSize ?? null,
        timerId: 0,
      }
      tracker.timerId = window.setInterval(() => {
        const currentHeap = performance.memory?.usedJSHeapSize ?? null
        if (currentHeap !== null) {
          tracker.peakHeap = tracker.peakHeap === null
            ? currentHeap
            : Math.max(tracker.peakHeap, currentHeap)
        }
      }, 20)
      window.__xivFrameUploadPerf = tracker
    })
    const files = typeof uploadInput === 'string'
      ? Array.from({ length: 16 }, () => uploadInput)
      : Array.from({ length: 16 }, (_, index) => ({
        name: `benchmark-${index}.jpg`,
        mimeType: 'image/jpeg',
        buffer: uploadInput,
      }))

    await page.locator('input[type="file"]').first().setInputFiles(files)
    await page.getByText('16 / 16', { exact: true }).waitFor({ state: 'visible', timeout: 120_000 })

    const after = await page.evaluate(() => {
      const tracker = window.__xivFrameUploadPerf
      if (tracker) window.clearInterval(tracker.timerId)
      const memory = performance.memory
      const heap = memory?.usedJSHeapSize ?? null
      return {
        time: performance.now(),
        heap,
        peakHeap: tracker?.peakHeap === null || tracker?.peakHeap === undefined || heap === null
          ? heap
          : Math.max(tracker.peakHeap, heap),
      }
    })

    if (pageErrors.length > 0 || requestFailures.length > 0) {
      throw new Error(`Browser errors during upload: ${JSON.stringify({ pageErrors, requestFailures })}`)
    }

    return {
      run,
      preparationMs: round(after.time - before.time),
      heapBeforeBytes: before.heap,
      heapAfterBytes: after.heap,
      heapDeltaBytes: before.heap === null || after.heap === null ? null : after.heap - before.heap,
      peakHeapBytes: after.peakHeap,
      peakHeapDeltaBytes: before.heap === null || after.peakHeap === null ? null : after.peakHeap - before.heap,
      pageErrors,
      requestFailures,
    }
  } finally {
    await context.close()
  }
}

const requestedPort = Number(process.env.PERF_PORT ?? 3000)
const concurrencyCandidate = process.argv.includes('--candidate=concurrency-2')
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
let temporaryFixtureDirectory
try {
  if (server) await waitForServer(server)
  browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-precise-memory-info'],
  })
  const fixtureDimension = Math.max(0, Math.floor(readNumberOption('--dimension', process.env.PERF_FIXTURE_DIMENSION ?? 0)))
  const isStressFixture = process.argv.includes('--stress=4k')
  const fixtureSource = fs.readFileSync(fixturePath)
  const buffer = isStressFixture
    ? await createStressFixture()
    : fixtureDimension > 0
      ? await sharp(fixtureSource)
        .resize(fixtureDimension, fixtureDimension, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer()
      : fixtureSource
  let uploadInput = buffer
  if (isStressFixture) {
    temporaryFixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'xiv-frame-upload-fixture-'))
    const stressFixturePath = path.join(temporaryFixtureDirectory, 'benchmark-4k.jpg')
    fs.writeFileSync(stressFixturePath, buffer)
    uploadInput = stressFixturePath
  }
  const runs = Math.max(1, Math.min(10, Math.floor(readNumberOption('--runs', process.env.PERF_RUNS ?? 3))))
  const samples = []
  for (let run = 1; run <= runs; run += 1) {
    samples.push(await measureRun(browser, uploadInput, run))
  }

  const times = samples.map((sample) => sample.preparationMs)
  const heapDeltas = samples
    .map((sample) => sample.heapDeltaBytes)
    .filter((value) => value !== null)
  const peakHeapDeltas = samples
    .map((sample) => sample.peakHeapDeltaBytes)
    .filter((value) => value !== null)
  const average = (values) => values.length === 0 ? null : round(values.reduce((sum, value) => sum + value, 0) / values.length)

  console.log(JSON.stringify({
    viewport: '390x844',
    emulation: 'Android 14 / touch / mobile User-Agent',
    fixtureDimension: fixtureDimension || null,
    fixtureMode: isStressFixture ? 'high-entropy-4k' : 'og-image',
    policyCandidate: concurrencyCandidate ? 'preparation-concurrency-2' : 'mobile-default',
    sourceDimensions: isStressFixture ? { width: STRESS_FIXTURE_WIDTH, height: STRESS_FIXTURE_HEIGHT } : null,
    runs,
    fixtureBytes: buffer.byteLength,
    samples,
    summary: {
      preparationMs: { min: Math.min(...times), average: average(times), max: Math.max(...times) },
      heapDeltaBytes: heapDeltas.length === 0
        ? null
        : { min: Math.min(...heapDeltas), average: average(heapDeltas), max: Math.max(...heapDeltas) },
      peakHeapDeltaBytes: peakHeapDeltas.length === 0
        ? null
        : { min: Math.min(...peakHeapDeltas), average: average(peakHeapDeltas), max: Math.max(...peakHeapDeltas) },
    },
  }, null, 2))
} finally {
  await browser?.close()
  stopProcessTree(server)
  if (temporaryFixtureDirectory) fs.rmSync(temporaryFixtureDirectory, { recursive: true, force: true })
}
