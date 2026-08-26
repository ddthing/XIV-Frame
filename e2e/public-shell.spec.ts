import { expect, test } from '@playwright/test'

test('keeps primary navigation in the header and secondary links in the footer', async ({ page }) => {
  const publicRoutes = ['/', '/ko/blog', '/ko/faq', '/ko/about', '/ko/contact']
  const primaryLabels = ['가이드', '자주 묻는 질문', '소개', '문의']
  const footerLabels = ['개인정보처리방침', '이용약관']

  for (const route of publicRoutes) {
    await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15_000 })

    const header = page.getByRole('banner')
    const footer = page.getByRole('contentinfo')

    for (const label of primaryLabels) {
      await expect(header.getByRole('link', { name: label, exact: true })).toBeVisible()
      await expect(footer.getByRole('link', { name: label, exact: true })).toHaveCount(0)
    }

    for (const label of footerLabels) {
      await expect(footer.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
  }
})
