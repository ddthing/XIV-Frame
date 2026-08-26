import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import sharp from 'sharp'

const projectRoot = process.cwd()
const wideFixture = path.join(projectRoot, 'public', 'og-image.jpg')
const squareFixture = path.join(projectRoot, 'public', 'noise-pattern.png')
const externalFontHosts = ['fonts.googleapis.com', 'cdn.jsdelivr.net']

function isExternalFontRequest(url: string) {
  return externalFontHosts.some((host) => url.includes(host))
}

async function openFreshEditor(page: Page, { expectDesktop = true, clearStorage = true } = {}) {
  if (clearStorage) {
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
  }
  await page.goto('/ko', { waitUntil: 'networkidle', timeout: 15_000 })
  if (expectDesktop) {
    await expect(page.getByRole('heading', { name: 'Your frame, in focus.' })).toBeVisible()
  }
}

async function uploadFixtures(page: Page, files: string[]) {
  await page.locator('input[type="file"]').setInputFiles(files)
  await expect(page.getByText(`${String(files.length).padStart(2, '0')} / 16`, { exact: true })).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 60_000 })
}

async function createPortraitFixture() {
  return sharp(squareFixture)
    .resize({ width: 800, height: 1200, fit: 'fill' })
    .jpeg()
    .toBuffer()
}

test('presents the editor workflow as photos, layout, then signature', async ({ page }) => {
  await openFreshEditor(page)

  const desktopTabs = page.locator('[role="tablist"]').first().getByRole('tab')
  await expect(desktopTabs).toHaveCount(3)
  await expect(desktopTabs.nth(0)).toHaveAccessibleName('01 사진 소스')
  await expect(desktopTabs.nth(1)).toHaveAccessibleName('02 레이아웃 구성')
  await expect(desktopTabs.nth(2)).toHaveAccessibleName('03 시그니처 오버레이')

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  const mobileButtons = page.getByRole('navigation', { name: '모바일 편집 도구' }).getByRole('button')
  await expect(mobileButtons).toHaveCount(4)
  await expect(mobileButtons.nth(0)).toHaveAccessibleName('사진')
  await expect(mobileButtons.nth(1)).toHaveAccessibleName('레이아웃')
  await expect(mobileButtons.nth(2)).toHaveAccessibleName('서명')
  await expect(mobileButtons.nth(3)).toHaveAccessibleName('저장')
})

test('keeps layout navigation and template labels inside their controls in every locale', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 })

  for (const locale of ['ko', 'en', 'ja']) {
    await page.goto(`/${locale}`, { waitUntil: 'domcontentloaded', timeout: 15_000 })
    const inspectorTabs = page.locator('aside [role="tablist"]').first().getByRole('tab')
    await expect(inspectorTabs).toHaveCount(3)
    await inspectorTabs.nth(1).click()
    await expect(page.locator('aside [data-layout-template-card]').first()).toBeVisible()

    const overflow = await page.locator('aside [role="tab"], aside [data-layout-template-card]').evaluateAll((elements) => elements.flatMap((element) => {
      const container = element.getBoundingClientRect()
      const overflowingDescendants = [...element.querySelectorAll<HTMLElement>('*')]
        .filter((child) => {
          const rect = child.getBoundingClientRect()
          return rect.left < container.left - 1 || rect.right > container.right + 1
        })
        .map((child) => child.textContent?.trim() || child.tagName.toLowerCase())

      return element.scrollWidth > element.clientWidth + 1 || overflowingDescendants.length > 0
        ? [{ text: element.textContent?.trim(), overflowingDescendants }]
        : []
    }))

    expect(overflow, `${locale} layout controls contain overflowing text`).toEqual([])
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
  }
})

test('uses original ratio by default and keeps the X timeline profile as an option', async ({ page }) => {
  await openFreshEditor(page)

  const ratioGroup = page.getByRole('group', { name: '비율', exact: true })
  const xTimeline = ratioGroup.getByRole('button', { name: 'X 타임라인', exact: true })
  const originalRatio = ratioGroup.getByRole('button', { name: '원본 비율', exact: true })

  await expect(originalRatio).toHaveAttribute('aria-pressed', 'true')
  await expect(xTimeline).toBeVisible()

  await xTimeline.click()
  await expect(xTimeline).toHaveAttribute('aria-pressed', 'true')
  await expect(originalRatio).toHaveAttribute('aria-pressed', 'false')
})

test('migrates the previous automatic ratio setting to original ratio', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('xiv-frame-settings-v2', JSON.stringify({
      state: { canvasRatio: 'auto' },
      version: 3,
    }))
  })

  await page.goto('/ko', { waitUntil: 'domcontentloaded', timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Your frame, in focus.' })).toBeVisible()

  const ratioGroup = page.getByRole('group', { name: '비율', exact: true })
  await expect(ratioGroup.getByRole('button', { name: '원본 비율', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('migrates the previous fixed 16:9 setting to the X timeline profile', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('xiv-frame-settings-v2', JSON.stringify({
      state: { canvasRatio: '16:9' },
      version: 3,
    }))
  })

  await page.goto('/ko', { waitUntil: 'domcontentloaded', timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Your frame, in focus.' })).toBeVisible()

  const ratioGroup = page.getByRole('group', { name: '비율', exact: true })
  await expect(ratioGroup.getByRole('button', { name: 'X 타임라인', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('uses original ratio by default in the mobile export settings', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openFreshEditor(page, { expectDesktop: false })
  await page.getByRole('button', { name: '저장', exact: true }).click()

  const ratioGroup = page.getByRole('group', { name: '비율 설정', exact: true })
  await expect(ratioGroup.getByRole('button', { name: '원본 비율', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(ratioGroup.getByRole('button', { name: 'X 타임라인', exact: true })).toHaveAttribute('aria-pressed', 'false')
})

test('exports a two-photo original-ratio composition without scroll or browser errors', async ({ page }) => {
  const browserMessages: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      const location = message.location().url
      if (!isExternalFontRequest(`${location} ${message.text()}`)) {
        browserMessages.push(`${message.text()}${location ? ` (${location})` : ''}`)
      }
    }
  })
  page.on('pageerror', (error) => browserMessages.push(`pageerror: ${error.message}`))
  page.on('requestfailed', (request) => {
    if (!isExternalFontRequest(request.url())) {
      browserMessages.push(`request failed: ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
    }
  })

  await openFreshEditor(page)
  const portraitBuffer = await createPortraitFixture()
  await page.locator('input[type="file"]').setInputFiles([
    { name: 'portrait-1.jpg', mimeType: 'image/jpeg', buffer: portraitBuffer },
    { name: 'portrait-2.jpg', mimeType: 'image/jpeg', buffer: portraitBuffer },
  ])

  await expect(page.getByText('02 / 16', { exact: true })).toBeVisible()
  const canvasFrame = page.locator('[data-layout-effective-preset]')
  await expect(canvasFrame).toHaveAttribute('data-layout-effective-preset', 'split')
  await expect(canvasFrame).toHaveAttribute('data-layout-empty-slot-count', '0')

  const viewport = await page.evaluate(() => {
    window.scrollTo(0, 1000)
    return {
      documentHeight: document.documentElement.scrollHeight,
      documentWidth: document.documentElement.scrollWidth,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      scrollY: window.scrollY,
    }
  })
  expect(viewport.documentHeight).toBeLessThanOrEqual(viewport.viewportHeight + 1)
  expect(viewport.documentWidth).toBeLessThanOrEqual(viewport.viewportWidth + 1)
  expect(viewport.scrollY).toBe(0)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '저장 PNG', exact: true }).click()
  const download = await downloadPromise
  const downloadPath = await download.path()
  if (!downloadPath) throw new Error('The original-ratio download path was not available')

  const exportMetadata = await sharp(downloadPath).metadata()
  expect(download.suggestedFilename()).toMatch(/\.(png|jpg)$/)
  expect(statSync(downloadPath).size).toBeLessThanOrEqual(5_000_000)
  expect(exportMetadata.width).toBeGreaterThan(exportMetadata.height ?? 0)
  expect(browserMessages, browserMessages.join('\n')).toEqual([])
})

test('previews the selected layout slots before photos are uploaded', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()

  const gridButton = page.getByRole('button', { name: /^바둑판 배치/ })
  await expect(gridButton).toBeVisible()
  await gridButton.click()
  await expect(gridButton).toHaveAttribute('aria-pressed', 'true')

  const canvasFrame = page.locator('[data-layout-effective-preset]')
  await expect(canvasFrame).toBeVisible()
  await expect(canvasFrame).toHaveAttribute('data-layout-effective-preset', 'grid')
  await expect(canvasFrame).toHaveAttribute('data-layout-image-count', '0')
  await expect(canvasFrame).toHaveAttribute('data-layout-slot-count', '4')
  await expect(canvasFrame).toHaveAttribute('data-layout-empty-slot-count', '4')
  await expect(canvasFrame.locator('canvas').last()).toBeVisible()
})

test('places the four-slot grid template in the four-image group', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()

  const fourImageGroup = page.locator('aside').getByRole('group', { name: '4장 패턴', exact: true })
  await expect(fourImageGroup.getByRole('button', { name: /^바둑판 배치/ })).toBeVisible()
})

test('keeps the selected two-slot preview when the first photo is uploaded', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()

  const splitButton = page.getByRole('button', { name: /^가로 분할/ })
  await splitButton.click()
  await expect(splitButton).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await uploadFixtures(page, [wideFixture])

  const canvasFrame = page.locator('[data-layout-effective-preset]')
  await expect(canvasFrame).toHaveAttribute('data-layout-effective-preset', 'split')
  await expect(canvasFrame).toHaveAttribute('data-layout-slot-count', '2')
  await expect(canvasFrame).toHaveAttribute('data-layout-empty-slot-count', '1')
})

test('keeps an original-ratio two-slot preview wide with one portrait photo', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('group', { name: '비율', exact: true }).getByRole('button', { name: '원본 비율', exact: true }).click()
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('button', { name: /^가로 분할/ }).click()
  await page.getByRole('tab', { name: '01 사진 소스' }).click()

  await page.locator('input[type="file"]').setInputFiles({
    name: 'portrait.jpg',
    mimeType: 'image/jpeg',
    buffer: await createPortraitFixture(),
  })

  await expect(page.getByText('01 / 16', { exact: true })).toBeVisible()
  const stageCanvas = page.locator('[data-layout-effective-preset] canvas').last()
  await expect(stageCanvas).toBeVisible()
  await expect.poll(async () => {
    const box = await stageCanvas.boundingBox()
    return box ? box.width / box.height : 0
  }).toBeGreaterThan(1)
})

test('keeps the default preview slots when a photo is added from an empty slot', async ({ page }) => {
  await openFreshEditor(page)

  const canvasFrame = page.locator('[data-layout-effective-preset]')
  const canvas = canvasFrame.locator('canvas').last()
  const canvasBox = await canvas.boundingBox()
  if (!canvasBox) throw new Error('Default preview canvas was not found')

  const fileChooserPromise = page.waitForEvent('filechooser')
  await canvas.click({ position: { x: canvasBox.width * 0.25, y: canvasBox.height * 0.5 } })
  await (await fileChooserPromise).setFiles(wideFixture)

  await expect(canvasFrame).toHaveAttribute('data-layout-effective-preset', 'split')
  await expect(canvasFrame).toHaveAttribute('data-layout-slot-count', '2')
  await expect(canvasFrame).toHaveAttribute('data-layout-empty-slot-count', '1')
})

test('highlights an empty layout slot while the pointer is over it', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('button', { name: /^바둑판 배치/ }).click()

  const canvas = page.locator('[data-layout-effective-preset] canvas').last()
  const canvasBox = await canvas.boundingBox()
  if (!canvasBox) throw new Error('Empty editor canvas was not found')

  const samplePrimarySlot = () => canvas.evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) throw new Error('Rendered element is not a canvas')
    const context = element.getContext('2d')
    if (!context) throw new Error('Canvas context is unavailable')
    return Array.from(context.getImageData(Math.floor(element.width * 0.25), Math.floor(element.height * 0.25), 1, 1).data)
  })

  const idlePixel = await samplePrimarySlot()
  await page.mouse.move(canvasBox.x + canvasBox.width * 0.25, canvasBox.y + canvasBox.height * 0.25)
  await expect.poll(samplePrimarySlot).not.toEqual(idlePixel)
  await page.mouse.move(1, 1)
  await expect.poll(samplePrimarySlot).toEqual(idlePixel)
})

test('keeps the selected layout while it is partially filled', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('button', { name: /^바둑판 배치/ }).click()
  await page.getByRole('tab', { name: '01 사진 소스' }).click()

  await uploadFixtures(page, [wideFixture, squareFixture])

  await expect(page.locator('[data-layout-effective-preset]')).toHaveAttribute('data-layout-effective-preset', 'grid')
  await expect(page.locator('[data-layout-effective-preset]')).toHaveAttribute('data-layout-image-count', '2')
})

test('keeps the fourth grid slot available after three photos are loaded', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture, squareFixture, wideFixture])
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()

  const gridButton = page.getByRole('button', { name: '바둑판 배치', exact: true })
  await gridButton.click()

  const canvasFrame = page.locator('[data-layout-effective-preset]')
  await expect(canvasFrame).toHaveAttribute('data-layout-effective-preset', 'grid')
  await expect(canvasFrame).toHaveAttribute('data-layout-slot-count', '4')
  await expect(canvasFrame).toHaveAttribute('data-layout-empty-slot-count', '1')

  const canvas = canvasFrame.locator('canvas').last()
  const canvasBox = await canvas.boundingBox()
  if (!canvasBox) throw new Error('Grid preview canvas was not found')
  const fileChooserPromise = page.waitForEvent('filechooser')
  await canvas.click({ position: { x: canvasBox.width * 0.75, y: canvasBox.height * 0.75 } })
  await (await fileChooserPromise).setFiles(squareFixture)

  await expect(canvasFrame).toHaveAttribute('data-layout-image-count', '4')
  await expect(canvasFrame).toHaveAttribute('data-layout-empty-slot-count', '0')
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await expect(page.getByText('04 / 16', { exact: true })).toBeVisible()
})

test('shows film grain in the live preview when intensity is increased', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture])
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()

  const canvases = page.locator('[data-layout-effective-preset] canvas')
  const canvasCountBefore = await canvases.count()
  const grainSlider = page.locator('#grain-intensity input')
  await grainSlider.press('End')
  await expect(grainSlider).toHaveAttribute('aria-valuenow', '100')
  await expect.poll(() => canvases.count()).toBeGreaterThan(canvasCountBefore)

  const noiseCanvas = canvases.last()
  const noiseSamples = await noiseCanvas.evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) throw new Error('Rendered noise layer is not a canvas')
    const context = element.getContext('2d')
    if (!context) throw new Error('Noise layer canvas context is unavailable')
    const points = [
      [0.17, 0.19],
      [0.31, 0.37],
      [0.53, 0.23],
      [0.72, 0.64],
    ]
    return points.flatMap(([x, y]) => Array.from(context.getImageData(Math.floor(element.width * x), Math.floor(element.height * y), 1, 1).data))
  })
  expect(noiseSamples.some((value, index) => index % 4 === 3 && value > 0)).toBe(true)
})

test('keeps the document viewport fixed when sixteen photos are selected', async ({ page }) => {
  await openFreshEditor(page)
  const manyPhotos = Array.from({ length: 16 }, (_, index) => index % 2 === 0 ? wideFixture : squareFixture)
  await uploadFixtures(page, manyPhotos)

  const metrics = await page.evaluate(() => ({
    viewportHeight: window.innerHeight,
    documentHeight: document.documentElement.scrollHeight,
    bodyClientHeight: document.body.clientHeight,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }))
  const scrollState = await page.evaluate(() => {
    window.scrollTo(0, 1000)
    return {
      windowScrollY: window.scrollY,
      rootScrollTop: document.documentElement.scrollTop,
    }
  })

  expect(metrics.documentHeight).toBeLessThanOrEqual(metrics.viewportHeight + 1)
  expect(metrics.bodyClientHeight).toBeLessThanOrEqual(metrics.viewportHeight + 1)
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1)
  expect(scrollState.windowScrollY).toBe(0)
  expect(scrollState.rootScrollTop).toBe(0)

  const inspectorScroll = page.locator('aside [class*="overflow-y-auto"]').first()
  await expect.poll(() => inspectorScroll.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true)
  const inspectorScrollTop = await inspectorScroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight
    return element.scrollTop
  })
  expect(inspectorScrollTop).toBeGreaterThan(0)
})

test('adds multiple photos through the drag and drop path', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('button', { name: /^바둑판 배치/ }).click()

  const dragFiles = [wideFixture, squareFixture].map((filePath) => ({
    name: path.basename(filePath),
    type: filePath.endsWith('.png') ? 'image/png' : 'image/jpeg',
    bytes: Array.from(readFileSync(filePath)),
  }))

  await page.evaluate((files) => {
    const transfer = new DataTransfer()
    files.forEach(({ name, type, bytes }) => {
      transfer.items.add(new File([new Uint8Array(bytes)], name, { type }))
    })
    const dropTarget = document.querySelector('.app-backdrop')
    if (!dropTarget) throw new Error('Drop target was not found')
    dropTarget.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: transfer }))
  }, dragFiles)

  await expect(page.locator('[data-layout-effective-preset]')).toHaveAttribute('data-layout-image-count', '2')
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await expect(page.getByText('02 / 16', { exact: true })).toBeVisible()
  await expect(page.locator('[data-layout-effective-preset]')).toHaveAttribute('data-layout-effective-preset', 'grid')
})

test('uploads directly from an empty layout slot and selects the new photo', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('button', { name: /^바둑판 배치/ }).click()

  const fileChooserPromise = page.waitForEvent('filechooser')
  const canvas = page.locator('[data-layout-effective-preset] canvas').last()
  const canvasBox = await canvas.boundingBox()
  if (!canvasBox) throw new Error('Empty editor canvas was not found')
  await canvas.click({ position: { x: canvasBox.width * 0.25, y: canvasBox.height * 0.25 } })
  await (await fileChooserPromise).setFiles(wideFixture)

  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await expect(page.getByText('01 / 16', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '이미지 선택 1', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('uploads into the final visible layout slot without collapsing the canvas', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('button', { name: /^바둑판 배치/ }).click()
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await uploadFixtures(page, [wideFixture, squareFixture])

  const canvasFrame = page.locator('[data-layout-effective-preset]')
  const canvas = canvasFrame.locator('canvas').last()
  const canvasBox = await canvas.boundingBox()
  if (!canvasBox) throw new Error('Canvas hit target is not measurable')

  const fileChooserPromise = page.waitForEvent('filechooser')
  await canvas.click({ position: { x: canvasBox.width * 0.75, y: canvasBox.height * 0.75 } })
  await (await fileChooserPromise).setFiles(wideFixture)

  await expect(page.getByText('03 / 16', { exact: true })).toBeVisible()
  await expect(canvasFrame).toBeVisible()
  await expect(canvasFrame).toHaveAttribute('data-layout-effective-preset', 'grid')
  await expect(canvasFrame).toHaveAttribute('data-layout-image-count', '3')
  await expect(canvasFrame).toHaveAttribute('data-layout-slot-count', '4')
  await expect(canvasFrame).toHaveAttribute('data-layout-empty-slot-count', '1')
})

test('preserves all photos and explains overflow when a layout has a smaller capacity', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture, squareFixture, wideFixture, squareFixture, wideFixture])

  const sourcesBefore = await page.getByRole('img', { name: /이미지 미리보기/ }).evaluateAll((images) => images.map((image) => image.getAttribute('src')))
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()

  const fourColumnButton = page.getByRole('button', { name: /^4열 균등/ })
  await fourColumnButton.click()
  await expect(fourColumnButton).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('현재 5장의 사진은 그대로 유지됩니다.', { exact: false })).toBeVisible()

  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await expect(page.getByText('05 / 16', { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: /이미지 미리보기/ })).toHaveCount(5)
  const sourcesAfter = await page.getByRole('img', { name: /이미지 미리보기/ }).evaluateAll((images) => images.map((image) => image.getAttribute('src')))
  expect(sourcesAfter).toEqual(sourcesBefore)
})

test('applies the border width to the rendered canvas', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture, squareFixture])
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()

  const canvas = page.locator('[data-layout-effective-preset] canvas').first()
  const canvasSize = () => canvas.evaluate((element) => {
    if (!(element instanceof HTMLCanvasElement)) throw new Error('Rendered element is not a canvas')
    return { width: element.width, height: element.height }
  })
  const before = await canvasSize()
  const borderSlider = page.locator('#border-width input')

  await borderSlider.press('End')
  await expect(borderSlider).toHaveAttribute('aria-valuenow', '50')
  await expect.poll(canvasSize).not.toEqual(before)
})

test('keeps the photo replacement action visible on loaded cards', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture])

  const changeAction = page.locator('[data-photo-change-affordance]')
  await expect(changeAction).toHaveCount(1)
  await expect(changeAction).toBeVisible()
  await expect(changeAction).toContainText('변경')
  await expect(changeAction).toHaveAttribute('title', '변경')

  const image = page.getByRole('img', { name: '이미지 미리보기 1' })
  const sourceBefore = await image.getAttribute('src')
  const fileChooserPromise = page.waitForEvent('filechooser')
  await changeAction.click()
  await (await fileChooserPromise).setFiles(squareFixture)
  await expect.poll(() => image.getAttribute('src')).not.toBe(sourceBefore)
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
})

test('replaces a photo from the canvas through the shared upload path', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture, squareFixture])

  const canvas = page.locator('[data-layout-effective-preset] canvas').last()
  const canvasBox = await canvas.boundingBox()
  if (!canvasBox) throw new Error('Canvas hit target is not measurable')

  const sourceBefore = await page.getByRole('img', { name: '이미지 미리보기 2' }).getAttribute('src')
  const fileChooserPromise = page.waitForEvent('filechooser')
  await canvas.dblclick({ position: { x: canvasBox.width * 0.75, y: canvasBox.height * 0.5 } })
  await (await fileChooserPromise).setFiles(wideFixture)

  await expect.poll(() => page.getByRole('img', { name: '이미지 미리보기 2' }).getAttribute('src')).not.toBe(sourceBefore)
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await expect(page.getByRole('button', { name: '이미지 선택 2', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('syncs the selected photo when its canvas image is clicked', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture, squareFixture])

  const canvas = page.locator('canvas').first()
  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  if (!canvasBox) return

  await page.mouse.click(canvasBox.x + canvasBox.width * 0.75, canvasBox.y + canvasBox.height * 0.5)
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await expect(page.getByRole('button', { name: '이미지 선택 2', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('offers a photo-count layout recommendation until the user chooses a layout', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture, squareFixture, wideFixture])
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()

  const recommendation = page.locator('[data-layout-recommendation]')
  await expect(recommendation).toBeVisible()
  await expect(recommendation).toContainText('3장의 사진에 잘 맞는 구성은 바둑판 배치입니다.')

  const gridButton = page.getByRole('button', { name: '바둑판 배치', exact: true })
  await expect(gridButton).not.toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: '바둑판 배치 적용', exact: true }).click()
  await expect(gridButton).toHaveAttribute('aria-pressed', 'true')
  await expect(recommendation).toHaveCount(0)
})

test('provides a safe path back to the landing page from the editor', async ({ page }) => {
  await openFreshEditor(page)

  const homeLink = page.getByRole('link', { name: '홈', exact: true })
  await expect(homeLink).toHaveAttribute('href', '/')
  await homeLink.click()
  await expect(page.getByRole('heading', { name: /스크린샷을.*한 장의 결과로/ })).toBeVisible()
})

test('confirms before leaving the editor when images are loaded', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture])

  let dialogMessage = ''
  page.once('dialog', async (dialog) => {
    dialogMessage = dialog.message()
    await dialog.dismiss()
  })
  await page.getByRole('link', { name: '홈', exact: true }).click()
  expect(dialogMessage).toContain('홈으로')
  await expect(page).toHaveURL(/\/ko$/)
})

test('renders mixed-aspect images in grid and soft-blend layouts', async ({ page }) => {
  const browserMessages: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      const location = message.location().url
      if (!isExternalFontRequest(`${location} ${message.text()}`)) {
        browserMessages.push(`${message.text()}${location ? ` (${location})` : ''}`)
      }
    }
  })
  page.on('requestfailed', (request) => {
    if (!isExternalFontRequest(request.url())) {
      browserMessages.push(`request failed: ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
    }
  })

  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture, squareFixture, wideFixture])

  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  const gridButton = page.getByRole('button', { name: '바둑판 배치', exact: true })
  await gridButton.click()
  await expect(gridButton).toHaveAttribute('aria-pressed', 'true')

  const blendButton = page.getByRole('button', { name: '자연스럽게', exact: true })
  await blendButton.click()
  await expect(blendButton).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('자연스러운 영역 너비', { exact: true })).toBeVisible()
  const renderedPixelCount = () => page.locator('canvas').evaluateAll((canvases) => canvases.reduce((maxPixels, canvas) => {
    const canvasElement = canvas as HTMLCanvasElement
    const context = canvasElement.getContext('2d')
    if (!context) return maxPixels
    const pixels = context.getImageData(0, 0, canvasElement.width, canvasElement.height).data
    let nonWhitePixels = 0
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] < 245 || pixels[index + 1] < 245 || pixels[index + 2] < 245) nonWhitePixels += 1
    }
    return Math.max(maxPixels, nonWhitePixels)
  }, 0))
  await expect.poll(renderedPixelCount).toBeGreaterThan(1000)
  expect(browserMessages, browserMessages.join('\n')).toEqual([])
})

test('keeps soft-blend image interaction after consolidating render layers', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture, squareFixture, wideFixture])

  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('button', { name: '바둑판 배치', exact: true }).click()
  await page.getByRole('button', { name: '자연스럽게', exact: true }).click()
  await expect.poll(() => page.locator('canvas').count()).toBeLessThanOrEqual(5)

  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await expect(page.getByText('0,0', { exact: true })).toBeVisible()
  const canvas = page.locator('canvas').first()
  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  if (!canvasBox) return

  const startX = canvasBox.x + canvasBox.width * 0.2
  const startY = canvasBox.y + canvasBox.height * 0.2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + 40, startY + 12, { steps: 5 })
  await page.mouse.up()

  await expect(page.getByText('0,0', { exact: true })).toBeHidden()
})

test('keeps the preview available when a later image fails to decode', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { failedStageLoads: 0, armed: false, blobAssignmentsAfterArm: 0 }
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
    const nativeSet = descriptor?.set
    if (!descriptor || !nativeSet) return

    let failed = false

    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get: descriptor.get,
      set(value: string) {
        if (!failed && state.armed && value.startsWith('blob:') && !this.parentElement) {
          state.blobAssignmentsAfterArm += 1
          // The first blob is the new file preparation. The next
          // blob is the new KonvaStage image, so fail that decode without
          // depending on React's intermediate render count.
          if (state.blobAssignmentsAfterArm >= 2) {
            failed = true
            state.failedStageLoads += 1
            window.setTimeout(() => {
              nativeSet.call(this, '')
              this.dispatchEvent(new Event('error'))
            }, 0)
            return
          }
        }
        nativeSet.call(this, value)
      },
    })
    Object.defineProperty(window, '__xivFrameDecodeFailureState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await page.locator('input[type="file"]').first().setInputFiles([wideFixture, squareFixture])
  await expect(page.getByText('02 / 16', { exact: true })).toBeVisible()

  const renderedPixelCount = () => page.locator('canvas').evaluateAll((canvases) => canvases.reduce((maxPixels, canvas) => {
    const canvasElement = canvas as HTMLCanvasElement
    const context = canvasElement.getContext('2d')
    if (!context) return maxPixels
    const pixels = context.getImageData(0, 0, canvasElement.width, canvasElement.height).data
    let nonWhitePixels = 0
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] < 245 || pixels[index + 1] < 245 || pixels[index + 2] < 245) nonWhitePixels += 1
    }
    return Math.max(maxPixels, nonWhitePixels)
  }, 0))

  await expect.poll(renderedPixelCount).toBeGreaterThan(1000)
  await page.evaluate(() => {
    const state = (window as Window & { __xivFrameDecodeFailureState?: { armed: boolean } }).__xivFrameDecodeFailureState
    if (state) state.armed = true
  })

  await page.locator('input[type="file"]').first().setInputFiles(wideFixture)
  await expect(page.getByText('03 / 16', { exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => (
    window as Window & { __xivFrameDecodeFailureState?: { failedStageLoads: number } }
  ).__xivFrameDecodeFailureState?.failedStageLoads ?? 0)).toBeGreaterThan(0)

  await expect(page.getByRole('alert').filter({ hasText: '이미지를 읽거나 최적화하지 못했습니다.' }).first()).toBeVisible()
  await page.waitForTimeout(250)
  await expect.poll(renderedPixelCount).toBeGreaterThan(1000)
})

test('supports pointer dragging and image scaling for the selected image', async ({ page }) => {
  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture, squareFixture])

  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('button', { name: '가로 분할', exact: true }).click()
  await page.getByRole('button', { name: '없음', exact: true }).click()
  await page.getByRole('tab', { name: '01 사진 소스' }).click()

  await expect(page.getByText('0,0', { exact: true })).toBeVisible()
  const canvas = page.locator('canvas').first()
  const canvasBox = await canvas.boundingBox()
  expect(canvasBox).not.toBeNull()
  if (!canvasBox) return

  const startX = canvasBox.x + canvasBox.width * 0.25
  const startY = canvasBox.y + canvasBox.height * 0.5
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + 40, startY, { steps: 5 })
  await page.mouse.up()

  await expect(page.getByText('0,0', { exact: true })).toBeHidden()

  const scaleInput = page.getByRole('spinbutton', { name: '이미지 1 크기', exact: true })
  await scaleInput.fill('120')
  await scaleInput.press('Enter')
  await expect(page.getByText('120%', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '저장 PNG', exact: true })).toBeEnabled()
})

test('does not restore an upload that finishes after reset', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { abortedBlobLoads: 0 }
    const loadingImages = new WeakSet<HTMLImageElement>()
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
    const nativeSet = descriptor?.set
    if (!descriptor || !nativeSet) return

    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get: descriptor.get,
      set(value: string) {
        if (value.startsWith('blob:')) {
          loadingImages.add(this)
          window.setTimeout(() => nativeSet.call(this, value), 250)
          return
        }
        if (value === '' && loadingImages.has(this)) state.abortedBlobLoads += 1
        nativeSet.call(this, value)
      },
    })
    Object.defineProperty(window, '__xivFrameUploadState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await page.locator('input[type="file"]').first().setInputFiles(wideFixture)
  await page.getByLabel('초기화').click()

  const emptyCount = page.getByText('00 / 16', { exact: true })
  await expect(emptyCount).toBeVisible()
  await expect.poll(() => page.evaluate(() => (window as Window & { __xivFrameUploadState?: { abortedBlobLoads: number } }).__xivFrameUploadState?.abortedBlobLoads ?? 0)).toBeGreaterThan(0)
  await page.waitForTimeout(400)
  await expect(emptyCount).toBeVisible()
})

test('cancels a pending canvas image decode when reset removes the image', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { abortedCanvasLoads: 0 }
    const blobLoadCounts = new Map<string, number>()
    const delayedImages = new WeakSet<HTMLImageElement>()
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
    const nativeSet = descriptor?.set
    if (!descriptor || !nativeSet) return

    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get: descriptor.get,
      set(value: string) {
        if (value.startsWith('blob:')) {
          const count = (blobLoadCounts.get(value) ?? 0) + 1
          blobLoadCounts.set(value, count)
          if (count >= 2) {
            delayedImages.add(this)
            window.setTimeout(() => nativeSet.call(this, value), 250)
            return
          }
        }
        if (value === '' && delayedImages.has(this)) state.abortedCanvasLoads += 1
        nativeSet.call(this, value)
      },
    })
    Object.defineProperty(window, '__xivFrameCanvasImageState', {
      configurable: true,
      value: state,
    })
  })
  page.on('dialog', (dialog) => void dialog.accept())

  await openFreshEditor(page)
  await page.locator('input[type="file"]').first().setInputFiles(wideFixture)
  await expect(page.getByText('01 / 16', { exact: true })).toBeVisible()
  await page.getByLabel('초기화').click()

  await expect(page.getByText('00 / 16', { exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => (
    window as Window & { __xivFrameCanvasImageState?: { abortedCanvasLoads: number } }
  ).__xivFrameCanvasImageState?.abortedCanvasLoads ?? 0)).toBeGreaterThan(0)
})

test('cancels a slot upload that is replaced by reset', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { abortedBlobLoads: 0 }
    const loadingImages = new WeakSet<HTMLImageElement>()
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
    const nativeSet = descriptor?.set
    if (!descriptor || !nativeSet) return

    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get: descriptor.get,
      set(value: string) {
        if (value.startsWith('blob:')) {
          loadingImages.add(this)
          window.setTimeout(() => nativeSet.call(this, value), 250)
          return
        }
        if (value === '' && loadingImages.has(this)) state.abortedBlobLoads += 1
        nativeSet.call(this, value)
      },
    })
    Object.defineProperty(window, '__xivFrameSlotUploadState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: '이미지 1', exact: true }).click()
  await (await fileChooserPromise).setFiles(wideFixture)
  await page.getByLabel('초기화').click()

  await expect.poll(() => page.evaluate(() => (window as Window & { __xivFrameSlotUploadState?: { abortedBlobLoads: number } }).__xivFrameSlotUploadState?.abortedBlobLoads ?? 0)).toBeGreaterThan(0)
  await expect(page.getByText('00 / 16', { exact: true })).toBeVisible()
})

test('cancels a character upload that finishes after reset', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { abortedBlobLoads: 0 }
    const loadingImages = new WeakSet<HTMLImageElement>()
    const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
    const nativeSet = descriptor?.set
    if (!descriptor || !nativeSet) return

    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      get: descriptor.get,
      set(value: string) {
        if (value.startsWith('blob:')) {
          loadingImages.add(this)
          window.setTimeout(() => nativeSet.call(this, value), 250)
          return
        }
        if (value === '' && loadingImages.has(this)) state.abortedBlobLoads += 1
        nativeSet.call(this, value)
      },
    })
    Object.defineProperty(window, '__xivFrameCharacterUploadState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await page.getByRole('tab', { name: '합성', exact: true }).click()
  await page.locator('#character-file-input').setInputFiles(wideFixture)
  await page.getByLabel('초기화').click()

  await expect.poll(() => page.evaluate(() => (window as Window & { __xivFrameCharacterUploadState?: { abortedBlobLoads: number } }).__xivFrameCharacterUploadState?.abortedBlobLoads ?? 0)).toBeGreaterThan(0)
  await expect(page.getByRole('button', { name: '합성 이미지 추가', exact: true })).toBeVisible()
})

test('keeps the character source usable when its settings panel remounts', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await page.getByRole('tab', { name: '합성', exact: true }).click()
  await page.locator('#character-file-input').setInputFiles(wideFixture)

  const originalImage = page.getByRole('img', { name: '원본', exact: true })
  await expect(originalImage).toBeVisible()
  await expect.poll(() => originalImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)

  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await page.getByRole('tab', { name: '합성', exact: true }).click()

  const remountedImage = page.getByRole('img', { name: '원본', exact: true })
  await expect(remountedImage).toBeVisible()
  await expect.poll(() => remountedImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
})

test('explains an invalid logo file without replacing the current logo', async ({ page }) => {
  await openFreshEditor(page)
  await page.getByRole('tab', { name: '03 시그니처 오버레이' }).click()
  await page.getByRole('tab', { name: '로고 업로드', exact: true }).click()
  await page.locator('#logo-file-input').setInputFiles(squareFixture)
  await expect(page.getByRole('button', { name: '로고 삭제', exact: true })).toBeVisible()

  await page.locator('#logo-file-input').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  })

  await expect(page.locator('p[role="alert"]')).toContainText('이미지 파일만 로고로 추가할 수 있습니다.')
  await expect(page.getByRole('button', { name: '로고 삭제', exact: true })).toBeVisible()
})

test('defers background-removal worker loading until explicit removal and disposes it after idle', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { terminateCount: 0 }
    const nativeSetTimeout = window.setTimeout.bind(window) as (handler: TimerHandler, timeout?: number, ...args: unknown[]) => number

    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => nativeSetTimeout(
      handler,
      timeout === 30_000 ? 25 : timeout,
      ...args,
    )) as typeof window.setTimeout

    class ControlledWorker {
      private listeners = new Map<string, Set<(event: unknown) => void>>()

      addEventListener(type: string, listener: (event: unknown) => void) {
        const listeners = this.listeners.get(type) ?? new Set()
        listeners.add(listener)
        this.listeners.set(type, listeners)
      }

      postMessage(message: { type: string; requestId: number }) {
        const listeners = this.listeners.get('message') ?? new Set()
        if (message.type === 'warmup') {
          listeners.forEach((listener) => listener({ data: { type: 'ready', requestId: message.requestId } }))
          return
        }
        if (message.type === 'remove') {
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
      }

      terminate() {
        state.terminateCount += 1
      }
    }

    Object.defineProperty(window, 'Worker', {
      configurable: true,
      writable: true,
      value: ControlledWorker,
    })
    Object.defineProperty(window, '__xivFrameWorkerState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await page.getByRole('tab', { name: '합성', exact: true }).click()
  await page.locator('#character-file-input').setInputFiles(wideFixture)

  const removeButton = page.getByRole('button', { name: '배경 제거', exact: true })
  await expect(removeButton).toBeEnabled({ timeout: 10_000 })
  await page.waitForTimeout(100)
  expect(await page.evaluate(() => (window as Window & { __xivFrameWorkerState?: { terminateCount: number } }).__xivFrameWorkerState?.terminateCount ?? 0)).toBe(0)

  await removeButton.click()
  await expect.poll(() => page.evaluate(() => (window as Window & { __xivFrameWorkerState?: { terminateCount: number } }).__xivFrameWorkerState?.terminateCount ?? 0), { timeout: 2_000 }).toBeGreaterThan(0)
})

test('does not restore a logo upload that finishes after reset', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeReadAsDataUrl = FileReader.prototype.readAsDataURL
    FileReader.prototype.readAsDataURL = function (this: FileReader, blob: Blob) {
      window.setTimeout(() => nativeReadAsDataUrl.call(this, blob), 250)
    }
  })

  await openFreshEditor(page)
  await page.getByRole('tab', { name: '03 시그니처 오버레이' }).click()
  await page.getByRole('tab', { name: '로고 업로드', exact: true }).click()
  await page.locator('#logo-file-input').setInputFiles(squareFixture)
  await page.getByRole('button', { name: '초기화', exact: true }).click()

  await page.waitForTimeout(400)
  await expect(page.locator('#logo-file-input')).toHaveCount(1)
})

test('does not download an export that finishes after reset', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeToBlob = HTMLCanvasElement.prototype.toBlob
    HTMLCanvasElement.prototype.toBlob = function (this: HTMLCanvasElement, callback: BlobCallback, type?: string, quality?: number) {
      window.setTimeout(() => nativeToBlob.call(this, callback, type, quality), 250)
    }
  })

  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture])
  page.on('dialog', (dialog) => void dialog.accept())

  const downloadPromise = page.waitForEvent('download', { timeout: 1_000 }).catch(() => null)
  await page.getByRole('button', { name: '저장 PNG', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: '저장 중' })).toBeVisible()
  await page.getByLabel('초기화').click()
  const canvasFrame = page.locator('[data-layout-effective-preset]')
  await expect(canvasFrame).toBeVisible()
  await expect(canvasFrame).toHaveAttribute('data-layout-image-count', '0')
  await expect(canvasFrame).toHaveAttribute('data-layout-empty-slot-count', /^[1-9]/)

  expect(await downloadPromise).toBeNull()
})

test('offers a retry after an export rendering failure', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeToBlob = HTMLCanvasElement.prototype.toBlob
    let failNextPng = true
    HTMLCanvasElement.prototype.toBlob = function (this: HTMLCanvasElement, callback: BlobCallback, type?: string, quality?: number) {
      if (type === 'image/png' && failNextPng) {
        failNextPng = false
        throw new Error('simulated export rendering failure')
      }
      nativeToBlob.call(this, callback, type, quality)
    }
  })

  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture])

  await page.getByRole('button', { name: '저장 PNG', exact: true }).click()
  const alert = page.locator('header.app-header [role="alert"]')
  await expect(alert).toContainText('이미지 저장에 실패했습니다.')
  await expect(page.getByRole('button', { name: 'PNG 저장 다시 시도', exact: true })).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'PNG 저장 다시 시도', exact: true }).click()
  await expect(downloadPromise).resolves.toBeTruthy()
})

test('keeps a lossless PNG when it already fits the X upload limit', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { pngCalls: 0, jpegCalls: 0 }
    const nativeToBlob = HTMLCanvasElement.prototype.toBlob
    HTMLCanvasElement.prototype.toBlob = function (this: HTMLCanvasElement, callback: BlobCallback, type?: string, quality?: number) {
      if (type === 'image/png') {
        state.pngCalls += 1
        window.setTimeout(() => callback(new Blob([new Uint8Array(4_900_000)], { type })), 0)
        return
      }

      if (type === 'image/jpeg') {
        state.jpegCalls += 1
        window.setTimeout(() => callback(new Blob([new Uint8Array(1_000_000)], { type })), 0)
        return
      }

      nativeToBlob.call(this, callback, type, quality)
    }
    Object.defineProperty(window, '__xivFrameExportState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture])

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '저장 PNG', exact: true }).click()
  const download = await downloadPromise
  const downloadPath = await download.path()
  if (!downloadPath) throw new Error('The PNG download path was not available')

  expect(download.suggestedFilename()).toMatch(/\.png$/)
  expect(statSync(downloadPath).size).toBeLessThanOrEqual(5_000_000)
  expect(await page.evaluate(() => (window as Window & { __xivFrameExportState?: { pngCalls: number; jpegCalls: number } }).__xivFrameExportState)).toEqual({ pngCalls: 1, jpegCalls: 0 })
})

test('falls back to a high-quality JPEG when a PNG exceeds the X upload limit', async ({ page }) => {
  await page.addInitScript(() => {
    const state: { calls: Array<{ type: string; quality: number | null; size: number }> } = { calls: [] }
    HTMLCanvasElement.prototype.toBlob = function (this: HTMLCanvasElement, callback: BlobCallback, type?: string, quality?: number) {
      const mimeType = type ?? ''
      const size = mimeType === 'image/png'
        ? 5_100_000
        : mimeType === 'image/jpeg' && typeof quality === 'number' && quality >= 0.9
          ? 5_100_001
          : mimeType === 'image/jpeg'
            ? 4_900_000
            : 1_000
      const blob = new Blob([new Uint8Array(size)], { type: mimeType })
      state.calls.push({ type: mimeType, quality: typeof quality === 'number' ? quality : null, size: blob.size })
      window.setTimeout(() => callback(blob), 0)
    }
    Object.defineProperty(window, '__xivFrameExportState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture])

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '저장 PNG', exact: true }).click()
  const download = await downloadPromise
  const downloadPath = await download.path()
  if (!downloadPath) throw new Error('The optimized download path was not available')

  const state = await page.evaluate(() => (window as Window & { __xivFrameExportState?: { calls: Array<{ type: string; quality: number | null; size: number }> } }).__xivFrameExportState)
  const jpegCalls = state?.calls.filter((call) => call.type === 'image/jpeg') ?? []
  expect(download.suggestedFilename()).toMatch(/\.jpg$/)
  expect(statSync(downloadPath).size).toBeLessThanOrEqual(5_000_000)
  expect(jpegCalls.length).toBeGreaterThan(1)
  expect(jpegCalls.some((call) => typeof call.quality === 'number' && call.quality < 0.92)).toBe(true)
  await expect(page.getByRole('status').filter({ hasText: '5MB' })).toBeVisible()
})

test('keeps a transparent export as PNG and reduces its dimensions when needed', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { pngCalls: 0, jpegCalls: 0 }
    HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback, type?: string) {
      if (type === 'image/png') {
        state.pngCalls += 1
        const size = state.pngCalls === 1 ? 5_100_000 : 4_900_000
        window.setTimeout(() => callback(new Blob([new Uint8Array(size)], { type })), 0)
        return
      }

      if (type === 'image/jpeg') {
        state.jpegCalls += 1
        window.setTimeout(() => callback(new Blob([new Uint8Array(1_000_000)], { type })), 0)
        return
      }

      window.setTimeout(() => callback(new Blob([new Uint8Array(1_000)], { type })), 0)
    }
    Object.defineProperty(window, '__xivFrameExportState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture])
  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await page.getByRole('button', { name: '투명', exact: true }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '저장 PNG', exact: true }).click()
  const download = await downloadPromise
  const downloadPath = await download.path()
  if (!downloadPath) throw new Error('The transparent PNG download path was not available')

  expect(download.suggestedFilename()).toMatch(/\.png$/)
  expect(statSync(downloadPath).size).toBeLessThanOrEqual(5_000_000)
  expect(await page.evaluate(() => (window as Window & { __xivFrameExportState?: { pngCalls: number; jpegCalls: number } }).__xivFrameExportState)).toEqual({ pngCalls: 2, jpegCalls: 0 })
})

test('serializes export work after reset before starting a new export', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { active: 0, peak: 0, calls: 0 }
    const nativeToBlob = HTMLCanvasElement.prototype.toBlob
    HTMLCanvasElement.prototype.toBlob = function (this: HTMLCanvasElement, callback: BlobCallback, type?: string, quality?: number) {
      state.calls += 1
      state.active += 1
      state.peak = Math.max(state.peak, state.active)
      window.setTimeout(() => {
        state.active -= 1
        nativeToBlob.call(this, callback, type, quality)
      }, 1_000)
    }
    Object.defineProperty(window, '__xivFrameExportState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await uploadFixtures(page, [wideFixture])
  page.on('dialog', (dialog) => void dialog.accept())

  await page.getByRole('button', { name: '저장 PNG', exact: true }).click()
  await expect.poll(() => page.evaluate(() => (window as Window & { __xivFrameExportState?: { calls: number } }).__xivFrameExportState?.calls ?? 0)).toBeGreaterThan(0)
  await page.getByLabel('초기화').click()
  await uploadFixtures(page, [wideFixture])

  const secondDownloadPromise = page.waitForEvent('download', { timeout: 3_000 }).catch(() => null)
  await page.getByRole('button', { name: '저장 PNG', exact: true }).click()
  expect(await secondDownloadPromise).not.toBeNull()
  await expect.poll(() => page.evaluate(() => (window as Window & { __xivFrameExportState?: { peak: number } }).__xivFrameExportState?.peak ?? 0)).toBe(1)
})

test('terminates background-removal worker when reset interrupts processing', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { terminateCount: 0 }

    class ControlledWorker {
      private listeners = new Map<string, Set<(event: unknown) => void>>()

      addEventListener(type: string, listener: (event: unknown) => void) {
        const listeners = this.listeners.get(type) ?? new Set()
        listeners.add(listener)
        this.listeners.set(type, listeners)
      }

      postMessage(message: { type: string; requestId: number }) {
        if (message.type !== 'warmup') return
        const listeners = this.listeners.get('message') ?? new Set()
        listeners.forEach((listener) => listener({ data: { type: 'ready', requestId: message.requestId } }))
      }

      terminate() {
        state.terminateCount += 1
      }
    }

    Object.defineProperty(window, 'Worker', {
      configurable: true,
      writable: true,
      value: ControlledWorker,
    })
    Object.defineProperty(window, '__xivFrameWorkerState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await page.getByRole('tab', { name: '합성', exact: true }).click()
  await page.locator('#character-file-input').setInputFiles(wideFixture)
  const removeButton = page.getByRole('button', { name: '배경 제거', exact: true })
  await expect(removeButton).toBeEnabled({ timeout: 10_000 })
  await removeButton.click()
  await expect(page.getByRole('progressbar', { name: '처리 중' })).toBeVisible()

  await page.getByRole('button', { name: '초기화', exact: true }).click()
  await expect(page.getByRole('button', { name: '합성 이미지 추가', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => (window as Window & { __xivFrameWorkerState?: { terminateCount: number } }).__xivFrameWorkerState?.terminateCount ?? 0)).toBeGreaterThan(0)
})

test('terminates background-removal worker when a new character replaces processing', async ({ page }) => {
  await page.addInitScript(() => {
    const state = { terminateCount: 0 }

    class ControlledWorker {
      private listeners = new Map<string, Set<(event: unknown) => void>>()

      addEventListener(type: string, listener: (event: unknown) => void) {
        const listeners = this.listeners.get(type) ?? new Set()
        listeners.add(listener)
        this.listeners.set(type, listeners)
      }

      postMessage(message: { type: string; requestId: number }) {
        if (message.type !== 'warmup') return
        const listeners = this.listeners.get('message') ?? new Set()
        listeners.forEach((listener) => listener({ data: { type: 'ready', requestId: message.requestId } }))
      }

      terminate() {
        state.terminateCount += 1
      }
    }

    Object.defineProperty(window, 'Worker', {
      configurable: true,
      writable: true,
      value: ControlledWorker,
    })
    Object.defineProperty(window, '__xivFrameWorkerState', {
      configurable: true,
      value: state,
    })
  })

  await openFreshEditor(page)
  await page.getByRole('tab', { name: '01 사진 소스' }).click()
  await page.getByRole('tab', { name: '합성', exact: true }).click()
  await page.locator('#character-file-input').setInputFiles(wideFixture)
  const removeButton = page.getByRole('button', { name: '배경 제거', exact: true })
  await expect(removeButton).toBeEnabled({ timeout: 10_000 })
  await removeButton.click()
  await expect(page.getByRole('progressbar', { name: '처리 중' })).toBeVisible()

  await page.locator('#character-file-input').setInputFiles(squareFixture)
  await expect.poll(() => page.evaluate(() => (window as Window & { __xivFrameWorkerState?: { terminateCount: number } }).__xivFrameWorkerState?.terminateCount ?? 0)).toBeGreaterThan(0)
})

test('persists logo and layout settings across a reload', async ({ page }) => {
  await openFreshEditor(page, { clearStorage: false })

  const layoutTab = page.getByRole('tab', { name: '02 레이아웃 구성' })
  await layoutTab.click()
  const verticalButton = page.getByRole('button', { name: '세로 분할', exact: true })
  await verticalButton.click()
  await expect(verticalButton).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('tab', { name: '03 시그니처 오버레이' }).click()
  await page.getByRole('tab', { name: '로고 업로드', exact: true }).click()
  await page.locator('#logo-file-input').setInputFiles(squareFixture)
  await expect(page.getByRole('button', { name: '로고 삭제', exact: true })).toBeVisible()

  const persistedStorage = await page.evaluate(() => ({
    settings: localStorage.getItem('xiv-frame-settings-v2'),
    logo: localStorage.getItem('xiv-frame-logo-v1'),
  }))
  const persistedSettings = persistedStorage.settings ? JSON.parse(persistedStorage.settings) as { state?: Record<string, unknown> } : null
  expect(persistedSettings?.state?.logoUrl).toBeUndefined()
  expect(persistedStorage.logo).toMatch(/^data:image\//)

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Your frame, in focus.' })).toBeVisible()

  await page.getByRole('tab', { name: '02 레이아웃 구성' }).click()
  await expect(page.getByRole('button', { name: '세로 분할', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('tab', { name: '03 시그니처 오버레이' }).click()
  await page.getByRole('tab', { name: '로고 업로드', exact: true }).click()
  await expect(page.getByRole('button', { name: '로고 삭제', exact: true })).toBeVisible()
})

test('mounts the mobile editor below the responsive breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openFreshEditor(page, { expectDesktop: false })

  await expect(page.getByRole('heading', { name: 'Your frame, in focus.' })).toBeHidden()
  await expect(page.getByRole('button', { name: '저장', exact: true })).toBeVisible()

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Your frame, in focus.' })).toBeVisible()
})

test('preserves one editor shell per responsive breakpoint', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openFreshEditor(page)

  await expect(page.locator('header.app-header')).toHaveCount(1)
  await expect(page.getByRole('complementary')).toHaveCount(1)
  await expect(page.locator('canvas').first()).toBeVisible()
  await expect(page.getByRole('button', { name: '저장 PNG', exact: true })).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('header.app-header')).toHaveCount(1)
  await expect(page.getByRole('complementary')).toHaveCount(0)
  await expect(page.locator('nav[aria-label="모바일 편집 도구"]')).toHaveCount(1)
  await expect(page.getByRole('button', { name: '저장', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '저장 PNG', exact: true })).toHaveCount(0)
})
