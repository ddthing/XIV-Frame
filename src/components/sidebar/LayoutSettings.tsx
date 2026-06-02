import { useStore, BackgroundColor } from '@/store/useStore'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

export function LayoutSettings() {
  const state = useStore()
  const colors: BackgroundColor[] = ['white', 'light-gray', 'transparent']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <Label className="text-xs text-slate-500 font-medium">연결 효과</Label>
        <div className="flex gap-2">
          <button
            onClick={() => state.setImageTransition('none')}
            className={`flex-1 h-9 text-[11px] rounded-full border transition-colors ${state.imageTransition === 'none' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            기본 (None)
          </button>
          <button
            onClick={() => state.setImageTransition('soft-blend')}
            className={`flex-1 h-9 text-[11px] rounded-full border transition-colors ${state.imageTransition === 'soft-blend' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Soft Blend
          </button>
        </div>
      </div>

      {state.imageTransition === 'none' ? (
        <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
          <Label className="text-xs text-slate-500 font-medium">이미지 간격</Label>
          <div className="px-2">
            <Slider 
              value={[state.imageGap]} 
              onValueChange={(vals) => state.setImageGap(Array.isArray(vals) ? vals[0] : vals)}
              min={0} max={100} step={1} 
            />
          </div>
          <span className="text-xs text-right text-slate-500">{state.imageGap} px</span>
        </div>
      ) : (
        <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
          <Label className="text-xs text-slate-500 font-medium">Blend 범위</Label>
          <div className="px-2">
            <Slider 
              value={[state.blendWidth]} 
              onValueChange={(vals) => state.setBlendWidth(Array.isArray(vals) ? vals[0] : vals)}
              min={0} max={200} step={1} 
            />
          </div>
          <span className="text-xs text-right text-slate-500">{state.blendWidth} px</span>
        </div>
      )}

      <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
        <Label className="text-xs text-slate-500 font-medium">테두리 두께</Label>
        <div className="px-2">
          <Slider 
            value={[state.borderWidth]} 
            onValueChange={(vals) => state.setBorderWidth(Array.isArray(vals) ? vals[0] : vals)}
            min={0} max={50} step={1} 
          />
        </div>
        <span className="text-xs text-right text-slate-500">{state.borderWidth} px</span>
      </div>

      <div className="grid grid-cols-[80px_1fr] items-center gap-2">
        <Label className="text-xs text-slate-500 font-medium">배경</Label>
        <div className="flex gap-2">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => state.setBackgroundColor(color)}
              className={`flex-1 h-10 text-[11px] rounded-full border transition-colors ${state.backgroundColor === color ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {color === 'white' ? '화이트' : color === 'light-gray' ? '연한 회색' : '투명'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[80px_1fr] items-center gap-2 pt-4 border-t border-slate-100">
        <Label className="text-xs text-slate-500 font-medium">저작권 표시</Label>
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
            <Label className="text-xs text-slate-500 font-medium">저작권 위치</Label>
            <div className="grid grid-cols-3 gap-1 w-full">
              {(
                [
                  { value: 'bottom-left', label: '좌측' },
                  { value: 'bottom-center', label: '중앙' },
                  { value: 'bottom-right', label: '우측' },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => state.setCopyrightPosition(value)}
                  className={`flex items-center justify-center h-8 text-[11px] rounded-full border transition-colors
                    ${state.copyrightPosition === value
                      ? 'bg-primary/10 text-primary border-primary font-semibold'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[80px_1fr] items-center gap-2">
            <Label className="text-xs text-slate-500 font-medium">저작권 색상</Label>
            <div className="grid grid-cols-3 gap-1 w-full">
              {(
                [
                  { value: 'black', label: '검정색' },
                  { value: 'white', label: '흰색' },
                  { value: 'gray', label: '회색' },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => state.setCopyrightColor(value)}
                  className={`flex items-center justify-center h-8 text-[11px] rounded-full border transition-colors
                    ${state.copyrightColor === value
                      ? 'bg-primary/10 text-primary border-primary font-semibold'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
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
