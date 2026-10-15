import { ArrowRight, Blend } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { EditorFieldHeader, EditorRadio, EditorSection, editorSegmentedGroupClass, editorSegmentedOptionClass } from '@/components/ui/editor'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useStore, type BackgroundColor, type CanvasRatio, type LayoutPreset } from '@/store/useStore'
import { StudioPresets } from './StudioPresets'

export function LayoutSettings({ onContinue, idPrefix = 'layout', showContinue = true, stickyContinue = false, showRatio = true }: { onContinue?: () => void; idPrefix?: string; showContinue?: boolean; stickyContinue?: boolean; showRatio?: boolean }) {
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
    canvasRatio,
    setCanvasRatio,
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
    canvasRatio: state.canvasRatio,
    setCanvasRatio: state.setCanvasRatio,
    images: state.images,
  })))

  const t = useTranslations('LayoutSettings')
  const colors: BackgroundColor[] = ['white', 'light-gray', 'transparent']
  const imageCount = images.filter(Boolean).length
  const recommendedPreset: LayoutPreset | null = imageCount >= 3 ? 'grid' : imageCount === 2 ? 'split' : null
  const gridNeedsMoreImages = layoutPreset === 'grid' && imageCount < 3
  const controlId = (name: string) => `${idPrefix}-${name}`
  const layoutOptions: Array<{
    preset: LayoutPreset
    label: string
    description: string
    meta: string
  }> = [
    {
      preset: 'split',
      label: t('presetSplit'),
      description: t('presetSplitDescription'),
      meta: t('presetSplitMeta'),
    },
    {
      preset: 'vertical-split',
      label: t('presetVertical'),
      description: t('presetVerticalDescription'),
      meta: t('presetVerticalMeta'),
    },
    {
      preset: 'grid',
      label: t('presetGrid'),
      description: t('presetGridDescription'),
      meta: t('presetGridMeta'),
    },
  ]

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
      return
    }

    window.dispatchEvent(new CustomEvent('xiv-frame:open-image'))
  }

  return (
    <div className="space-y-6">
      <StudioPresets />
      <EditorSection title={t('compositionTitle')} description={t('compositionDescription')}>
        {showRatio && (
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-foreground">{t('ratio')}</span>
            <div className={`grid grid-cols-3 items-center gap-0.5 ${editorSegmentedGroupClass}`} role="radiogroup" aria-label={t('ratio')}>
              {(['auto', '16:9', '2:1', '1:1', '4:5', '9:16'] as const satisfies CanvasRatio[]).map((ratio) => (
                <EditorRadio
                  key={ratio}
                  checked={canvasRatio === ratio}
                  onClick={() => setCanvasRatio(ratio)}
                  className={editorSegmentedOptionClass(canvasRatio === ratio)}
                >
                  {ratio === 'auto' ? t('ratioAuto') : ratio}
                </EditorRadio>
              ))}
            </div>
          </div>
        )}

        <fieldset className="space-y-3">
          <legend className="sr-only">{t('layoutPreset')}</legend>
          <div className="layout-options grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('layoutPreset')}>
            {layoutOptions.map(({ preset, label, description, meta }) => {
              const selected = layoutPreset === preset
              const recommended = recommendedPreset === preset

              return (
                <EditorRadio
                  key={preset}
                  checked={selected}
                  aria-describedby={controlId(`layout-${preset}-description`)}
                  onClick={() => setLayoutPreset(preset)}
                  className={`group flex min-w-0 flex-col gap-2 rounded-lg border px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
                    selected
                      ? 'border-primary bg-muted text-foreground'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <LayoutThumbnail preset={preset} />
                  <span className="flex w-full min-w-0 flex-col justify-between gap-2">
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold leading-5 text-foreground">{label}</span>
                        <span className="sr-only">{meta}</span>
                      </span>
                      {recommended && (
                        <span className="sr-only">
                          {t('recommended')}
                        </span>
                      )}
                    </span>
                    <span id={controlId(`layout-${preset}-description`)} className="sr-only">{description}</span>
                    <span className="sr-only">
                      {selected ? t('selectedLayout') : t('chooseLayout')}
                    </span>
                  </span>
                </EditorRadio>
              )
            })}
          </div>
          {gridNeedsMoreImages && (
            <p role="status" className="font-body text-[11px] leading-4 text-muted-foreground">{t('gridHint')}</p>
          )}
        </fieldset>

        {showContinue && (
          <div className={stickyContinue
            ? 'sticky bottom-0 z-10 -mx-5 flex justify-end bg-background/95 px-5 pb-1 pt-3 backdrop-blur-sm'
            : 'flex justify-end pt-3'}>
            <Button type="button" size="sm" className="h-10 shrink-0 rounded-md px-3 text-xs" onClick={handleContinue}>
              {t('continueToPhotos')}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        )}
      </EditorSection>

      <EditorSection title={t('transition')} description={t('transitionDescription')}>
        <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-muted/65 p-1" role="radiogroup" aria-label={t('transition')}>
          <EditorRadio checked={imageTransition === 'none'} onClick={() => setImageTransition('none')} className={editorSegmentedOptionClass(imageTransition === 'none')}>
            {t('transitionNone')}
          </EditorRadio>
          <EditorRadio checked={imageTransition === 'soft-blend'} onClick={() => setImageTransition('soft-blend')} className={editorSegmentedOptionClass(imageTransition === 'soft-blend')}>
            <Blend className="size-4" aria-hidden="true" />
            {t('transitionSoftBlend')}
          </EditorRadio>
        </div>
      </EditorSection>

      <EditorSection title={t('spacingTitle')} description={t('spacingDescription')}>
        <div className="space-y-6">
          {imageTransition === 'none' ? (
            <div className="space-y-3">
              <EditorFieldHeader label={t('imageGap')} value={`${imageGap} px`} htmlFor={controlId('image-gap')} />
              <Slider id={controlId('image-gap')} value={[imageGap]} onValueChange={(values) => setImageGap(Array.isArray(values) ? values[0] : values)} min={0} max={100} step={1} aria-label={t('imageGap')} />
            </div>
          ) : (
            <div className="space-y-3">
              <EditorFieldHeader label={t('blendWidth')} value={`${blendWidth} px`} htmlFor={controlId('blend-width')} />
              <Slider id={controlId('blend-width')} value={[blendWidth]} onValueChange={(values) => setBlendWidth(Array.isArray(values) ? values[0] : values)} min={0} max={200} step={1} aria-label={t('blendWidth')} />
            </div>
          )}
          <div className="space-y-3">
            <EditorFieldHeader label={t('borderWidth')} value={`${borderWidth} px`} htmlFor={controlId('border-width')} />
            <Slider id={controlId('border-width')} value={[borderWidth]} onValueChange={(values) => setBorderWidth(Array.isArray(values) ? values[0] : values)} min={0} max={50} step={1} aria-label={t('borderWidth')} />
          </div>
        </div>
      </EditorSection>

      <EditorSection title={t('finishTitle')} description={t('finishDescription')}>
        <div className="space-y-5">
          <div className="space-y-3">
            <EditorFieldHeader label={t('background')} value={backgroundColor === 'white' ? t('bgWhite') : backgroundColor === 'light-gray' ? t('bgLightGray') : t('bgTransparent')} />
            <div className={`grid grid-cols-3 gap-0.5 ${editorSegmentedGroupClass}`} role="radiogroup" aria-label={t('background')}>
              {colors.map((color) => (
                <EditorRadio checked={backgroundColor === color} key={color} onClick={() => setBackgroundColor(color)} className={editorSegmentedOptionClass(backgroundColor === color)}>
                  {color === 'white' ? t('bgWhite') : color === 'light-gray' ? t('bgLightGray') : t('bgTransparent')}
                </EditorRadio>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <EditorFieldHeader label={t('grainIntensity')} value={`${grainIntensity}%`} htmlFor={controlId('grain-intensity')} />
            <Slider id={controlId('grain-intensity')} value={[grainIntensity]} onValueChange={(values) => setGrainIntensity(Array.isArray(values) ? values[0] : values)} min={0} max={100} step={1} aria-label={t('grainIntensity')} />
          </div>
        </div>
      </EditorSection>
    </div>
  )
}

function LayoutThumbnail({ preset }: { preset: LayoutPreset }) {
  if (preset === 'vertical-split') {
    return (
      <span className="flex h-12 w-full shrink-0 flex-col gap-1 rounded-md bg-surface-inset/70 p-1" aria-hidden="true">
        <span className="min-h-0 flex-1 rounded-sm bg-primary/75" />
        <span className="min-h-0 flex-1 rounded-sm bg-primary/35" />
      </span>
    )
  }

  if (preset === 'grid') {
    return (
      <span className="grid h-12 w-full shrink-0 grid-cols-2 gap-1 rounded-md bg-surface-inset/70 p-1" aria-hidden="true">
        <span className="rounded-sm bg-primary/75" />
        <span className="rounded-sm bg-primary/35" />
        <span className="rounded-sm bg-primary/35" />
        <span className="rounded-sm bg-primary/75" />
      </span>
    )
  }

  return (
    <span className="grid h-12 w-full shrink-0 grid-cols-2 gap-1 rounded-md bg-surface-inset/70 p-1" aria-hidden="true">
      <span className="rounded-sm bg-primary/75" />
      <span className="rounded-sm bg-primary/35" />
    </span>
  )
}
