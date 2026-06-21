import { useStore, BackgroundColor } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'

export function LayoutSettings() {
  const {
    layoutPreset, setLayoutPreset,
    imageTransition, setImageTransition,
    imageGap, setImageGap,
    blendWidth, setBlendWidth,
    borderWidth, setBorderWidth,
    grainIntensity, setGrainIntensity,
    backgroundColor, setBackgroundColor,
    showCopyright, setShowCopyright,
    copyrightPosition, setCopyrightPosition,
    copyrightColor, setCopyrightColor,
    images
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
    showCopyright: state.showCopyright,
    setShowCopyright: state.setShowCopyright,
    copyrightPosition: state.copyrightPosition,
    setCopyrightPosition: state.setCopyrightPosition,
    copyrightColor: state.copyrightColor,
    setCopyrightColor: state.setCopyrightColor,
    images: state.images
  })))

  const t = useTranslations('LayoutSettings')
  const colors: BackgroundColor[] = ['white', 'light-gray', 'transparent']

  return (
    <div className="space-y-4 pt-1 font-sans">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground block">{t('layoutPreset')}</Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLayoutPreset('split')}
            className={`flex-1 min-w-[80px] h-10 text-sm font-medium rounded-md border transition-all shadow-subtle ${layoutPreset === 'split' ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
          >
            {t('presetSplit')}
          </button>
          <button
            onClick={() => setLayoutPreset('vertical-split')}
            className={`flex-1 min-w-[80px] h-10 text-sm font-medium rounded-md border transition-all shadow-subtle ${layoutPreset === 'vertical-split' ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
          >
            {t('presetVertical')}
          </button>
          <button
            onClick={() => setLayoutPreset('grid')}
            className={`flex-1 min-w-[80px] h-10 text-sm font-medium rounded-md border transition-all shadow-subtle ${layoutPreset === 'grid' ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted/50 disabled:opacity-50'}`}
            disabled={images.filter(Boolean).length < 3}
          >
            {t('presetGrid')}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground block">{t('transition') || 'Transition'}</Label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setImageTransition('none')}
            className={`flex-1 min-w-[80px] h-10 text-sm font-medium rounded-md border transition-all shadow-subtle ${imageTransition === 'none' ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
          >
            {t('transitionNone') || 'Gap'}
          </button>
          <button
            onClick={() => setImageTransition('soft-blend')}
            className={`flex-1 min-w-[80px] h-10 text-sm font-medium rounded-md border transition-all shadow-subtle ${imageTransition === 'soft-blend' ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
          >
            {t('transitionSoftBlend') || 'Soft Blend'}
          </button>
        </div>
      </div>

      {imageTransition === 'none' ? (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex justify-between">
            {t('imageGap')}
            <span className="text-muted-foreground">{imageGap} px</span>
          </Label>
          <Slider 
            value={[imageGap]} 
            onValueChange={(vals) => setImageGap(Array.isArray(vals) ? vals[0] : vals)}
            min={0} max={100} step={1} 
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex justify-between">
            {t('blendWidth')}
            <span className="text-muted-foreground">{blendWidth} px</span>
          </Label>
          <Slider 
            value={[blendWidth]} 
            onValueChange={(vals) => setBlendWidth(Array.isArray(vals) ? vals[0] : vals)}
            min={0} max={200} step={1} 
          />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex justify-between">
          {t('borderWidth')}
          <span className="text-muted-foreground">{borderWidth} px</span>
        </Label>
        <Slider 
          value={[borderWidth]} 
          onValueChange={(vals) => setBorderWidth(Array.isArray(vals) ? vals[0] : vals)}
          min={0} max={50} step={1} 
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground flex justify-between">
          {t('grainIntensity') || 'Grain'}
          <span className="text-muted-foreground">{grainIntensity}%</span>
        </Label>
        <Slider 
          value={[grainIntensity]} 
          onValueChange={(vals) => setGrainIntensity(Array.isArray(vals) ? vals[0] : vals as any)}
          min={0} max={100} step={1} 
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground block">{t('background')}</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => setBackgroundColor(color)}
              className={`flex-1 min-w-[60px] h-10 text-sm font-medium rounded-md border transition-all shadow-subtle ${backgroundColor === color ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted/50'}`}
            >
              {color === 'white' ? t('bgWhite') : color === 'light-gray' ? t('bgLightGray') : t('bgTransparent')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Label className="text-sm font-medium text-foreground cursor-pointer" onClick={() => setShowCopyright(!showCopyright)}>
          {t('copyrightToggle')}
        </Label>
        <Switch 
          checked={showCopyright} 
          onCheckedChange={setShowCopyright} 
        />
      </div>

      {showCopyright && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground block">{t('copyrightPosition')}</Label>
            <div className="grid grid-cols-3 gap-2 w-full">
              {(
                [
                  { value: 'bottom-left', label: t('posLeft') },
                  { value: 'bottom-center', label: t('posCenter') },
                  { value: 'bottom-right', label: t('posRight') },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCopyrightPosition(value)}
                  className={`flex items-center justify-center h-10 text-sm font-medium rounded-md border transition-all shadow-subtle
                    ${copyrightPosition === value
                      ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground block">{t('copyrightColor')}</Label>
            <div className="grid grid-cols-3 gap-2 w-full">
              {(
                [
                  { value: 'black', label: t('colorBlack') },
                  { value: 'white', label: t('colorWhite') },
                  { value: 'gray', label: t('colorGray') },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCopyrightColor(value)}
                  className={`flex items-center justify-center h-10 text-sm font-medium rounded-md border transition-all shadow-subtle
                    ${copyrightColor === value
                      ? 'bg-[#d5f5c2] text-primary border-transparent font-semibold shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:bg-muted/50'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
