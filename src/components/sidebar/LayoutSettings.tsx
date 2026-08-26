import { Blend, Circle, Heart, Sparkles, Square, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { EditorChoice, EditorFieldHeader, EditorSection } from '@/components/ui/editor'
import {
  getLayoutPreviewGeometry,
  getRecommendedLayoutPreset,
  LAYOUT_TEMPLATE_GROUPS,
  LAYOUT_TEMPLATE_OPTIONS,
  type LayoutTemplateGroup,
  type LayoutTemplateOption,
} from '@/lib/layoutTemplates'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useStore, type BackgroundColor } from '@/store/useStore'

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
  const hasTemplateOverflow = Boolean(selectedTemplate && imageCount > selectedTemplate.maxImages)
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
      <EditorSection title={t('compositionTitle')} description={t('compositionDescription')}>
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
        <div className="space-y-4">
          {LAYOUT_TEMPLATE_GROUPS.map((group) => {
            const options = LAYOUT_TEMPLATE_OPTIONS.filter((option) => option.group === group)

            return (
              <div key={group} className="space-y-2">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <span className="editor-meta min-w-0 truncate">{t(GROUP_LABEL_KEYS[group])}</span>
                  <span className="min-w-0 truncate font-body text-[11px] text-muted-foreground">{t(GROUP_HINT_KEYS[group])}</span>
                </div>
                <div role="group" aria-label={t(GROUP_LABEL_KEYS[group])} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
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
                        className="h-auto min-h-[104px] w-[92px] max-w-[92px] min-w-[92px] shrink-0 snap-start flex-col justify-start gap-2 px-2 py-3"
                      >
                        <LayoutTemplatePreview option={option} />
                        <span className="block min-w-0 max-w-full line-clamp-2 break-words text-center text-[11px] leading-4 whitespace-normal">{t(option.labelKey)}</span>
                      </EditorChoice>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <p className="font-body text-[11px] leading-4 text-muted-foreground">
          {t('templateHint', { count: imageCount })}
        </p>
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

function getTemplateRequirement(t: ReturnType<typeof useTranslations<'LayoutSettings'>>, option: LayoutTemplateOption, imageCount: number) {
  if (imageCount < option.minImages) return t('templateNeedsImages', { count: option.minImages })
  if (imageCount > option.maxImages) return t('templateMaxImages', { count: option.maxImages })
  return ''
}

function LayoutTemplatePreview({ option }: { option: LayoutTemplateOption }) {
  const geometry = getLayoutPreviewGeometry(option.id)

  return (
    <span
      aria-hidden="true"
      className="grid size-12 shrink-0 gap-0.5 rounded-md border border-primary/30 bg-primary/10 p-0.5"
      style={{
        gridTemplateColumns: `repeat(${geometry.columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${geometry.rows}, minmax(0, 1fr))`,
      }}
    >
      {geometry.cells.map((cell, index) => (
        <span
          key={`${cell.column}-${cell.row}-${index}`}
          className="min-h-0 rounded-sm bg-primary/65 transition-colors"
          style={{
            gridColumn: `${cell.column + 1} / span ${cell.columnSpan ?? 1}`,
            gridRow: `${cell.row + 1} / span ${cell.rowSpan ?? 1}`,
          }}
        />
      ))}
    </span>
  )
}
