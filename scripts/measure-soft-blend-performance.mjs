import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { chromium } from '@playwright/test'
import { findAvailablePerfPort, findRunningPerfUrl } from './perf-port.mjs'

const projectRoot = process.cwd()
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
  const value = Number(argument ? argument.slice(name.length + 1) : fallback)
  return Number.isFinite(value) ? value : Number(fallback)
}

function round(value) {
  return Math.round(value * 100) / 100
}

async function measureRun(browser, fixtureBuffer, imageCount, run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } })
  await context.addInitScript(() => window.localStorage.clear())
  const page = await context.newPage()
  page.on('pageerror', (error) => console.error(`[soft-blend:pageerror] ${error.message}`))

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15_000 })
    const files = Array.from({ length: imageCount }, (_, index) => ({
      name: `soft-blend-${index}.jpg`,
      mimeType: 'image/jpeg',
      buffer: fixtureBuffer,
    }))

    await page.locator('input[type="file"]').first().setInputFiles(files)
    await page.getByText(`${String(imageCount).padStart(2, '0')} / 16`, { exact: true }).waitFor({ state: 'visible', timeout: 30_000 })
    await page.locator('[data-xiv-frame-workflow-tabs="true"] [role="tab"]').nth(1).click()
    const templateName = imageCount === 16 ? '4×4 균등' : '바둑판 배치'
    const gridButton = page.getByRole('button', { name: new RegExp(`^${templateName}`) }).first()
    await gridButton.click()
    await page.waitForTimeout(300)

    const before = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'))
      return {
        canvasCount: canvases.length,
        canvasPixels: canvases.reduce((total, canvas) => total + canvas.width * canvas.height, 0),
        canvasSizes: canvases.map((canvas) => `${canvas.width}x${canvas.height}`),
      }
    })

    const instrumentation = await page.evaluate(() => {
      const state = { drawImageCalls: 0, fillRectCalls: 0 }
      const drawImage = CanvasRenderingContext2D.prototype.drawImage
      const fillRect = CanvasRenderingContext2D.prototype.fillRect
      CanvasRenderingContext2D.prototype.drawImage = function (...args) {
        state.drawImageCalls += 1
        return drawImage.apply(this, args)
      }
      CanvasRenderingContext2D.prototype.fillRect = function (...args) {
        state.fillRectCalls += 1
        return fillRect.apply(this, args)
      }
      window.__softBlendPerfState = state
      return state
    })

    const start = performance.now()
    await page.getByRole('button', { name: '자연스럽게', exact: true }).click()
    await page.waitForTimeout(250)
    const elapsedMs = performance.now() - start
    const after = await page.evaluate(() => ({
      canvasCount: document.querySelectorAll('canvas').length,
      drawImageCalls: (window).__softBlendPerfState?.drawImageCalls ?? null,
      fillRectCalls: (window).__softBlendPerfState?.fillRectCalls ?? null,
    }))

    await page.evaluate(() => {
      const state = (window).__softBlendPerfState
      if (state) {
        state.drawImageCalls = 0
        state.fillRectCalls = 0
      }
    })
    const canvasBox = await page.locator('canvas').first().boundingBox()
    if (!canvasBox) throw new Error('Could not locate the soft-blend canvas.')

    const dragStart = performance.now()
    const startX = canvasBox.x + canvasBox.width * 0.2
    const startY = canvasBox.y + canvasBox.height * 0.25
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    for (let step = 1; step <= 18; step += 1) {
      await page.mouse.move(
        startX + (canvasBox.width * 0.08 * step) / 18,
        startY + (canvasBox.height * 0.04 * step) / 18,
      )
      await page.waitForTimeout(16)
    }
    await page.mouse.up()
    const dragElapsedMs = performance.now() - dragStart
    const interaction = await page.evaluate(() => ({
      drawImageCalls: (window).__softBlendPerfState?.drawImageCalls ?? null,
      fillRectCalls: (window).__softBlendPerfState?.fillRectCalls ?? null,
    }))

    return {
      run,
      imageCount,
      before,
      elapsedMs: round(elapsedMs),
      drawImageCalls: after.drawImageCalls ?? instrumentation.drawImageCalls,
      fillRectCalls: after.fillRectCalls ?? instrumentation.fillRectCalls,
      afterCanvasCount: after.canvasCount,
      dragElapsedMs: round(dragElapsedMs),
      dragDrawImageCalls: interaction.drawImageCalls,
      dragFillRectCalls: interaction.fillRectCalls,
    }
  } finally {
    await context.close()
  }
}

const requestedPort = Number(process.env.PERF_PORT ?? 3000)
const configuredBaseUrl = process.env.PERF_BASE_URL?.replace(/\/$/, '')
const existingBaseUrl = configuredBaseUrl || await findRunningPerfUrl(requestedPort)
const port = existingBaseUrl ? null : await findAvailablePerfPort(requestedPort)
const baseUrl = existingBaseUrl ?? `http://127.0.0.1:${port}/ko`
const server = existingBaseUrl ? null : spawn(process.execPath, [nextEntrypoint, 'dev', '--hostname', '127.0.0.1', '--port', String(port)], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
})

let browser
try {
  if (server) await waitForServer(server)
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const fixtureBuffer = await import('node:fs/promises').then(({ readFile }) => readFile(fixturePath))
  const imageCount = Math.max(2, Math.min(16, Math.floor(readNumberOption('--images', 16))))
  const runs = Math.max(1, Math.min(5, Math.floor(readNumberOption('--runs', 1))))
  const samples = []
  for (let run = 1; run <= runs; run += 1) {
    samples.push(await measureRun(browser, fixtureBuffer, imageCount, run))
  }

  console.log(JSON.stringify({ imageCount, runs, samples }, null, 2))
} finally {
  await browser?.close()
  stopProcessTree(server)
}
