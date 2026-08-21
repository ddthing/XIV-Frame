import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useTranslations } from 'next-intl'
import { TextOptionControl } from '../TextOptionControl'
import { EditorFieldHeader } from '@/components/ui/editor'
import { PositionGrid } from '@/components/ui/PositionGrid'
import { AlignGroup } from '@/components/ui/AlignGroup'
import { DEFAULT_SIGNATURE_FONT, FONT_MAP, POSITION_OPTIONS } from '@/constants/signature'

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
    <div className="space-y-4 font-sans">
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
        inputId="signature-upper-text"
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
        inputId="signature-lower-text"
      />

      <div className="space-y-5 border-t border-border pt-5">
        <div className="space-y-2">
          <Label className="block text-xs font-semibold text-foreground">{t('position')}</Label>
          <PositionGrid
            value={signaturePosition}
            options={POSITION_OPTIONS}
            onChange={setSignaturePosition}
          />
        </div>

        <div className="space-y-2">
          <Label className="block text-xs font-semibold text-foreground">{t('align')}</Label>
          <AlignGroup value={signatureAlign} onChange={setSignatureAlign} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signature-font" className="block text-xs font-semibold text-foreground">{t('font')}</Label>
          <Select value={fontFamily} onValueChange={(val) => val && setFontFamily(val)}>
            <SelectTrigger id="signature-font" aria-label={t('font')} className="h-10 w-full rounded-md border-border bg-background text-sm focus-visible:border-primary focus-visible:ring-primary">
              <span className="flex flex-1 text-left truncate">{FONT_MAP[fontFamily]}</span>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Pretendard" className="text-sm font-sans font-medium" style={{ fontFamily: DEFAULT_SIGNATURE_FONT }}>{t('fontDefault')}</SelectItem>
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
          <EditorFieldHeader label={t('size')} value={`${signatureSize}%`} htmlFor="signature-size" />
          <Slider 
            id="signature-size"
            value={[signatureSize]} 
            onValueChange={(vals) => setSignatureSize(Array.isArray(vals) ? vals[0] : vals)} 
            min={50} max={200} step={1} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signature-color" className="block text-xs font-semibold text-foreground">{t('color')}</Label>
          <div className="relative h-10 w-full cursor-pointer overflow-hidden rounded-md border border-border bg-background shadow-subtle transition-shadow focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1">
            <input 
              id="signature-color"
              type="color" 
              aria-label={t('color')}
              value={signatureColor} 
              onChange={(e) => setSignatureColor(e.target.value)}
              className="absolute -top-4 -left-4 w-[200%] h-[200%] cursor-pointer border-0 p-0 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <EditorFieldHeader label={t('opacity')} value={`${signatureOpacity}%`} htmlFor="signature-opacity" />
          <Slider 
            id="signature-opacity"
            value={[signatureOpacity]} 
            onValueChange={(vals) => setSignatureOpacity(Array.isArray(vals) ? vals[0] : vals)} 
            min={0} max={100} step={1} 
          />
        </div>
      </div>
    </div>
  )
}
