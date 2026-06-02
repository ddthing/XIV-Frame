import { useStore, SignaturePosition, SignatureAlign } from '@/store/useStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, X, Bold, Italic } from 'lucide-react'
import { TextOptionControl } from './TextOptionControl'

import { FONT_MAP, POSITION_OPTIONS, LOGO_POSITION_OPTIONS, ALIGN_OPTIONS } from '@/constants/signature'

function PositionGrid({ value, options, onChange }: {
  value: SignaturePosition,
  options: { value: SignaturePosition; label: string; icon: React.ReactNode }[],
  onChange: (v: SignaturePosition) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-1 w-full">
      {options.map(({ value: optVal, label, icon }) => (
        <button
          key={optVal}
          type="button"
          aria-label={label}
          title={label}
          onClick={() => onChange(optVal)}
          className={`flex items-center justify-center h-9 rounded-full border transition-all
            ${value === optVal
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-white text-slate-400 border-slate-200 hover:border-primary/50 hover:text-primary'
            }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

function AlignGroup({ value, onChange }: { value: SignatureAlign; onChange: (v: SignatureAlign) => void }) {
  return (
    <div className="flex gap-1">
      {ALIGN_OPTIONS.map(({ value: optVal, label, icon }) => (
        <button
          key={optVal}
          type="button"
          aria-label={label}
          title={label}
          onClick={() => onChange(optVal)}
          className={`flex-1 flex items-center justify-center h-9 rounded-full border transition-all
            ${value === optVal
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-white text-slate-400 border-slate-200 hover:border-primary/50 hover:text-primary'
            }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

export function SignatureSettings() {
  const state = useStore()

  const handleLogoUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const url = URL.createObjectURL(file)
        state.setLogoUrl(url)
      }
    }
    input.click()
  }

  return (
    <Tabs defaultValue="text" className="w-full mt-2">
      <TabsList className="grid w-full grid-cols-3 mb-4 rounded-full h-10 bg-slate-100 p-1">
        <TabsTrigger value="text" className="text-xs rounded-full">텍스트</TabsTrigger>
        <TabsTrigger value="style" className="text-xs rounded-full">스타일</TabsTrigger>
        <TabsTrigger value="logo" className="text-xs rounded-full">로고 업로드</TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="space-y-4">
        <TextOptionControl
          label="상단 텍스트"
          placeholder="Name"
          value={state.characterName}
          onChangeValue={state.setCharacterName}
          bold={state.upperBold}
          onChangeBold={state.setUpperBold}
          italic={state.upperItalic}
          onChangeItalic={state.setUpperItalic}
          letterSpacing={state.upperLetterSpacing}
          onChangeLetterSpacing={state.setUpperLetterSpacing}
        />

        <TextOptionControl
          label="하단 텍스트"
          placeholder="FINAL FANTASY XIV"
          value={state.serverName}
          onChangeValue={state.setServerName}
          bold={state.lowerBold}
          onChangeBold={state.setLowerBold}
          italic={state.lowerItalic}
          onChangeItalic={state.setLowerItalic}
          letterSpacing={state.lowerLetterSpacing}
          onChangeLetterSpacing={state.setLowerLetterSpacing}
        />
      </TabsContent>

      <TabsContent value="style" className="space-y-4">
        <div className="grid grid-cols-[80px_1fr] items-start gap-2">
          <Label className="text-xs text-slate-500 font-medium mt-2.5">위치</Label>
          <PositionGrid
            value={state.signaturePosition}
            options={POSITION_OPTIONS}
            onChange={state.setSignaturePosition}
          />
        </div>

        <div className="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label className="text-xs text-slate-500 font-medium">정렬</Label>
          <AlignGroup value={state.signatureAlign} onChange={state.setSignatureAlign} />
        </div>

        <div className="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label className="text-xs text-slate-500 font-medium">글꼴</Label>
          <Select value={state.fontFamily} onValueChange={(val) => val && state.setFontFamily(val)}>
            <SelectTrigger className="text-xs h-10 w-full rounded-full">
              <span className="flex flex-1 text-left truncate">{FONT_MAP[state.fontFamily]}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pretendard" className="text-xs font-sans font-medium">기본 (Pretendard)</SelectItem>
              <SelectItem value="NexonMaplestory" className="text-xs font-medium" style={{ fontFamily: 'NexonMaplestory' }}>넥슨 메이플스토리</SelectItem>
              <SelectItem value="TMoneyDungunbaram" className="text-xs font-medium" style={{ fontFamily: 'TMoneyDungunbaram' }}>티머니 둥근바람</SelectItem>
              <SelectItem value="OgRenaissanceSecret" className="text-xs font-medium" style={{ fontFamily: 'OgRenaissanceSecret' }}>OG 르네상스 비밀</SelectItem>
              <SelectItem value="Shouting" className="text-xs font-medium" style={{ fontFamily: 'Shouting' }}>샤우팅체</SelectItem>
              <SelectItem value="BookkMyungjo" className="text-xs font-medium" style={{ fontFamily: 'BookkMyungjo' }}>부크크 명조</SelectItem>
              <SelectItem value="x12y12pxMaruMinyaHangul" className="text-xs font-medium" style={{ fontFamily: 'x12y12pxMaruMinyaHangul' }}>마루미냐 한글</SelectItem>
              <SelectItem value="LotteriaChwapttaenggyeo" className="text-xs font-medium" style={{ fontFamily: 'LotteriaChwapttaenggyeo' }}>롯데리아 촵땡겨체</SelectItem>
              <SelectItem value="HsBombaram30" className="text-xs font-medium" style={{ fontFamily: 'HsBombaram30' }}>봄바람체 3.0</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
          <Label className="text-xs text-slate-500 font-medium">크기</Label>
          <div className="px-2">
            <Slider 
              value={[state.signatureSize]} 
              onValueChange={(vals) => state.setSignatureSize(Array.isArray(vals) ? vals[0] : vals)} 
              min={50} max={200} step={1} 
            />
          </div>
          <span className="text-xs text-right text-slate-500 font-medium">{state.signatureSize}%</span>
        </div>

        <div className="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label className="text-xs text-slate-500 font-medium">색상</Label>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm cursor-pointer shrink-0">
              <input 
                type="color" 
                value={state.signatureColor} 
                onChange={(e) => state.setSignatureColor(e.target.value)}
                className="absolute -top-4 -left-4 w-16 h-16 cursor-pointer border-0 p-0"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
          <Label className="text-xs text-slate-500 font-medium">불투명도</Label>
          <div className="px-2">
            <Slider 
              value={[state.signatureOpacity]} 
              onValueChange={(vals) => state.setSignatureOpacity(Array.isArray(vals) ? vals[0] : vals)} 
              min={0} max={100} step={1} 
            />
          </div>
          <span className="text-xs text-right text-slate-500 font-medium">{state.signatureOpacity}%</span>
        </div>
      </TabsContent>

      <TabsContent value="logo" className="space-y-4">
        {!state.logoUrl ? (
          <div 
            onClick={handleLogoUpload}
            className="w-full aspect-[2/1] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <Upload className="w-5 h-5 text-slate-400 mb-2" />
            <span className="text-xs text-slate-500 font-medium">로고 이미지 업로드 (PNG 권장)</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full aspect-[2/1] bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden flex items-center justify-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.logoUrl} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
              <button 
                aria-label="로고 삭제"
                onClick={() => state.setLogoUrl(null)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-[80px_1fr] items-start gap-2">
              <Label className="text-xs text-slate-500 font-medium mt-2.5">위치</Label>
              <PositionGrid
                value={state.logoPosition}
                options={LOGO_POSITION_OPTIONS}
                onChange={state.setLogoPosition}
              />
            </div>
            
            <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
              <Label className="text-xs text-slate-500 font-medium">크기</Label>
              <div className="px-2">
                <Slider 
                  value={[state.logoScale]} 
                  onValueChange={(vals) => state.setLogoScale(Array.isArray(vals) ? vals[0] : vals)} 
                  min={10} max={200} step={1} 
                />
              </div>
              <span className="text-xs text-right text-slate-500 font-medium">{state.logoScale}%</span>
            </div>

            <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
              <Label className="text-xs text-slate-500 font-medium">불투명도</Label>
              <div className="px-2">
                <Slider 
                  value={[state.logoOpacity]} 
                  onValueChange={(vals) => state.setLogoOpacity(Array.isArray(vals) ? vals[0] : vals)} 
                  min={0} max={100} step={1} 
                />
              </div>
              <span className="text-xs text-right text-slate-500 font-medium">{state.logoOpacity}%</span>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
