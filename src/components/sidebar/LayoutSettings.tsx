import { useEffect, useMemo, useRef, useState } from 'react'
import { Blend, Check, Circle, Heart, Sparkles, Square, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { EditorChoice, EditorFieldHeader, EditorSection } from '@/components/ui/editor'
import {
  getLayoutGeometry,
  getLayoutGeometryImageCount,
  getLayoutPreviewGeometry,
  getRecommendedLayoutPreset,
  LAYOUT_TEMPLATE_GROUPS,
  LAYOUT_TEMPLATE_OPTIONS,
  type LayoutTemplateGroup,
  type LayoutTemplateOption,
} from '@/lib/layoutTemplates'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { settleWithConcurrency } from '@/lib/asyncPool'
import { revokeObjectUrl } from '@/lib/imageUpload'
import { useStore, type BackgroundColor } from '@/store/useStore'

const LAYOUT_PREVIEW_THUMBNAIL_SIZE = 320

function loadLayoutPreviewImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load layout preview image'))
    image.src = source
  })
}

function canvasToLayoutPreviewBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((webpBlob) => {
      if (webpBlob) {
        resolve(webpBlob)
        return
      }

      canvas.toBlob((pngBlob) => {
        if (pngBlob) resolve(pngBlob)
        else reject(new Error('Failed to create layout preview thumbnail'))
      }, 'image/png')
    }, 'image/webp', 0.82)
  })
}

async function createLayoutPreviewThumbnail(source: string) {
  const image = await loadLayoutPreviewImage(source)
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  if (!sourceWidth || !sourceHeight) throw new Error('Layout preview image has no dimensions')

  const scale = Math.min(1, LAYOUT_PREVIEW_THUMBNAIL_SIZE / Math.max(sourceWidth, sourceHeight))
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Failed to create layout preview canvas')

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, width, height)
  const blob = await canvasToLayoutPreviewBlob(canvas)
  return URL.createObjectURL(blob)
}

function useLayoutPreviewThumbnails(sources: readonly string[]) {
  const thumbnailCacheRef = useRef(new Map<string, string>())
  const activeSourcesRef = useRef(new Set<string>())
  const mountedRef = useRef(false)
  const [thumbnailMap, setThumbnailMap] = useState<Record<string, string>>({})
  const sourceKey = sources.join('\u0001')

  useEffect(() => {
    mountedRef.current = true
    const cache = thumbnailCacheRef.current
    return () => {
      mountedRef.current = false
      cache.forEach(revokeObjectUrl)
      cache.clear()
    }
  }, [])

  useEffect(() => {
    const cache = thumbnailCacheRef.current
    const activeSources = new Set(sources)
    activeSourcesRef.current = activeSources

    let pruned = false
    cache.forEach((thumbnail, source) => {
      if (!activeSources.has(source)) {
        revokeObjectUrl(thumbnail)
        cache.delete(source)
        pruned = true
      }
    })
    if (pruned) {
      setThumbnailMap((current) => {
        const next = { ...current }
        Object.keys(next).forEach((source) => {
          if (!activeSources.has(source)) delete next[source]
        })
        return next
      })
    }

    const missingSources = sources.filter((source) => !cache.has(source))
    if (missingSources.length === 0) return

    void settleWithConcurrency(missingSources, createLayoutPreviewThumbnail, 2).then((results) => {
      const additions: [string, string][] = []
      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') return
        const source = missingSources[index]
        if (!mountedRef.current || !activeSourcesRef.current.has(source)) {
          revokeObjectUrl(result.value)
          return
        }
        if (cache.has(source)) {
          revokeObjectUrl(result.value)
          return
        }
        cache.set(source, result.value)
        additions.push([source, result.value])
      })

      if (additions.length > 0 && mountedRef.current) {
        setThumbnailMap((current) => {
          const next = { ...current }
          additions.forEach(([source, thumbnail]) => { next[source] = thumbnail })
          return next
        })
      }
    })
  }, [sourceKey, sources])

  return sources.map((source) => thumbnailMap[source])
}

export function LayoutSettings() {
  const {
    layoutPreset,
    hasChosenLayout,
    setLayoutPreset,
    imageTransition,
    setImageTransition,
    imageGap,
    setImageGap,
    canvasRatio,
    imageShape,
    setImageShape,
    blendWidth,
    setBlendWidth,
    borderWidth,
    setBorderWidth,
    grainIntensity,
    setGrainIntensity,
    backgroundColor,
    setBackgroundColor,
    customBackgroundColor,
    setCustomBackgroundColor,
    images,
  } = useStore(useShallow(state => ({
    layoutPreset: state.layoutPreset,
    hasChosenLayout: state.hasChosenLayout,
    setLayoutPreset: state.setLayoutPreset,
    imageTransition: state.imageTransition,
    setImageTransition: state.setImageTransition,
    imageGap: state.imageGap,
    setImageGap: state.setImageGap,
    canvasRatio: state.canvasRatio,
    imageShape: state.imageShape,
    setImageShape: state.setImageShape,
    blendWidth: state.blendWidth,
    setBlendWidth: state.setBlendWidth,
    borderWidth: state.borderWidth,
    setBorderWidth: state.setBorderWidth,
    grainIntensity: state.grainIntensity,
    setGrainIntensity: state.setGrainIntensity,
    backgroundColor: state.backgroundColor,
    setBackgroundColor: state.setBackgroundColor,
    customBackgroundColor: state.customBackgroundColor,
    setCustomBackgroundColor: state.setCustomBackgroundColor,
    images: state.images,
  })))

  const t = useTranslations('LayoutSettings')
  const imageCount = images.filter(Boolean).length
  const recommendedPreset = getRecommendedLayoutPreset(imageCount)
  const recommendedTemplate = recommendedPreset
    ? LAYOUT_TEMPLATE_OPTIONS.find((option) => option.id === recommendedPreset)
    : undefined
  const selectedTemplate = LAYOUT_TEMPLATE_OPTIONS.find((option) => option.id === layoutPreset)
  const [layoutFilter, setLayoutFilter] = useState<LayoutFilter | null>(null)
  const hasTemplateOverflow = Boolean(selectedTemplate && imageCount > selectedTemplate.maxImages)
  const previewImages = useMemo(() => images.filter(Boolean), [images])
  const previewThumbnails = useLayoutPreviewThumbnails(previewImages)
  const currentPreviewImageCount = getLayoutGeometryImageCount(layoutPreset, imageCount, hasChosenLayout)
  const currentPreviewSlotCount = selectedTemplate
    ? getLayoutGeometry(selectedTemplate.id, currentPreviewImageCount).cells.length
    : 0
  const filterOptions: LayoutFilterOption[] = [
    { value: 'all', label: t('filterAll'), groups: LAYOUT_TEMPLATE_GROUPS },
    { value: 'basic', label: t('filterBasic'), groups: ['two'] },
    { value: 'focus', label: t('filterFocus'), groups: ['three', 'four'] },
    { value: 'matrix', label: t('filterMatrix'), groups: ['matrix'] },
  ]
  const activeFilterValue = layoutFilter ?? 'all'
  const activeFilter = filterOptions.find((option) => option.value === activeFilterValue) ?? filterOptions[0]
  const visibleGroups = activeFilter.groups
  const safeCustomBackgroundColor = getSafeCustomBackgroundColor(customBackgroundColor)
  const backgroundOptions: BackgroundOption[] = [
    { value: 'white', label: t('bgWhite'), swatch: '#ffffff' },
    { value: 'black', label: t('bgBlack'), swatch: '#171918' },
    { value: 'light-gray', label: t('bgLightGray'), swatch: '#f1f5f9' },
    { value: 'transparent', label: t('bgTransparent'), swatch: 'transparent' },
    { value: 'custom', label: t('bgCustom'), swatch: safeCustomBackgroundColor },
  ]
  const selectedBackground = backgroundOptions.find((option) => option.value === backgroundColor) ?? backgroundOptions[0]
  const canChooseImageShape = canvasRatio === '2:1' && imageCount === 1
  const imageShapeOptions = [
    { value: 'rectangle' as const, label: t('imageShapeRectangle'), Icon: Square },
    { value: 'circle' as const, label: t('imageShapeCircle'), Icon: Circle },
    { value: 'heart' as const, label: t('imageShapeHeart'), Icon: Heart },
    { value: 'star' as const, label: t('imageShapeStar'), Icon: Star },
  ]

  return (
    <div className="space-y-6">
      <EditorSection title={t('compositionTitle')}>
        {selectedTemplate && (
          <div data-layout-current-preview className="editor-control-surface overflow-hidden p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="editor-meta">{t('currentLayout')}</p>
                <div className="mt-1 flex min-w-0 items-center gap-2">
                  <h4 className="truncate text-sm font-semibold text-foreground">{t(selectedTemplate.labelKey)}</h4>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-accent/55 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground">
                    <Check className="size-3" aria-hidden="true" />
                    {t(hasChosenLayout ? 'selectedShort' : 'defaultShort')}
                  </span>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-border bg-surface-inset/70 px-2 py-1 font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
                {t('templateSlotCount', { count: currentPreviewSlotCount })}
              </span>
            </div>

            <div className="mt-3 overflow-hidden rounded-md border border-border bg-muted/35 p-2">
              <LayoutTemplatePreview
                option={selectedTemplate}
                variant="hero"
                images={previewThumbnails}
                imageCount={currentPreviewImageCount}
              />
            </div>
          </div>
        )}

        {recommendedTemplate && !hasChosenLayout && (
          <div
            role="status"
            aria-label={t('recommendationEyebrow')}
            data-layout-recommendation
            className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-accent/45 p-3"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 space-y-1">
                <p className="editor-meta">{t('recommendationEyebrow')}</p>
                <p className="text-xs font-semibold leading-4 text-foreground">
                  {t('recommendationDescription', { count: imageCount, layout: t(recommendedTemplate.labelKey) })}
                </p>
              </div>
            </div>
            <EditorChoice
              aria-label={t('recommendationApply', { layout: t(recommendedTemplate.labelKey) })}
              onClick={() => setLayoutPreset(recommendedTemplate.id)}
              className="h-9 shrink-0 px-2.5 text-[11px]"
            >
              {t('recommendationApply', { layout: t(recommendedTemplate.labelKey) })}
            </EditorChoice>
          </div>
        )}
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="editor-meta">{t('chooseLayout')}</p>
            </div>
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
              {LAYOUT_TEMPLATE_OPTIONS.length} {t('templateCountSuffix')}
            </span>
          </div>

          <div role="group" aria-label={t('filterLabel')} className="grid grid-cols-4 gap-1 rounded-lg border border-border bg-muted/55 p-1">
            {filterOptions.map((option) => (
              <EditorChoice
                key={option.value}
                active={activeFilterValue === option.value}
                onClick={() => setLayoutFilter(option.value)}
                aria-label={option.label}
                data-layout-filter={option.value}
                className="min-h-9 min-w-0 flex-col gap-0.5 rounded-md px-1.5 py-1 text-[10px] leading-3"
              >
                <span className="truncate">{option.label}</span>
                <span className="font-mono text-[9px] font-medium tabular-nums opacity-65">
                  {option.groups.reduce((total, group) => total + LAYOUT_TEMPLATE_OPTIONS.filter((template) => template.group === group).length, 0)}
                </span>
              </EditorChoice>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {visibleGroups.map((group) => {
            const options = LAYOUT_TEMPLATE_OPTIONS.filter((option) => option.group === group)

            return (
              <div key={group} className="space-y-2">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <span className="editor-meta min-w-0 truncate">{t(GROUP_LABEL_KEYS[group])}</span>
                  <span className="min-w-0 truncate font-body text-[11px] text-muted-foreground">{t(GROUP_HINT_KEYS[group])}</span>
                </div>
                <div role="group" aria-label={t(GROUP_LABEL_KEYS[group])} className="grid grid-cols-2 gap-2">
                  {options.map((option) => {
                    const requirement = getTemplateRequirement(t, option, imageCount)

                    return (
                      <EditorChoice
                        key={option.id}
                        active={layoutPreset === option.id}
                        onClick={() => setLayoutPreset(option.id)}
                        aria-label={`${t(option.labelKey)}${requirement ? `, ${requirement}` : ''}`}
                        title={requirement || undefined}
                        data-layout-template-card="true"
                        className="group h-auto min-h-[150px] w-full min-w-0 flex-col items-stretch justify-start gap-2 overflow-hidden p-2.5 text-left"
                      >
                        <span className="relative block w-full overflow-hidden rounded-md border border-border bg-muted/35 p-1">
                          <LayoutTemplatePreview option={option} />
                          {layoutPreset === option.id && (
                            <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-background/95 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-foreground shadow-subtle">
                              <Check className="size-2.5 text-primary" aria-hidden="true" />
                              {t('selectedShort')}
                            </span>
                          )}
                        </span>
                        <span className="flex w-full min-w-0 items-start justify-between gap-2">
                          <span className="min-w-0 line-clamp-2 break-words text-[12px] font-semibold leading-4 text-foreground">{t(option.labelKey)}</span>
                          <span className="shrink-0 pt-0.5 font-mono text-[9px] tabular-nums text-muted-foreground">{getTemplateSlotLabel(t, option)}</span>
                        </span>
                        <span className={`w-full truncate font-body text-[10px] leading-4 ${requirement ? 'text-muted-foreground' : 'text-primary'}`}>
                          {getTemplateStatus(t, option, imageCount)}
                        </span>
                      </EditorChoice>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        {hasTemplateOverflow && selectedTemplate && (
          <p className="rounded-md border border-border bg-muted/50 px-3 py-2 font-body text-[11px] leading-4 text-muted-foreground">
            {t('templateOverflow', { count: imageCount, max: selectedTemplate.maxImages })}
          </p>
        )}
        {canChooseImageShape && (
          <div className="editor-control-surface space-y-3 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-foreground">{t('imageShapeTitle')}</h4>
                <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('imageShapeDescription')}</p>
              </div>
              <span className="editor-meta shrink-0">4×2</span>
            </div>
            <div role="group" aria-label={t('imageShapeTitle')} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {imageShapeOptions.map(({ value, label, Icon }) => (
                <EditorChoice
                  key={value}
                  active={imageShape === value}
                  onClick={() => setImageShape(value)}
                  aria-label={label}
                  className="min-w-0 flex-col gap-1.5 px-2 py-2.5 text-[11px]"
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  <span>{label}</span>
                </EditorChoice>
              ))}
            </div>
            <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('imageShapeHint')}</p>
          </div>
        )}
      </EditorSection>

      <EditorSection title={t('transition')} description={t('transitionDescription')}>
        <div className="grid grid-cols-2 gap-2">
          <EditorChoice active={imageTransition === 'none'} onClick={() => setImageTransition('none')}>
            {t('transitionNone')}
          </EditorChoice>
          <EditorChoice active={imageTransition === 'soft-blend'} onClick={() => setImageTransition('soft-blend')}>
            <Blend className="size-4" />
            {t('transitionSoftBlend')}
          </EditorChoice>
        </div>
      </EditorSection>

      <EditorSection title={t('spacingTitle')} description={t('spacingDescription')}>
        <div className="editor-control-surface space-y-5 p-4">
          {imageTransition === 'none' ? (
            <div className="space-y-3">
              <EditorFieldHeader label={t('imageGap')} value={`${imageGap} px`} htmlFor="image-gap" />
              <Slider id="image-gap" value={[imageGap]} onValueChange={(values) => setImageGap(Array.isArray(values) ? values[0] : values)} min={0} max={100} step={1} aria-label={t('imageGap')} />
            </div>
          ) : (
            <div className="space-y-3">
              <EditorFieldHeader label={t('blendWidth')} value={`${blendWidth} px`} htmlFor="blend-width" />
              <Slider id="blend-width" value={[blendWidth]} onValueChange={(values) => setBlendWidth(Array.isArray(values) ? values[0] : values)} min={0} max={200} step={1} aria-label={t('blendWidth')} />
            </div>
          )}
          <div className="space-y-3 border-t border-border pt-4">
            <EditorFieldHeader label={t('borderWidth')} value={`${borderWidth} px`} htmlFor="border-width" />
            <Slider id="border-width" value={[borderWidth]} onValueChange={(values) => setBorderWidth(Array.isArray(values) ? values[0] : values)} min={0} max={50} step={1} aria-label={t('borderWidth')} />
          </div>
        </div>
      </EditorSection>

      <EditorSection title={t('finishTitle')} description={t('finishDescription')}>
        <div className="space-y-5">
          <div className="space-y-3">
            <EditorFieldHeader label={t('backgroundAndBorder')} value={selectedBackground.label} />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {backgroundOptions.map((option) => (
                <EditorChoice
                  key={option.value}
                  active={backgroundColor === option.value}
                  onClick={() => setBackgroundColor(option.value)}
                  aria-label={option.label}
                  className="min-w-0 justify-start px-2.5"
                >
                  <BackgroundSwatch color={option.swatch} />
                  <span className="truncate">{option.label}</span>
                </EditorChoice>
              ))}
            </div>
            {backgroundColor === 'custom' && (
              <div className="editor-control-surface space-y-3 p-3">
                <EditorFieldHeader label={t('customBackgroundColor')} value={safeCustomBackgroundColor.toUpperCase()} htmlFor="custom-background-color" />
                <div className="flex items-center gap-2">
                  <label htmlFor="custom-background-color" className="relative grid size-10 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-md border border-input bg-background shadow-subtle focus-within:ring-2 focus-within:ring-ring">
                    <BackgroundSwatch color={safeCustomBackgroundColor} className="size-6" />
                    <input
                      id="custom-background-color"
                      type="color"
                      value={safeCustomBackgroundColor}
                      onChange={(event) => {
                        setCustomBackgroundColor(event.target.value)
                        setBackgroundColor('custom')
                      }}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label={t('customBackgroundPicker')}
                    />
                  </label>
                  <Input
                    value={customBackgroundColor}
                    onChange={(event) => {
                      const value = event.target.value
                      setCustomBackgroundColor(value)
                      if (isHexColor(value)) setBackgroundColor('custom')
                    }}
                    onBlur={() => {
                      if (!isHexColor(customBackgroundColor)) setCustomBackgroundColor(safeCustomBackgroundColor)
                    }}
                    className="h-10 font-mono text-xs uppercase"
                    maxLength={7}
                    inputMode="text"
                    spellCheck={false}
                    aria-label={t('customBackgroundColor')}
                  />
                </div>
                <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('customBackgroundDescription')}</p>
              </div>
            )}
            <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('backgroundAndBorderDescription')}</p>
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            <EditorFieldHeader label={t('grainIntensity')} value={`${grainIntensity}%`} htmlFor="grain-intensity" />
            <Slider id="grain-intensity" value={[grainIntensity]} onValueChange={(values) => setGrainIntensity(Array.isArray(values) ? values[0] : values)} min={0} max={100} step={1} aria-label={t('grainIntensity')} />
          </div>
        </div>
      </EditorSection>
    </div>
  )
}

type BackgroundOption = {
  value: BackgroundColor
  label: string
  swatch: string
}

const DEFAULT_CUSTOM_BACKGROUND = '#e6e8e4'

function isHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value)
}

function getSafeCustomBackgroundColor(value: string) {
  return isHexColor(value) ? value : DEFAULT_CUSTOM_BACKGROUND
}

function BackgroundSwatch({ color, className = 'size-4' }: { color: string; className?: string }) {
  if (color === 'transparent') {
    return (
      <span
        aria-hidden="true"
        className={`${className} checkerboard shrink-0 rounded-sm border border-border`}
      />
    )
  }

  return <span aria-hidden="true" className={`${className} shrink-0 rounded-sm border border-border`} style={{ backgroundColor: color }} />
}

const GROUP_LABEL_KEYS: Record<LayoutTemplateGroup, string> = {
  two: 'templateGroupTwo',
  three: 'templateGroupThree',
  four: 'templateGroupFour',
  matrix: 'templateGroupMatrix',
}

const GROUP_HINT_KEYS: Record<LayoutTemplateGroup, string> = {
  two: 'templateGroupTwoHint',
  three: 'templateGroupThreeHint',
  four: 'templateGroupFourHint',
  matrix: 'templateGroupMatrixHint',
}

type LayoutFilter = 'all' | 'basic' | 'focus' | 'matrix'

type LayoutFilterOption = {
  value: LayoutFilter
  label: string
  groups: readonly LayoutTemplateGroup[]
}

function getTemplateRequirement(t: ReturnType<typeof useTranslations<'LayoutSettings'>>, option: LayoutTemplateOption, imageCount: number) {
  if (imageCount < option.minImages) return t('templateNeedsImages', { count: option.minImages })
  if (imageCount > option.maxImages) return t('templateMaxImages', { count: option.maxImages })
  return ''
}

function getTemplateStatus(t: ReturnType<typeof useTranslations<'LayoutSettings'>>, option: LayoutTemplateOption, imageCount: number) {
  if (imageCount < option.minImages) return t('templateNeedsShort', { count: option.minImages })
  if (imageCount > option.maxImages) return t('templateMaxShort', { count: option.maxImages })
  return t('templateReady')
}

function getTemplateSlotLabel(t: ReturnType<typeof useTranslations<'LayoutSettings'>>, option: LayoutTemplateOption) {
  return t('templateSlotCount', { count: option.previewCount })
}

function LayoutTemplatePreview({
  option,
  variant = 'card',
  images = [],
  imageCount,
}: {
  option: LayoutTemplateOption
  variant?: 'card' | 'hero'
  images?: readonly (string | undefined)[]
  imageCount?: number
}) {
  const geometry = imageCount === undefined
    ? getLayoutPreviewGeometry(option.id)
    : getLayoutGeometry(option.id, imageCount)
  const isHero = variant === 'hero'

  return (
    <span
      aria-hidden="true"
      className={isHero
        ? 'grid aspect-[5/2] min-h-0 w-full gap-1 rounded-sm border border-primary/25 bg-primary/5 p-1'
        : 'grid aspect-[4/3] w-full gap-1 rounded-sm border border-primary/20 bg-primary/5 p-1'}
      style={{
        gridTemplateColumns: `repeat(${geometry.columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${geometry.rows}, minmax(0, 1fr))`,
      }}
    >
      {geometry.cells.map((cell, index) => {
        const image = images[index]

        return (
          <span
            key={`${cell.column}-${cell.row}-${index}`}
            className="relative min-h-0 overflow-hidden rounded-[3px]"
            style={{
              gridColumn: `${cell.column + 1} / span ${cell.columnSpan ?? 1}`,
              gridRow: `${cell.row + 1} / span ${cell.rowSpan ?? 1}`,
            }}
          >
            {image ? (
              // Uploaded previews can be blob URLs, so Next Image cannot optimize this thumbnail.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" draggable={false} decoding="async" className="size-full object-cover" />
            ) : (
              <span className={`grid size-full place-items-center border border-dashed ${isHero ? 'border-primary/25 bg-primary/10' : 'border-primary/20 bg-primary/60'}`}>
                <span className={`font-mono font-semibold tabular-nums ${isHero ? 'text-sm text-primary/70' : 'text-[9px] text-primary-foreground/80'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </span>
            )}
            {image && isHero && (
              <span className="absolute bottom-1 left-1 rounded-sm bg-primary/75 px-1 py-0.5 font-mono text-[9px] font-semibold tabular-nums text-primary-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
