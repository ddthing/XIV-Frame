import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Upload, X, ArrowLeftRight, RefreshCw, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function ImageUploader() {
  const { 
    images, setImages, setImageAt, removeImageAt, swapImages, 
    imageScales, setImageScale, setImagePosition,
    isImageLocked, setIsImageLocked
  } = useStore(useShallow(state => ({
    images: state.images,
    setImages: state.setImages,
    setImageAt: state.setImageAt,
    removeImageAt: state.removeImageAt,
    swapImages: state.swapImages,
    imageScales: state.imageScales,
    setImageScale: state.setImageScale,
    setImagePosition: state.setImagePosition,
    isImageLocked: state.isImageLocked,
    setIsImageLocked: state.setIsImageLocked
  })))
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
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((idx) => {
          const image = images[idx]
          if (idx > 1 && !images[idx - 1] && !image) return null;

          return (
            <div 
              key={idx} 
              className="relative flex-1 aspect-[4/3] rounded-xl overflow-hidden bg-background border border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors group shadow-subtle"
              onClick={() => !image && handleFileUpload(idx)}
            >
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {idx > 0 && (
                      <button onClick={(e) => handleMove(e, idx, 'prev')} className="bg-background text-foreground p-2 rounded-md hover:bg-muted shadow-subtle border border-border transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleFileUpload(idx); }}
                      className="text-foreground text-sm font-medium border border-border px-4 py-2 rounded-md bg-background hover:bg-muted shadow-subtle transition-colors"
                    >
                      {t('change')}
                    </button>
                    {idx < images.length - 1 && (
                      <button onClick={(e) => handleMove(e, idx, 'next')} className="bg-background text-foreground p-2 rounded-md hover:bg-muted shadow-subtle border border-border transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <button 
                      aria-label={t('deleteImage')}
                      onClick={(e) => { e.stopPropagation(); removeImageAt(idx); }}
                      className="bg-background text-foreground p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive shadow-subtle border border-border transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm text-foreground w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold z-10 pointer-events-none border border-border shadow-subtle">
                    {idx + 1}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-medium">Image {idx + 1}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" className="flex-1 text-sm h-10 rounded-md" onClick={() => swapImages(0, 1)} disabled={images.length < 2 || !images[0] || !images[1]}>
          <ArrowLeftRight className="w-4 h-4 mr-2" /> {t('swapOrder')}
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-sm h-10 rounded-md hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={() => setImages([])} disabled={images.filter(Boolean).length === 0}>
          <RefreshCw className="w-4 h-4 mr-2" /> {t('clearAll')}
        </Button>
      </div>

      {images.some(Boolean) && (
        <div className="space-y-3 pt-4 border-t border-border">
          {images.map((img, idx) => img && (
            <div key={`controls-${idx}`} className="space-y-3 bg-background p-4 rounded-xl border border-border shadow-subtle">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">{t('imageSize', { index: idx + 1 })}</Label>
                <button 
                  onClick={() => { setImageScale(idx, 1); setImagePosition(idx, {x:0, y:0}) }}
                  className="text-xs text-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {t('reset')}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <Slider 
                  value={[imageScales[idx] || 1]} 
                  onValueChange={(vals) => setImageScale(idx, Array.isArray(vals) ? vals[0] : vals as any)} 
                  min={0.5} max={3} step={0.01} 
                  className="flex-1"
                />
                <div className="relative w-[84px] shrink-0">
                  <Input 
                    type="number"
                    className="w-full h-9 rounded-md border-border bg-background text-sm text-foreground text-right font-medium pl-2 pr-6 [&::-webkit-inner-spin-button]:appearance-none"
                    value={Math.round((imageScales[idx] || 1) * 100)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      if (!isNaN(val)) setImageScale(idx, Math.max(0.5, Math.min(3, val / 100)))
                    }}
                    min="50" max="300"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-foreground/50 pointer-events-none font-medium">%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
