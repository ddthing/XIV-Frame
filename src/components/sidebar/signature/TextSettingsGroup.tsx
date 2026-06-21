import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useTranslations } from 'next-intl'
import { TextOptionControl } from '../TextOptionControl'
import { PositionGrid } from '@/components/ui/PositionGrid'
import { AlignGroup } from '@/components/ui/AlignGroup'
import { FONT_MAP, POSITION_OPTIONS } from '@/constants/signature'

export function TextSettingsGroup() {
  const {
    characterName, setCharacterName,
    serverName, setServerName,
    upperBold, setUpperBold,
    upperItalic, setUpperItalic,
    upperLetterSpacing, setUpperLetterSpacing,
    lowerBold, setLowerBold,
    lowerItalic, setLowerItalic,
    lowerLetterSpacing, setLowerLetterSpacing,
    signaturePosition, setSignaturePosition,
    signatureAlign, setSignatureAlign,
    fontFamily, setFontFamily,
    signatureSize, setSignatureSize,
    signatureColor, setSignatureColor,
    signatureOpacity, setSignatureOpacity
  } = useStore(useShallow(state => ({
    characterName: state.characterName,
    setCharacterName: state.setCharacterName,
    serverName: state.serverName,
    setServerName: state.setServerName,
    upperBold: state.upperBold,
    setUpperBold: state.setUpperBold,
    upperItalic: state.upperItalic,
    setUpperItalic: state.setUpperItalic,
    upperLetterSpacing: state.upperLetterSpacing,
    setUpperLetterSpacing: state.setUpperLetterSpacing,
    lowerBold: state.lowerBold,
    setLowerBold: state.setLowerBold,
    lowerItalic: state.lowerItalic,
    setLowerItalic: state.setLowerItalic,
    lowerLetterSpacing: state.lowerLetterSpacing,
    setLowerLetterSpacing: state.setLowerLetterSpacing,
    signaturePosition: state.signaturePosition,
    setSignaturePosition: state.setSignaturePosition,
    signatureAlign: state.signatureAlign,
    setSignatureAlign: state.setSignatureAlign,
    fontFamily: state.fontFamily,
    setFontFamily: state.setFontFamily,
    signatureSize: state.signatureSize,
    setSignatureSize: state.setSignatureSize,
    signatureColor: state.signatureColor,
    setSignatureColor: state.setSignatureColor,
    signatureOpacity: state.signatureOpacity,
    setSignatureOpacity: state.setSignatureOpacity
  })))
  const t = useTranslations('SignatureSettings')

  return (
    <div className="space-y-3 font-sans">
      <TextOptionControl
        label={t('upperText')}
        placeholder="Name"
        value={characterName}
        onChangeValue={setCharacterName}
        bold={upperBold}
        onChangeBold={setUpperBold}
        italic={upperItalic}
        onChangeItalic={setUpperItalic}
        letterSpacing={upperLetterSpacing}
        onChangeLetterSpacing={setUpperLetterSpacing}
      />

      <TextOptionControl
        label={t('lowerText')}
        placeholder="FINAL FANTASY XIV"
        value={serverName}
        onChangeValue={setServerName}
        bold={lowerBold}
        onChangeBold={setLowerBold}
        italic={lowerItalic}
        onChangeItalic={setLowerItalic}
        letterSpacing={lowerLetterSpacing}
        onChangeLetterSpacing={setLowerLetterSpacing}
      />

      <div className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground block">{t('position')}</Label>
          <PositionGrid
            value={signaturePosition}
            options={POSITION_OPTIONS}
            onChange={setSignaturePosition}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground block">{t('align')}</Label>
          <AlignGroup value={signatureAlign} onChange={setSignatureAlign} />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground block">{t('font')}</Label>
          <Select value={fontFamily} onValueChange={(val) => val && setFontFamily(val)}>
            <SelectTrigger className="text-sm h-10 w-full rounded-md border-border focus-visible:ring-primary focus-visible:border-primary">
              <span className="flex flex-1 text-left truncate">{FONT_MAP[fontFamily]}</span>
            </SelectTrigger>
            <SelectContent className="rounded-md">
              <SelectItem value="Pretendard" className="text-sm font-sans font-medium">{t('fontDefault')}</SelectItem>
              <SelectItem value="NexonMaplestory" className="text-sm font-medium" style={{ fontFamily: 'NexonMaplestory' }}>{t('fontMaplestory')}</SelectItem>
              <SelectItem value="TMoneyDungunbaram" className="text-sm font-medium" style={{ fontFamily: 'TMoneyDungunbaram' }}>{t('fontTmoney')}</SelectItem>
              <SelectItem value="OgRenaissanceSecret" className="text-sm font-medium" style={{ fontFamily: 'OgRenaissanceSecret' }}>{t('fontOg')}</SelectItem>
              <SelectItem value="Shouting" className="text-sm font-medium" style={{ fontFamily: 'Shouting' }}>{t('fontShouting')}</SelectItem>
              <SelectItem value="BookkMyungjo" className="text-sm font-medium" style={{ fontFamily: 'BookkMyungjo' }}>{t('fontBookk')}</SelectItem>
              <SelectItem value="x12y12pxMaruMinyaHangul" className="text-sm font-medium" style={{ fontFamily: 'x12y12pxMaruMinyaHangul' }}>{t('fontMaru')}</SelectItem>
              <SelectItem value="LotteriaChwapttaenggyeo" className="text-sm font-medium" style={{ fontFamily: 'LotteriaChwapttaenggyeo' }}>{t('fontLotteria')}</SelectItem>
              <SelectItem value="Bombaram" className="text-sm font-medium" style={{ fontFamily: 'Bombaram' }}>{t('fontBombaram')}</SelectItem>
              <SelectItem value="GoodNeighbor" className="text-sm font-medium" style={{ fontFamily: 'GoodNeighbor' }}>{t('fontGoodNeighbor')}</SelectItem>
              <SelectItem value="SlowGothic" className="text-sm font-medium" style={{ fontFamily: 'SlowGothic' }}>{t('fontSlowGothic')}</SelectItem>
              <SelectItem value="Ridibatang" className="text-sm font-medium" style={{ fontFamily: 'Ridibatang' }}>{t('fontRidibatang')}</SelectItem>
              <SelectItem value="Mulmaru" className="text-sm font-medium" style={{ fontFamily: 'Mulmaru' }}>{t('fontMulmaru')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex justify-between">
            {t('size')}
            <span className="text-muted-foreground">{signatureSize}%</span>
          </Label>
          <Slider 
            value={[signatureSize]} 
            onValueChange={(vals) => setSignatureSize(Array.isArray(vals) ? vals[0] : vals)} 
            min={50} max={200} step={1} 
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground block">{t('color')}</Label>
          <div className="relative w-full h-10 rounded-md overflow-hidden border border-border shadow-subtle cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 transition-shadow bg-background">
            <input 
              type="color" 
              aria-label={t('color')}
              value={signatureColor} 
              onChange={(e) => setSignatureColor(e.target.value)}
              className="absolute -top-4 -left-4 w-[200%] h-[200%] cursor-pointer border-0 p-0 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground flex justify-between">
            {t('opacity')}
            <span className="text-muted-foreground">{signatureOpacity}%</span>
          </Label>
          <Slider 
            value={[signatureOpacity]} 
            onValueChange={(vals) => setSignatureOpacity(Array.isArray(vals) ? vals[0] : vals)} 
            min={0} max={100} step={1} 
          />
        </div>
      </div>
    </div>
  )
}
