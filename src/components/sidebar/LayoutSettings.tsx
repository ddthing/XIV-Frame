import { Blend, Grid2X2, LayoutTemplate, Rows2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { EditorChoice, EditorFieldHeader, EditorSection } from '@/components/ui/editor'
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
    images: state.images,
  })))

  const t = useTranslations('LayoutSettings')
  const colors: BackgroundColor[] = ['white', 'light-gray', 'transparent']
  const imageCount = images.filter(Boolean).length

  return (
    <div className="space-y-6">
      <EditorSection title={t('compositionTitle')} description={t('compositionDescription')}>
        <div className="grid grid-cols-3 gap-2">
          <EditorChoice active={layoutPreset === 'split'} onClick={() => setLayoutPreset('split')} className="min-h-[76px] flex-col px-2">
            <ColumnsIcon />
            <span>{t('presetSplit')}</span>
          </EditorChoice>
          <EditorChoice active={layoutPreset === 'vertical-split'} onClick={() => setLayoutPreset('vertical-split')} className="min-h-[76px] flex-col px-2">
            <Rows2 className="size-5" />
            <span>{t('presetVertical')}</span>
          </EditorChoice>
          <EditorChoice active={layoutPreset === 'grid'} onClick={() => setLayoutPreset('grid')} disabled={imageCount < 3} className="min-h-[76px] flex-col px-2">
            <Grid2X2 className="size-5" />
            <span>{t('presetGrid')}</span>
          </EditorChoice>
        </div>
        {imageCount < 3 && <p className="text-[11px] leading-4 text-muted-foreground">{t('gridHint')}</p>}
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
            <EditorFieldHeader label={t('background')} value={backgroundColor === 'white' ? t('bgWhite') : backgroundColor === 'light-gray' ? t('bgLightGray') : t('bgTransparent')} />
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <EditorChoice key={color} active={backgroundColor === color} onClick={() => setBackgroundColor(color)} className="px-2">
                  {color === 'white' ? t('bgWhite') : color === 'light-gray' ? t('bgLightGray') : t('bgTransparent')}
                </EditorChoice>
              ))}
            </div>
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

function ColumnsIcon() {
  return <LayoutTemplate className="size-5" />
}
