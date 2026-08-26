import fs from 'node:fs'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { chromium } from '@playwright/test'
import sharp from 'sharp'

const projectRoot = process.cwd()
const baseUrl = 'http://127.0.0.1:3000/ko'
const nextEntrypoint = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
const fixturePath = path.join(projectRoot, 'public', 'og-image.jpg')

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

async function measureRun(browser, buffer, run) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36',
  })
  await context.addInitScript(() => window.localStorage.clear())
  const page = await context.newPage()
  page.on('pageerror', (error) => console.error(`[perf:pageerror run=${run}] ${error.message}`))

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 })
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
    const files = Array.from({ length: 16 }, (_, index) => ({
      name: `benchmark-${index}.jpg`,
      mimeType: 'image/jpeg',
      buffer,
    }))

    await page.locator('input[type="file"]').first().setInputFiles(files)
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30_000 })

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

    return {
      run,
      preparationMs: round(after.time - before.time),
      heapBeforeBytes: before.heap,
      heapAfterBytes: after.heap,
      heapDeltaBytes: before.heap === null || after.heap === null ? null : after.heap - before.heap,
      peakHeapBytes: after.peakHeap,
      peakHeapDeltaBytes: before.heap === null || after.peakHeap === null ? null : after.peakHeap - before.heap,
    }
  } finally {
    await context.close()
  }
}

const server = spawn(process.execPath, [nextEntrypoint, 'dev', '--hostname', '127.0.0.1'], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
})

let browser
try {
  await waitForServer(server)
  browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-precise-memory-info'],
  })
  const fixtureDimension = Math.max(0, Math.floor(readNumberOption('--dimension', process.env.PERF_FIXTURE_DIMENSION ?? 0)))
  const fixtureSource = fs.readFileSync(fixturePath)
  const buffer = fixtureDimension > 0
    ? await sharp(fixtureSource)
      .resize(fixtureDimension, fixtureDimension, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer()
    : fixtureSource
  const runs = Math.max(1, Math.min(10, Math.floor(readNumberOption('--runs', process.env.PERF_RUNS ?? 3))))
  const samples = []
  for (let run = 1; run <= runs; run += 1) {
    samples.push(await measureRun(browser, buffer, run))
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
}
