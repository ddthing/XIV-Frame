import { Blend } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { EditorChoice, EditorFieldHeader, EditorSection } from '@/components/ui/editor'
import {
  getLayoutGeometry,
  isLayoutTemplateAvailable,
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
    setLayoutPreset,
    imageTransition,
    setImageTransition,
    imageGap,
    setImageGap,
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
    setLayoutPreset: state.setLayoutPreset,
    imageTransition: state.imageTransition,
    setImageTransition: state.setImageTransition,
    imageGap: state.imageGap,
    setImageGap: state.setImageGap,
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
  const safeCustomBackgroundColor = getSafeCustomBackgroundColor(customBackgroundColor)
  const backgroundOptions: BackgroundOption[] = [
    { value: 'white', label: t('bgWhite'), swatch: '#ffffff' },
    { value: 'black', label: t('bgBlack'), swatch: '#171918' },
    { value: 'light-gray', label: t('bgLightGray'), swatch: '#f1f5f9' },
    { value: 'transparent', label: t('bgTransparent'), swatch: 'transparent' },
    { value: 'custom', label: t('bgCustom'), swatch: safeCustomBackgroundColor },
  ]
  const selectedBackground = backgroundOptions.find((option) => option.value === backgroundColor) ?? backgroundOptions[0]

  return (
    <div className="space-y-6">
      <EditorSection title={t('compositionTitle')} description={t('compositionDescription')}>
        <div className="space-y-4">
          {LAYOUT_TEMPLATE_GROUPS.map((group) => {
            const options = LAYOUT_TEMPLATE_OPTIONS.filter((option) => option.group === group)

            return (
              <div key={group} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="editor-meta">{t(GROUP_LABEL_KEYS[group])}</span>
                  <span className="font-body text-[11px] text-muted-foreground">{t(GROUP_HINT_KEYS[group])}</span>
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
                        className="h-auto min-h-[104px] min-w-[92px] shrink-0 snap-start flex-col justify-start gap-2 px-2 py-3"
                      >
                        <LayoutTemplatePreview option={option} />
                        <span className="max-w-[76px] truncate text-center text-[11px] leading-4">{t(option.labelKey)}</span>
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
        {!isLayoutTemplateAvailable(layoutPreset, imageCount) && (
          <p className="rounded-md border border-border bg-muted/50 px-3 py-2 font-body text-[11px] leading-4 text-muted-foreground">
            {t('templateFallback')}
          </p>
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
            <EditorFieldHeader label={t('background')} value={selectedBackground.label} />
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
        className={`${className} shrink-0 rounded-[4px] border border-border`}
        style={{
          backgroundImage: 'linear-gradient(45deg, #d1d5db 25%, transparent 25%, transparent 75%, #d1d5db 75%), linear-gradient(45deg, #d1d5db 25%, transparent 25%, transparent 75%, #d1d5db 75%)',
          backgroundPosition: '0 0, 4px 4px',
          backgroundSize: '8px 8px',
        }}
      />
    )
  }

  return <span aria-hidden="true" className={`${className} shrink-0 rounded-[4px] border border-black/10`} style={{ backgroundColor: color }} />
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
  const geometry = getLayoutGeometry(option.id, option.previewCount)

  return (
    <span
      aria-hidden="true"
      className="grid size-12 shrink-0 gap-0.5 rounded-[5px] border border-primary/30 bg-primary/10 p-0.5"
      style={{
        gridTemplateColumns: `repeat(${geometry.columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${geometry.rows}, minmax(0, 1fr))`,
      }}
    >
      {geometry.cells.map((cell, index) => (
        <span
          key={`${cell.column}-${cell.row}-${index}`}
          className="min-h-0 rounded-[2px] bg-primary/65 transition-colors"
          style={{
            gridColumn: `${cell.column + 1} / span ${cell.columnSpan ?? 1}`,
            gridRow: `${cell.row + 1} / span ${cell.rowSpan ?? 1}`,
          }}
        />
      ))}
    </span>
  )
}
