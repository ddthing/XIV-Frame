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
  const t = useTranslations('SignatureSettings')
  return (
    <div className="grid grid-cols-3 gap-1 w-full">
      {options.map(({ value: optVal, label, icon }) => (
        <button
          key={optVal}
          type="button"
          aria-label={t(label as any)}
          title={t(label as any)}
          onClick={() => onChange(optVal)}
          className={`flex items-center justify-center h-9 rounded-sm border transition-all
            ${value === optVal
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary'
            }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

function AlignGroup({ value, onChange }: { value: SignatureAlign; onChange: (v: SignatureAlign) => void }) {
  const t = useTranslations('SignatureSettings')
  return (
    <div className="flex gap-1">
      {ALIGN_OPTIONS.map(({ value: optVal, label, icon }) => (
        <button
          key={optVal}
          type="button"
          aria-label={t(label as any)}
          title={t(label as any)}
          onClick={() => onChange(optVal)}
          className={`flex-1 flex items-center justify-center h-9 rounded-sm border transition-all
            ${value === optVal
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary'
            }`}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}

import { useTranslations } from 'next-intl'

export function SignatureSettings() {
  const state = useStore()
  const t = useTranslations('SignatureSettings')

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
      <TabsList className="grid w-full grid-cols-2 mb-4 h-10 bg-muted p-1 rounded-sm">
        <TabsTrigger value="text" className="text-xs rounded-sm">{t('tabText')}</TabsTrigger>
        <TabsTrigger value="logo" className="text-xs rounded-sm">{t('tabLogo')}</TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="space-y-3">
        <TextOptionControl
          label={t('upperText')}
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
          label={t('lowerText')}
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

        <div className="pt-3 border-t border-border space-y-3">
          <div className="grid grid-cols-[80px_1fr] items-start gap-2">
            <Label className="text-xs text-muted-foreground font-medium mt-2.5">{t('position')}</Label>
            <PositionGrid
              value={state.signaturePosition}
              options={POSITION_OPTIONS}
              onChange={state.setSignaturePosition}
            />
          </div>

        <div className="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label className="text-xs text-muted-foreground font-medium">{t('align')}</Label>
          <AlignGroup value={state.signatureAlign} onChange={state.setSignatureAlign} />
        </div>

        <div className="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label className="text-xs text-muted-foreground font-medium">{t('font')}</Label>
          <Select value={state.fontFamily} onValueChange={(val) => val && state.setFontFamily(val)}>
            <SelectTrigger className="text-xs h-10 w-full rounded-sm">
              <span className="flex flex-1 text-left truncate">{FONT_MAP[state.fontFamily]}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pretendard" className="text-xs font-sans font-medium">{t('fontDefault')}</SelectItem>
              <SelectItem value="NexonMaplestory" className="text-xs font-medium" style={{ fontFamily: 'NexonMaplestory' }}>{t('fontMaplestory')}</SelectItem>
              <SelectItem value="TMoneyDungunbaram" className="text-xs font-medium" style={{ fontFamily: 'TMoneyDungunbaram' }}>{t('fontTmoney')}</SelectItem>
              <SelectItem value="OgRenaissanceSecret" className="text-xs font-medium" style={{ fontFamily: 'OgRenaissanceSecret' }}>{t('fontOg')}</SelectItem>
              <SelectItem value="Shouting" className="text-xs font-medium" style={{ fontFamily: 'Shouting' }}>{t('fontShouting')}</SelectItem>
              <SelectItem value="BookkMyungjo" className="text-xs font-medium" style={{ fontFamily: 'BookkMyungjo' }}>{t('fontBookk')}</SelectItem>
              <SelectItem value="x12y12pxMaruMinyaHangul" className="text-xs font-medium" style={{ fontFamily: 'x12y12pxMaruMinyaHangul' }}>{t('fontMaru')}</SelectItem>
              <SelectItem value="LotteriaChwapttaenggyeo" className="text-xs font-medium" style={{ fontFamily: 'LotteriaChwapttaenggyeo' }}>{t('fontLotteria')}</SelectItem>
              <SelectItem value="Bombaram" className="text-xs font-medium" style={{ fontFamily: 'Bombaram' }}>{t('fontBombaram')}</SelectItem>
              <SelectItem value="GoodNeighbor" className="text-xs font-medium" style={{ fontFamily: 'GoodNeighbor' }}>{t('fontGoodNeighbor')}</SelectItem>
              <SelectItem value="SlowGothic" className="text-xs font-medium" style={{ fontFamily: 'SlowGothic' }}>{t('fontSlowGothic')}</SelectItem>
              <SelectItem value="Ridibatang" className="text-xs font-medium" style={{ fontFamily: 'Ridibatang' }}>{t('fontRidibatang')}</SelectItem>
              <SelectItem value="Mulmaru" className="text-xs font-medium" style={{ fontFamily: 'Mulmaru' }}>{t('fontMulmaru')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
          <Label className="text-xs text-muted-foreground font-medium">{t('size')}</Label>
          <Slider 
            value={[state.signatureSize]} 
            onValueChange={(vals) => state.setSignatureSize(Array.isArray(vals) ? vals[0] : vals)} 
            min={50} max={200} step={1} 
          />
          <span className="text-xs text-right text-muted-foreground font-medium">{state.signatureSize}%</span>
        </div>

        <div className="grid grid-cols-[80px_1fr] items-center gap-2">
          <Label className="text-xs text-muted-foreground font-medium">{t('color')}</Label>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-sm overflow-hidden border border-border shadow-sm cursor-pointer shrink-0">
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
          <Label className="text-xs text-muted-foreground font-medium">{t('opacity')}</Label>
          <Slider 
            value={[state.signatureOpacity]} 
            onValueChange={(vals) => state.setSignatureOpacity(Array.isArray(vals) ? vals[0] : vals)} 
            min={0} max={100} step={1} 
          />
          <span className="text-xs text-right text-muted-foreground font-medium">{state.signatureOpacity}%</span>
        </div>
        </div>
      </TabsContent>

      <TabsContent value="logo" className="space-y-3">
        {!state.logoUrl ? (
          <div 
            onClick={handleLogoUpload}
            className="w-full aspect-[2/1] rounded-sm border-2 border-dashed border-border bg-background flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors"
          >
            <Upload className="w-5 h-5 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground font-medium">{t('logoUploadLabel')}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative w-full aspect-[2/1] bg-muted rounded-sm border border-border overflow-hidden flex items-center justify-center group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.logoUrl} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
              <button 
                aria-label={t('logoDelete')}
                onClick={() => state.setLogoUrl(null)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-sm hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-[80px_1fr] items-start gap-2">
              <Label className="text-xs text-muted-foreground font-medium mt-2.5">{t('position')}</Label>
              <PositionGrid
                value={state.logoPosition}
                options={LOGO_POSITION_OPTIONS}
                onChange={state.setLogoPosition}
              />
            </div>
            
            <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
              <Label className="text-xs text-muted-foreground font-medium">{t('size')}</Label>
              <Slider 
                value={[state.logoScale]} 
                onValueChange={(vals) => state.setLogoScale(Array.isArray(vals) ? vals[0] : vals)} 
                min={10} max={200} step={1} 
              />
              <span className="text-xs text-right text-muted-foreground font-medium">{state.logoScale}%</span>
            </div>

            <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
              <Label className="text-xs text-muted-foreground font-medium">{t('opacity')}</Label>
              <Slider 
                value={[state.logoOpacity]} 
                onValueChange={(vals) => state.setLogoOpacity(Array.isArray(vals) ? vals[0] : vals)} 
                min={0} max={100} step={1} 
              />
              <span className="text-xs text-right text-muted-foreground font-medium">{state.logoOpacity}%</span>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
