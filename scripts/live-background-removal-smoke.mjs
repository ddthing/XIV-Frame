import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { chromium, devices } from '@playwright/test'

const projectRoot = process.cwd()
const baseUrl = 'http://127.0.0.1:3000/ko'
const fixture = path.join(projectRoot, 'public', 'og-image.jpg')
const nextEntrypoint = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next')
const timeoutMs = 180_000
const useMobileDevice = process.argv.includes('--mobile')

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function waitForServer(server) {
  const deadline = Date.now() + 120_000
  let serverExitCode
  server.once('exit', (code) => { serverExitCode = code })

  while (Date.now() < deadline) {
    if (serverExitCode !== undefined) {
      throw new Error(`Next.js dev server exited before becoming ready (code ${serverExitCode}).`)
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

const server = spawn(process.execPath, [nextEntrypoint, 'dev', '--hostname', '127.0.0.1'], {
  cwd: projectRoot,
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
})

let browser
let context

try {
  await waitForServer(server)
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  context = await browser.newContext(useMobileDevice ? devices['iPhone 16 Pro Max'] : undefined)
  const page = await context.newPage()
  const requestFailures = []
  const consoleMessages = []
  const recordConsoleMessage = (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      consoleMessages.push({ type: message.type(), text: message.text(), location: message.location() })
    }
  }
  page.on('console', recordConsoleMessage)
  page.on('worker', (worker) => worker.on('console', recordConsoleMessage))
  page.on('requestfailed', (request) => {
    const url = request.url()
    if (url.includes('huggingface.co') || url.includes('onnx-community')) {
      requestFailures.push(`${url} (${request.failure()?.errorText ?? 'unknown'})`)
    }
  })

  await page.addInitScript(() => window.localStorage.clear())
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  if (useMobileDevice) {
    await page.getByRole('button', { name: '사진', exact: true }).click()
  } else {
    await page.getByRole('tab', { name: '01 사진 소스' }).click()
  }
  const characterTab = page.getByRole('tab', { name: '합성', exact: true })
  if (useMobileDevice) {
    await characterTab.evaluate((element) => element.click())
  } else {
    await characterTab.click()
  }
  await page.locator('#character-file-input').setInputFiles(fixture)

  const removeButton = page.getByRole('button', { name: '배경 제거', exact: true })
  await removeButton.waitFor({ state: 'visible', timeout: 30_000 })
  await removeButton.click()

  const resultImage = page.getByRole('img', { name: '배경 제거 결과', exact: true })
  const startedAt = Date.now()
  const outcome = await Promise.race([
    resultImage.waitFor({ state: 'visible', timeout: timeoutMs }).then(() => ({ status: 'success' })),
    page.waitForFunction(
      () => Boolean(document.querySelector('[data-character-processing-error="true"]')?.textContent?.trim()),
      null,
      { timeout: timeoutMs },
    ).then(async () => ({
      status: 'error',
      message: (await page.locator('[data-character-processing-error="true"]').first().textContent())?.trim() ?? '',
    })),
    page.waitForTimeout(timeoutMs).then(() => ({ status: 'timeout', message: '배경 제거 스모크 테스트 시간이 초과되었습니다.' })),
  ])

  const elapsedMs = Date.now() - startedAt
  if (outcome.status === 'success') {
    console.log(JSON.stringify({ status: 'success', elapsedMs, requestFailures, consoleMessages }))
  } else {
    console.error(JSON.stringify({ status: 'error', elapsedMs, message: outcome.message, requestFailures, consoleMessages }))
    process.exitCode = 1
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await context?.close()
  await browser?.close()
  stopProcessTree(server)
}
