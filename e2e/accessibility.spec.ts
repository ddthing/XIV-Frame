import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const axeSource = readFileSync(path.join(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js'), 'utf8')

type AxeViolation = {
  id: string
  impact: string | null
  help: string
  nodes: { target: string[]; failureSummary?: string }[]
}

async function expectNoSeriousAccessibilityViolations(page: Page, context = 'document') {
  await page.addScriptTag({ content: axeSource })
  const violations = await page.evaluate(async ({ target }) => {
    const axe = (window as Window & {
      axe?: { run: (context: string | Document, options: object) => Promise<{ violations: AxeViolation[] }> }
    }).axe
    if (!axe) throw new Error('axe-core did not load')
    const scanTarget = target === 'document' ? document : target
    const result = await axe.run(scanTarget, {
      resultTypes: ['violations'],
      rules: {
        'aria-allowed-attr': { enabled: true },
        'color-contrast': { enabled: true },
      },
    })
    return result.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
  }, { target: context })

  const summary = violations.map((violation) => ({
    impact: violation.impact,
    rule: violation.id,
    targets: violation.nodes.map((node) => node.target.join(' ')),
  }))

  expect(summary).toEqual([])
}

async function openEditor(page: Page) {
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto('/ko', { waitUntil: 'networkidle', timeout: 15_000 })
  await expect(page.getByRole('heading', { name: '프레임 미리보기' })).toBeVisible()
}

test('keeps all desktop editor stages free of serious accessibility violations', async ({ page }) => {
  await openEditor(page)
  await expectNoSeriousAccessibilityViolations(page)

  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await expect(page.getByRole('group', { name: '레이아웃 목록' })).toBeVisible()
  await expectNoSeriousAccessibilityViolations(page)

  await page.getByRole('tab', { name: '03 시그니처 오버레이' }).click()
  await expect(page.locator('#signature-upper-text')).toBeVisible()
  await expectNoSeriousAccessibilityViolations(page)
})

test('keeps public guide pages localized, landmarked, and axe-clean', async ({ page }) => {
  await page.goto('/ko/blog', { waitUntil: 'networkidle', timeout: 15_000 })
  await expect(page.locator('main')).toBeVisible()
  await expect(page.locator('footer')).toContainText('Square Enix 비공식 팬 도구')
  await expect(page.getByText('추천 가이드', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('시작 순서', { exact: true })).toBeVisible()
  await expectNoSeriousAccessibilityViolations(page)
})

test('honors reduced motion and keeps the mobile editor axe-clean', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/ko', { waitUntil: 'networkidle', timeout: 15_000 })

  const navButton = page.getByRole('navigation', { name: '모바일 편집 도구' }).getByRole('button', { name: '레이아웃' })
  const transitionDuration = await navButton.evaluate((element) => getComputedStyle(element).transitionDuration)
  expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(0.00001)
  await expectNoSeriousAccessibilityViolations(page)
})
