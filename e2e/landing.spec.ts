import { expect, test } from '@playwright/test'

const externalFontHosts = ['fonts.googleapis.com', 'cdn.jsdelivr.net']

function isExternalFontRequest(url: string) {
  return externalFontHosts.some((host) => url.includes(host))
}

test('keeps the landing page focused on opening the editor', async ({ page }) => {
  const browserMessages: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      const location = message.location().url
      if (!isExternalFontRequest(`${location} ${message.text()}`)) {
        browserMessages.push(message.text())
      }
    }
  })
  page.on('requestfailed', (request) => {
    if (!isExternalFontRequest(request.url())) {
      browserMessages.push(`request failed: ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
    }
  })

  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15_000 })

  await expect(page.getByRole('heading', { name: /스크린샷을.*한 장의 결과로/ })).toBeVisible()
  await expect(page.getByRole('link', { name: '편집기 열기' })).toHaveAttribute('href', '/ko')
  await expect(page.getByRole('link', { name: '가이드 보기' })).toHaveAttribute('href', '/ko/blog')

  const footer = page.getByRole('contentinfo')
  for (const label of ['가이드', '자주 묻는 질문', '소개', '문의']) {
    await expect(footer.getByRole('link', { name: label, exact: true })).toHaveCount(0)
  }
  await expect(footer.getByRole('link', { name: '개인정보처리방침', exact: true })).toBeVisible()
  await expect(footer.getByRole('link', { name: '이용약관', exact: true })).toBeVisible()

  await expect(page.getByText('결과를 만드는 다섯 단계', { exact: true })).toHaveCount(0)
  await expect(page.getByText('목적에 따라 기능을 선택하세요.', { exact: true })).toHaveCount(0)
  await expect(page.getByText('결과를 확인하는 기준까지 공개합니다.', { exact: true })).toHaveCount(0)
  await expect(page.getByText('사용 전에 확인할 범위', { exact: true })).toHaveCount(0)
  expect(browserMessages, browserMessages.join('\n')).toEqual([])
})
