import path from 'node:path'
import { expect, test } from '@playwright/test'

const fixture = path.join(process.cwd(), 'public', 'og-image.jpg')

test('explains when the background-removal model cannot be loaded', async ({ page }) => {
  await page.route('https://huggingface.co/**', (route) => route.abort('failed'))
  await page.addInitScript(() => {
    window.localStorage.clear()
  })

  await page.goto('/ko', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Your frame, in focus.' })).toBeVisible()
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await page.getByRole('tab', { name: '합성', exact: true }).click()
  await page.locator('#character-file-input').setInputFiles(fixture)

  const removeButton = page.getByRole('button', { name: '배경 제거', exact: true })
  await expect(removeButton).toBeEnabled({ timeout: 30_000 })
  await removeButton.click()

  const alert = page.locator('[data-character-processing-error="true"]')
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
  await page.addInitScript(() => {
    window.localStorage.clear()
  })

  await page.goto('/ko', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Your frame, in focus.' })).toBeVisible()
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await page.getByRole('tab', { name: '합성', exact: true }).click()
  await page.locator('#character-file-input').setInputFiles(fixture)

  const removeButton = page.getByRole('button', { name: '배경 제거', exact: true })
  const alert = page.locator('[data-character-processing-error="true"]')
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
