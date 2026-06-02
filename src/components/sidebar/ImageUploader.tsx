import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Upload, X, ArrowLeftRight, RefreshCw, Lock, Unlock } from 'lucide-react'

export function ImageUploader() {
  const { 
    images, setImages, setImageAt, removeImageAt, swapImages, 
    imageScales, setImageScale, setImagePosition,
    isImageLocked, setIsImageLocked
  } = useStore()
  
  const handleFileUpload = (index: number) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          alert('이미지 파일은 10MB 이하만 가능합니다.')
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[0, 1].map((idx) => {
          const image = images[idx]
          return (
            <div 
              key={idx} 
              className="relative flex-1 aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group"
              onClick={() => !image && handleFileUpload(idx)}
            >
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleFileUpload(idx); }}
                      className="text-white text-xs font-medium border border-white/50 px-3 py-1.5 rounded-full bg-black/20 hover:bg-black/50"
                    >
                      변경
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 z-10">
                    <button 
                      aria-label="이미지 삭제"
                      onClick={(e) => { e.stopPropagation(); removeImageAt(idx); }}
                      className="bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/50 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold z-10 pointer-events-none">
                    {idx + 1}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-medium">Image {idx + 1}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs h-10 rounded-full" onClick={() => swapImages(0, 1)} disabled={images.length < 2 || !images[0] || !images[1]}>
          <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" /> 순서 바꾸기
        </Button>
        <Button variant="outline" size="sm" className="flex-1 text-xs h-10 rounded-full" onClick={() => setImages([])} disabled={images.filter(Boolean).length === 0}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> 모두 지우기
        </Button>
      </div>

      {images.some(Boolean) && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 cursor-pointer" onClick={() => setIsImageLocked(!isImageLocked)}>
              {isImageLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              캔버스 이미지 위치 잠금
            </Label>
            <Switch checked={isImageLocked} onCheckedChange={setIsImageLocked} />
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => img && (
              <div key={`controls-${idx}`} className="space-y-2 bg-slate-50 p-3 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-600">이미지 {idx + 1} 크기</Label>
                  <button 
                    onClick={() => { setImageScale(idx, 1); setImagePosition(idx, {x:0, y:0}) }}
                    className="text-[10px] text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> 초기화
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Slider 
                    value={[imageScales[idx] || 1]} 
                    onValueChange={(vals) => setImageScale(idx, Array.isArray(vals) ? vals[0] : vals as any)} 
                    min={0.5} max={3} step={0.01} 
                  />
                  <span className="text-xs text-slate-500 w-8 text-right font-medium">
                    {Math.round((imageScales[idx] || 1) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
