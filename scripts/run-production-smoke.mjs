import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'

import { chromium } from '@playwright/test'
import sharp from 'sharp'

import { findAvailablePerfPort } from './perf-port.mjs'

const projectRoot = process.cwd()
const staticServerEntrypoint = path.join(projectRoot, 'scripts', 'serve-static.mjs')
const fixturePath = path.join(projectRoot, 'public', 'og-image.jpg')
const maxUploadBytes = 5_000_000

const deviceProfiles = [
  {
    name: 'iPhone 16 Pro Max',
    viewport: { width: 440, height: 956 },
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  },
  {
    name: 'Android Chrome',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2.75,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  },
]

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function waitForServer(server, baseUrl, timeoutMilliseconds = 120_000) {
  const deadline = Date.now() + timeoutMilliseconds
  let serverExitCode
  server.once('exit', (code) => { serverExitCode = code })

  while (Date.now() < deadline) {
    if (serverExitCode !== undefined) {
      throw new Error(`Static production server exited before becoming ready (code ${serverExitCode}).`)
    }

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

function assertNoHorizontalOverflow(metrics, deviceName) {
  if (metrics.documentScrollWidth > metrics.documentClientWidth + 1 || metrics.bodyScrollWidth > metrics.bodyClientWidth + 1) {
    throw new Error(`${deviceName} has horizontal overflow: ${JSON.stringify(metrics)}`)
  }
}

function isExpectedStaticPrefetchAbort(request, errorText) {
  if (errorText !== 'net::ERR_ABORTED') return false
  if (request.method() === 'HEAD') return true

  try {
    return new URL(request.url()).pathname.includes('/__next._')
  } catch {
    return false
  }
}

async function readViewportMetrics(page) {
  return page.evaluate(() => ({
    documentScrollWidth: document.documentElement.scrollWidth,
    documentClientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bodyClientWidth: document.body.clientWidth,
  }))
}

async function readCanvasFingerprint(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('canvas')).map((canvas) => {
    const context = canvas.getContext('2d')
    if (!context || canvas.width === 0 || canvas.height === 0) return `${canvas.width}x${canvas.height}:unavailable`

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    const step = Math.max(1, Math.floor(Math.max(canvas.width, canvas.height) / 32))
    let hash = 2166136261
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const offset = (y * canvas.width + x) * 4
        hash ^= pixels[offset] ?? 0
        hash = Math.imul(hash, 16777619)
        hash ^= pixels[offset + 1] ?? 0
        hash = Math.imul(hash, 16777619)
        hash ^= pixels[offset + 2] ?? 0
        hash = Math.imul(hash, 16777619)
        hash ^= pixels[offset + 3] ?? 0
        hash = Math.imul(hash, 16777619)
      }
    }

    return `${canvas.width}x${canvas.height}:${hash >>> 0}`
  }))
}

async function runEdgeDeviceSmoke(browser, baseUrl, profile, fixtureBase64) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    deviceScaleFactor: profile.deviceScaleFactor,
    hasTouch: true,
    isMobile: true,
    userAgent: profile.userAgent,
  })
  await context.addInitScript(() => window.localStorage.clear())

  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  const requestFailures = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('requestfailed', (request) => {
    const errorText = request.failure()?.errorText ?? 'unknown'
    if (isExpectedStaticPrefetchAbort(request, errorText)) return
    requestFailures.push(`${request.method()} ${request.url()} — ${errorText}`)
  })

  try {
    await page.goto(`${baseUrl}/en`, { waitUntil: 'networkidle', timeout: 30_000 })
    await page.getByRole('button', { name: 'Photo', exact: true }).click()
    let dialog = page.locator('[role="dialog"]:visible')
    await dialog.getByText('00 / 16', { exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
    await page.locator('input[type="file"]').first().setInputFiles(Array.from({ length: 15 }, () => fixturePath))
    await dialog.getByText('15 / 16', { exact: true }).waitFor({ state: 'visible', timeout: 90_000 })
    await dialog.getByRole('button', { name: 'Close', exact: true }).click()
    await dialog.waitFor({ state: 'hidden', timeout: 15_000 })

    await page.getByRole('button', { name: 'Layout', exact: true }).click()
    dialog = page.locator('[role="dialog"]:visible')
    await dialog.getByRole('button', { name: /^4×4 equal grid/ }).click()
    const emptyLastSlot = page.locator('[data-layout-effective-preset="matrix-4"][data-layout-empty-slot-count="1"]')
    await emptyLastSlot.waitFor({ state: 'visible', timeout: 30_000 })
    await dialog.getByRole('button', { name: 'Close', exact: true }).click()
    await dialog.waitFor({ state: 'hidden', timeout: 15_000 })

    const stageCanvas = page.locator('[data-layout-effective-preset="matrix-4"] canvas').first()
    const stageBox = await stageCanvas.boundingBox()
    if (!stageBox) throw new Error(`${profile.name} matrix canvas has no measurable bounds.`)
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 15_000 })
    await page.mouse.click(stageBox.x + stageBox.width * 0.875, stageBox.y + stageBox.height * 0.875)
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(fixturePath)
    await page.locator('[data-layout-effective-preset="matrix-4"][data-layout-empty-slot-count="0"]').waitFor({ state: 'visible', timeout: 90_000 })

    await page.getByRole('button', { name: 'Photo', exact: true }).click()
    dialog = page.locator('[role="dialog"]:visible')
    await dialog.getByText('16 / 16', { exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
    const deleteButtons = dialog.getByRole('button', { name: 'Delete Image', exact: true })
    if (await deleteButtons.count() !== 16) throw new Error(`${profile.name} did not render all 16 image cards.`)
    await deleteButtons.last().click()
    await dialog.getByText('15 / 16', { exact: true }).waitFor({ state: 'visible', timeout: 30_000 })
    await dialog.getByRole('button', { name: 'Close', exact: true }).click()
    await dialog.waitFor({ state: 'hidden', timeout: 15_000 })

    await page.locator('.app-backdrop').evaluate((target, encodedFile) => {
      const bytes = Uint8Array.from(atob(encodedFile), (character) => character.charCodeAt(0))
      const file = new File([bytes], 'drop-photo.jpg', { type: 'image/jpeg' })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      for (const type of ['dragenter', 'dragover', 'drop']) {
        target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }))
      }
    }, fixtureBase64)
    await page.locator('[data-layout-effective-preset="matrix-4"][data-layout-empty-slot-count="0"]').waitFor({ state: 'visible', timeout: 90_000 })

    await page.getByRole('button', { name: 'Layout', exact: true }).click()
    dialog = page.locator('[role="dialog"]:visible')
    const borderControl = dialog.locator('[data-slot="slider"][aria-label="Border Width"]')
    const borderInput = borderControl.locator('input[type="range"]')
    await borderInput.waitFor({ state: 'visible', timeout: 15_000 })
    await borderInput.focus()
    const beforeBorder = await readCanvasFingerprint(page)
    for (let step = 0; step < 50; step += 1) await borderInput.press('ArrowRight')
    await page.waitForFunction(() => document.querySelector('[data-slot="slider"][aria-label="Border Width"] input[type="range"]')?.getAttribute('aria-valuenow') === '50')
    const afterBorder = await readCanvasFingerprint(page)
    if (beforeBorder.join('|') === afterBorder.join('|')) throw new Error(`${profile.name} border width did not change the rendered canvas.`)

    const beforeGrain = afterBorder
    const grainControl = dialog.locator('[data-slot="slider"][aria-label="Grain Intensity"]')
    const grainInput = grainControl.locator('input[type="range"]')
    await grainInput.waitFor({ state: 'visible', timeout: 15_000 })
    await grainInput.focus()
    for (let step = 0; step < 100; step += 1) await grainInput.press('ArrowRight')
    await page.waitForFunction(() => document.querySelector('[data-slot="slider"][aria-label="Grain Intensity"] input[type="range"]')?.getAttribute('aria-valuenow') === '100')
    await page.waitForTimeout(300)
    const afterGrain = await readCanvasFingerprint(page)
    if (beforeGrain.join('|') === afterGrain.join('|')) throw new Error(`${profile.name} grain intensity did not change the rendered canvas.`)
    await dialog.getByRole('button', { name: 'Close', exact: true }).click()
    await dialog.waitFor({ state: 'hidden', timeout: 15_000 })

    await page.getByRole('button', { name: 'Export', exact: true }).click()
    dialog = page.locator('[role="dialog"]:visible')
    const downloadPromise = page.waitForEvent('download', { timeout: 90_000 })
    await dialog.getByRole('button', { name: 'Save Photo', exact: true }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    if (!downloadPath) throw new Error(`${profile.name} did not expose the edge-case export.`)
    const output = await fs.readFile(downloadPath)
    const metadata = await sharp(output).metadata()
    if (output.byteLength > maxUploadBytes) throw new Error(`${profile.name} edge-case export exceeded 5 MB.`)
    if (!metadata.format || !metadata.width || !metadata.height) throw new Error(`${profile.name} edge-case export is unreadable.`)

    const viewport = await readViewportMetrics(page)
    assertNoHorizontalOverflow(viewport, profile.name)
    if (consoleErrors.length > 0 || pageErrors.length > 0 || requestFailures.length > 0) {
      throw new Error(`Browser errors on ${profile.name} edge smoke: ${JSON.stringify({ consoleErrors, pageErrors, requestFailures })}`)
    }

    return {
      device: profile.name,
      viewport: `${profile.viewport.width}x${profile.viewport.height}`,
      initialUploadedImages: 15,
      finalUploadedImages: 16,
      lastSlotSelection: 'passed',
      dragAndDropFill: 'passed',
      borderWidth: '0 → 50; rendered canvas changed',
      grainIntensity: '0 → 100; rendered canvas changed',
      output: {
        filename: download.suggestedFilename(),
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        bytes: output.byteLength,
        withinFiveMb: output.byteLength <= maxUploadBytes,
      },
      horizontalOverflow: viewport.documentScrollWidth > viewport.documentClientWidth + 1 || viewport.bodyScrollWidth > viewport.bodyClientWidth + 1,
      consoleErrors,
      pageErrors,
      requestFailures,
    }
  } finally {
    await context.close()
  }
}

async function runDeviceSmoke(browser, baseUrl, profile) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    deviceScaleFactor: profile.deviceScaleFactor,
    hasTouch: true,
    isMobile: true,
    userAgent: profile.userAgent,
  })
  await context.addInitScript(() => window.localStorage.clear())

  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  const requestFailures = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('requestfailed', (request) => {
    const errorText = request.failure()?.errorText ?? 'unknown'
    // Chromium may abort speculative static metadata prefetches after the response is no longer needed.
    if (isExpectedStaticPrefetchAbort(request, errorText)) return
    requestFailures.push(`${request.method()} ${request.url()} — ${errorText}`)
  })

  try {
    await page.goto(`${baseUrl}/en`, { waitUntil: 'networkidle', timeout: 30_000 })
    await page.getByRole('button', { name: 'Photo', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
    const initialViewport = await readViewportMetrics(page)
    assertNoHorizontalOverflow(initialViewport, profile.name)

    await page.getByRole('button', { name: 'Photo', exact: true }).click()
    const imageDialog = page.locator('[role="dialog"]:visible')
    await imageDialog.waitFor({ state: 'visible', timeout: 15_000 })
    await imageDialog.getByText('00 / 16', { exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
    await page.locator('input[type="file"]').first().setInputFiles([fixturePath, fixturePath])
    await imageDialog.getByText('02 / 16', { exact: true }).waitFor({ state: 'visible', timeout: 60_000 })

    await imageDialog.getByRole('button', { name: 'Close', exact: true }).click()
    await imageDialog.waitFor({ state: 'hidden', timeout: 15_000 })
    await page.getByRole('button', { name: 'Layout', exact: true }).click()
    const layoutDialog = page.locator('[role="dialog"]:visible')
    await layoutDialog.waitFor({ state: 'visible', timeout: 15_000 })
    const verticalLayout = layoutDialog.getByRole('button', { name: 'Vertical', exact: true })
    await verticalLayout.waitFor({ state: 'visible', timeout: 15_000 })
    await verticalLayout.click()
    await layoutDialog.getByRole('button', { name: 'Close', exact: true }).click()
    await layoutDialog.waitFor({ state: 'hidden', timeout: 15_000 })

    await page.getByRole('button', { name: 'Export', exact: true }).click()
    const exportDialog = page.locator('[role="dialog"]:visible')
    await exportDialog.waitFor({ state: 'visible', timeout: 15_000 })
    const originalRatio = exportDialog.getByRole('button', { name: 'Original ratio', exact: true })
    await originalRatio.click()
    if (await originalRatio.getAttribute('aria-pressed') !== 'true') {
      throw new Error(`${profile.name} did not select Original ratio.`)
    }

    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })
    await exportDialog.getByRole('button', { name: 'Save Photo', exact: true }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    if (!downloadPath) throw new Error(`${profile.name} did not expose the exported file.`)
    const output = await fs.readFile(downloadPath)
    const metadata = await sharp(output).metadata()
    if (output.byteLength > maxUploadBytes) {
      throw new Error(`${profile.name} export exceeded 5 MB: ${output.byteLength} bytes.`)
    }
    if (!metadata.format || !metadata.width || !metadata.height) {
      throw new Error(`${profile.name} export is not a readable image: ${JSON.stringify(metadata)}.`)
    }

    const finalViewport = await readViewportMetrics(page)
    assertNoHorizontalOverflow(finalViewport, profile.name)
    if (consoleErrors.length > 0 || pageErrors.length > 0 || requestFailures.length > 0) {
      throw new Error(`Browser errors on ${profile.name}: ${JSON.stringify({ consoleErrors, pageErrors, requestFailures })}`)
    }

    return {
      device: profile.name,
      viewport: `${profile.viewport.width}x${profile.viewport.height}`,
      uploadedImages: 2,
      selectedLayout: 'Vertical',
      selectedRatio: 'Original ratio',
      output: {
        filename: download.suggestedFilename(),
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        bytes: output.byteLength,
        withinFiveMb: output.byteLength <= maxUploadBytes,
      },
      initialViewport,
      finalViewport,
      consoleErrors,
      pageErrors,
      requestFailures,
    }
  } finally {
    await context.close()
  }
}

const configuredBaseUrl = process.env.SMOKE_BASE_URL?.replace(/\/$/, '')
const port = configuredBaseUrl ? null : await findAvailablePerfPort(Number(process.env.SMOKE_PORT ?? 3100))
const baseUrl = configuredBaseUrl ?? `http://127.0.0.1:${port}`
const server = configuredBaseUrl
  ? null
  : spawn(process.execPath, [staticServerEntrypoint, path.join(projectRoot, 'out'), '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
      windowsHide: true,
    })

let browser
try {
  if (server) await waitForServer(server, `${baseUrl}/en`)
  browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'chrome',
    headless: true,
  })

  const runEdgeSmoke = process.argv.includes('--edge')
  const fixtureBase64 = (await fs.readFile(fixturePath)).toString('base64')
  const results = []
  for (const profile of deviceProfiles) {
    const basic = await runDeviceSmoke(browser, baseUrl, profile)
    const edge = runEdgeSmoke ? await runEdgeDeviceSmoke(browser, baseUrl, profile, fixtureBase64) : null
    results.push(runEdgeSmoke ? { basic, edge } : basic)
  }

  console.log(JSON.stringify({
    baseUrl,
    build: configuredBaseUrl ? 'live external deployment' : 'static export',
    results,
  }, null, 2))
} finally {
  await browser?.close()
  stopProcessTree(server)
}
