import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const fixture = path.join(process.cwd(), 'public', 'og-image.jpg')
type CharacterFile = string | { name: string; mimeType: string; buffer: Buffer }

async function openCharacterSettings(page: Page) {
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto('/ko', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Your frame, in focus.' })).toBeVisible()
  const sourceTab = page.getByRole('tab', { name: '01 사진 소스' })
  await sourceTab.click()
  await expect(sourceTab).toHaveAttribute('aria-selected', 'true')
  const characterTab = page.getByRole('tab', { name: '합성', exact: true })
  await characterTab.click()
  await expect(characterTab).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('#character-file-input')).toBeAttached({ timeout: 15_000 })
}

function processingError(page: Page) {
  return page.locator('[data-character-processing-error="true"]')
}

async function selectCharacterFile(page: Page, file: CharacterFile) {
  await page.locator('#character-file-input').setInputFiles(file)
}

test('explains when the background-removal model cannot be loaded', async ({ page }) => {
  await page.route(/https:\/\/(?:[^/]+\.)?huggingface\.co\//, (route) => route.abort('failed'))
  await openCharacterSettings(page)
  await selectCharacterFile(page, fixture)

  const removeButton = page.getByRole('button', { name: '배경 제거', exact: true })
  await expect(removeButton).toBeEnabled({ timeout: 30_000 })
  await removeButton.click()

  const alert = processingError(page)
  await expect(alert).toContainText('배경 제거 모델을 준비하지 못했습니다.')
  await expect(alert).toContainText('인터넷 연결')
  await expect(alert).not.toContainText('이미지 크기를 줄이거나')
})

test('recovers on an explicit retry after a transient model fetch failure', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { removeAttempts: 0, terminateCount: 0 }

    class RetryWorker {
      private listeners = new Map<string, Set<(event: unknown) => void>>()

      addEventListener(type: string, listener: (event: unknown) => void) {
        const listeners = this.listeners.get(type) ?? new Set()
        listeners.add(listener)
        this.listeners.set(type, listeners)
      }

      postMessage(message: { type: string; requestId: number }) {
        const listeners = this.listeners.get('message') ?? new Set()
        if (message.type !== 'remove') return

        state.removeAttempts += 1
        if (state.removeAttempts === 1) {
          listeners.forEach((listener) => listener({
            data: { type: 'error', requestId: message.requestId, message: 'Failed to fetch' },
          }))
          return
        }

        const data = new Uint8ClampedArray([255, 255, 255, 255])
        listeners.forEach((listener) => listener({
          data: {
            type: 'result',
            requestId: message.requestId,
            data: data.buffer,
            width: 1,
            height: 1,
            channels: 4,
          },
        }))
      }

      terminate() {
        state.terminateCount += 1
      }
    }

    Object.defineProperty(window, 'Worker', {
      configurable: true,
      writable: true,
      value: RetryWorker,
    })
    Object.defineProperty(window, '__xivFrameRetryState', {
      configurable: true,
      value: state,
    })
  })
  await openCharacterSettings(page)
  await selectCharacterFile(page, fixture)

  const removeButton = page.getByRole('button', { name: '배경 제거', exact: true })
  const alert = processingError(page)
  await expect(removeButton).toBeEnabled({ timeout: 30_000 })
  await removeButton.click()
  await expect(alert).toContainText('배경 제거 모델을 준비하지 못했습니다.')
  await expect(page.getByRole('button', { name: '배경 제거 다시 시도', exact: true })).toBeVisible()
  await expect(removeButton).toBeEnabled()

  await removeButton.click()
  await expect.poll(() => page.evaluate(() => (
    window as Window & { __xivFrameRetryState?: { removeAttempts: number } }
  ).__xivFrameRetryState?.removeAttempts ?? 0)).toBe(2)
  await expect(page.getByRole('img', { name: '배경 제거 결과', exact: true })).toBeVisible()
  await expect(alert).toBeHidden()
})

test('explains an unsupported character file before background removal starts', async ({ page }) => {
  await openCharacterSettings(page)
  await selectCharacterFile(page, {
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  })

  const alert = processingError(page)
  await expect(alert).toContainText('이미지 파일만 추가할 수 있습니다.')
  await expect(page.getByRole('button', { name: '배경 제거', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '배경 제거 다시 시도', exact: true })).toHaveCount(0)
})

test('explains an oversized character file before decoding it', async ({ page }) => {
  await openCharacterSettings(page)
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'xiv-frame-background-error-'))
  const temporaryFile = path.join(temporaryDirectory, 'oversized.png')

  try {
    await writeFile(temporaryFile, Buffer.alloc(50 * 1024 * 1024 + 1))
    await selectCharacterFile(page, temporaryFile)

    const alert = processingError(page)
    await expect(alert).toContainText('이미지는 50MB 이하만 추가할 수 있습니다.')
    await expect(page.getByRole('button', { name: '배경 제거', exact: true })).toHaveCount(0)
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
})

test('explains when a character image cannot be decoded', async ({ page }) => {
  await openCharacterSettings(page)
  await selectCharacterFile(page, {
    name: 'broken.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('not a jpeg'),
  })

  const alert = processingError(page)
  await expect(alert).toContainText('이미지를 읽거나 처리하지 못했습니다.')
  await expect(alert).not.toContainText('이미지를 편집할 수 없습니다.')
})

const modelFailureScenarios = [
  {
    name: 'browser unsupported',
    message: 'WebAssembly backend is not supported',
    expected: '현재 브라우저에서는 배경 제거를 실행할 수 없습니다.',
  },
  {
    name: 'insufficient image memory',
    message: 'WebAssembly memory allocation failed',
    expected: '이미지 처리에 필요한 메모리가 부족합니다.',
  },
  {
    name: 'image processing',
    message: 'Image decode failed',
    expected: '이미지를 읽거나 처리하지 못했습니다.',
  },
  {
    name: 'timeout',
    message: 'Background removal timed out',
    expected: '배경 제거 시간이 너무 오래 걸렸습니다.',
  },
] as const

for (const scenario of modelFailureScenarios) {
  test(`shows a cause-specific message for ${scenario.name}`, async ({ page }) => {
    await page.addInitScript(({ failureMessage }) => {
      const nativeFetch = window.fetch.bind(window)
      window.fetch = async (input, init) => {
        const url = typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url
        if (url.includes('huggingface.co') || url.includes('onnx-community')) {
          throw new Error(failureMessage)
        }
        return nativeFetch(input, init)
      }
      Object.defineProperty(window, 'Worker', {
        configurable: true,
        writable: true,
        value: undefined,
      })
    }, { failureMessage: scenario.message })
    await openCharacterSettings(page)
    await selectCharacterFile(page, fixture)

    const removeButton = page.getByRole('button', { name: '배경 제거', exact: true })
    await expect(removeButton).toBeEnabled({ timeout: 30_000 })
    await removeButton.click()

    const alert = processingError(page)
    await expect(alert).toContainText(scenario.expected, { timeout: 30_000 })
    await expect(page.getByRole('button', { name: '배경 제거 다시 시도', exact: true })).toBeVisible()
  })
}
