import { useStore, BackgroundColor } from '@/store/useStore'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'

export function LayoutSettings() {
  const state = useStore()
  const t = useTranslations('LayoutSettings')
  const colors: BackgroundColor[] = ['white', 'light-gray', 'transparent']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground font-medium">{t('transition')}</Label>
        <div className="flex gap-2">
          <button
            onClick={() => state.setImageTransition('none')}
            className={`flex-1 h-9 text-[11px] rounded-full border transition-colors ${state.imageTransition === 'none' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-border text-muted-foreground hover:bg-background'}`}
          >
            {t('transitionNone')}
          </button>
          <button
            onClick={() => state.setImageTransition('soft-blend')}
            className={`flex-1 h-9 text-[11px] rounded-full border transition-colors ${state.imageTransition === 'soft-blend' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-border text-muted-foreground hover:bg-background'}`}
          >
            {t('transitionSoftBlend')}
          </button>
        </div>
      </div>

      {state.imageTransition === 'none' ? (
        <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
          <Label className="text-xs text-muted-foreground font-medium">{t('imageGap')}</Label>
          <div className="px-2">
            <Slider 
              value={[state.imageGap]} 
              onValueChange={(vals) => state.setImageGap(Array.isArray(vals) ? vals[0] : vals)}
              min={0} max={100} step={1} 
            />
          </div>
          <span className="text-xs text-right text-muted-foreground">{state.imageGap} px</span>
        </div>
      ) : (
        <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
          <Label className="text-xs text-muted-foreground font-medium">{t('blendWidth')}</Label>
          <div className="px-2">
            <Slider 
              value={[state.blendWidth]} 
              onValueChange={(vals) => state.setBlendWidth(Array.isArray(vals) ? vals[0] : vals)}
              min={0} max={200} step={1} 
            />
          </div>
          <span className="text-xs text-right text-muted-foreground">{state.blendWidth} px</span>
        </div>
      )}

      <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
        <Label className="text-xs text-muted-foreground font-medium">{t('borderWidth')}</Label>
        <div className="px-2">
          <Slider 
            value={[state.borderWidth]} 
            onValueChange={(vals) => state.setBorderWidth(Array.isArray(vals) ? vals[0] : vals)}
            min={0} max={50} step={1} 
          />
        </div>
        <span className="text-xs text-right text-muted-foreground">{state.borderWidth} px</span>
      </div>

      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <Label className="text-xs text-muted-foreground font-medium">{t('background')}</Label>
        <div className="flex gap-2">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => state.setBackgroundColor(color)}
              className={`flex-1 h-10 text-[11px] rounded-full border transition-colors ${state.backgroundColor === color ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-border text-muted-foreground hover:bg-background'}`}
            >
              {color === 'white' ? t('bgWhite') : color === 'light-gray' ? t('bgLightGray') : t('bgTransparent')}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[80px_1fr] items-center gap-2 pt-4 border-t border-border">
        <Label className="text-xs text-muted-foreground font-medium">{t('copyrightToggle')}</Label>
        <div className="flex items-center">
          <Switch 
            checked={state.showCopyright} 
            onCheckedChange={state.setShowCopyright} 
          />
        </div>
      </div>

      {state.showCopyright && (
        <>
          <div className="grid grid-cols-[80px_1fr] items-center gap-2">
            <Label className="text-xs text-muted-foreground font-medium">{t('copyrightPosition')}</Label>
            <div className="grid grid-cols-3 gap-1 w-full">
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
                  onClick={() => state.setCopyrightPosition(value)}
                  className={`flex items-center justify-center h-8 text-[11px] rounded-full border transition-colors
                    ${state.copyrightPosition === value
                      ? 'bg-primary/10 text-primary border-primary font-semibold'
                      : 'bg-card text-muted-foreground border-border hover:bg-background'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[80px_1fr] items-center gap-2">
            <Label className="text-xs text-muted-foreground font-medium">{t('copyrightColor')}</Label>
            <div className="grid grid-cols-3 gap-1 w-full">
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
                  onClick={() => state.setCopyrightColor(value)}
                  className={`flex items-center justify-center h-8 text-[11px] rounded-full border transition-colors
                    ${state.copyrightColor === value
                      ? 'bg-primary/10 text-primary border-primary font-semibold'
                      : 'bg-card text-muted-foreground border-border hover:bg-background'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
