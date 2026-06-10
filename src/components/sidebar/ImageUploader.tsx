import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Upload, X, ArrowLeftRight, RefreshCw, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ImageUploader() {
  const { 
    images, setImages, setImageAt, removeImageAt, swapImages, 
    imageScales, setImageScale, setImagePosition,
    isImageLocked, setIsImageLocked
  } = useStore()
  const t = useTranslations('ImageUploader')
  
  const handleFileUpload = (index: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          alert(t('uploadLimit'))
          return
        }
        const url = URL.createObjectURL(file)
        setImageAt(index, url)
        setImageScale(index, 1)
        setImagePosition(index, { x: 0, y: 0 })
      }
    }
    input.click()
  }

  const handleMove = (e: React.MouseEvent, idx: number, direction: 'prev' | 'next') => {
    e.stopPropagation()
    if (direction === 'prev' && idx > 0) swapImages(idx, idx - 1)
    if (direction === 'next' && idx < images.length - 1) swapImages(idx, idx + 1)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((idx) => {
          const image = images[idx]
          // Don't show slot 3 or 4 if the previous slots are empty
          if (idx > 1 && !images[idx - 1] && !image) return null;

          return (
            <div 
              key={idx} 
              className="relative flex-1 aspect-[4/3] rounded-sm border-2 border-dashed border-border overflow-hidden bg-background flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors group"
              onClick={() => !image && handleFileUpload(idx)}
            >
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {idx > 0 && (
                      <button onClick={(e) => handleMove(e, idx, 'prev')} className="bg-black/50 text-white p-1.5 rounded-sm hover:bg-black/70">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleFileUpload(idx); }}
                      className="text-white text-xs font-medium border border-white/50 px-3 py-1.5 rounded-sm bg-black/20 hover:bg-black/50"
                    >
                      {t('change')}
                    </button>
                    {idx < images.length - 1 && (
                      <button onClick={(e) => handleMove(e, idx, 'next')} className="bg-black/50 text-white p-1.5 rounded-sm hover:bg-black/70">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <button 
                      aria-label={t('deleteImage')}
                      onClick={(e) => { e.stopPropagation(); removeImageAt(idx); }}
                      className="bg-black/50 text-white p-1 rounded-sm hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/50 text-white w-6 h-6 flex items-center justify-center rounded-sm text-xs font-bold z-10 pointer-events-none">
                    {idx + 1}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-medium">Image {idx + 1}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-10 rounded-sm" onClick={() => swapImages(0, 1)} disabled={images.length < 2 || !images[0] || !images[1]}>
          <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" /> {t('swapOrder')}
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs h-10 rounded-sm" onClick={() => setImages([])} disabled={images.filter(Boolean).length === 0}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> {t('clearAll')}
        </Button>
      </div>

      {images.some(Boolean) && (
        <div className="space-y-4 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 cursor-pointer" onClick={() => setIsImageLocked(!isImageLocked)}>
              {isImageLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {t('lockPosition')}
            </Label>
            <Switch checked={isImageLocked} onCheckedChange={setIsImageLocked} />
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => img && (
              <div key={`controls-${idx}`} className="space-y-2 bg-background p-3 rounded-sm border border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">{t('imageSize', { index: idx + 1 })}</Label>
                  <button 
                    onClick={() => { setImageScale(idx, 1); setImagePosition(idx, {x:0, y:0}) }}
                    className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> {t('reset')}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Slider 
                    value={[imageScales[idx] || 1]} 
                    onValueChange={(vals) => setImageScale(idx, Array.isArray(vals) ? vals[0] : vals as any)} 
                    min={0.5} max={3} step={0.01} 
                  />
                  <div className="relative w-16 shrink-0">
                    <input 
                      type="number"
                      className="w-full text-xs text-right font-medium bg-transparent border border-border rounded-sm px-1 py-0.5 pr-4 appearance-none hover:border-primary focus:border-primary focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      value={Math.round((imageScales[idx] || 1) * 100)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        if (!isNaN(val)) setImageScale(idx, Math.max(0.5, Math.min(3, val / 100)))
                      }}
                      min="50" max="300"
                    />
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">%</span>
                  </div>
                </div>
                
                {/* Fine-tune position controls */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-muted-foreground">{t('positionNudge') || 'Position Nudge'}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setImagePosition(idx, { 
                        x: (useStore.getState().imagePositions[idx]?.x || 0) - 10, 
                        y: useStore.getState().imagePositions[idx]?.y || 0 
                      })}
                      className="p-1 rounded-sm border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => setImagePosition(idx, { 
                          x: useStore.getState().imagePositions[idx]?.x || 0, 
                          y: (useStore.getState().imagePositions[idx]?.y || 0) - 10 
                        })}
                        className="p-1 rounded-sm border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 rotate-90" />
                      </button>
                      <button 
                        onClick={() => setImagePosition(idx, { 
                          x: useStore.getState().imagePositions[idx]?.x || 0, 
                          y: (useStore.getState().imagePositions[idx]?.y || 0) + 10 
                        })}
                        className="p-1 rounded-sm border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setImagePosition(idx, { 
                        x: (useStore.getState().imagePositions[idx]?.x || 0) + 10, 
                        y: useStore.getState().imagePositions[idx]?.y || 0 
                      })}
                      className="p-1 rounded-sm border border-border bg-card hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
