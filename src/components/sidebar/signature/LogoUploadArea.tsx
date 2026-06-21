import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PositionGrid } from '@/components/ui/PositionGrid'
import { LOGO_POSITION_OPTIONS } from '@/constants/signature'

export function LogoUploadArea() {
  const {
    logoUrl, setLogoUrl,
    logoPosition, setLogoPosition,
    logoScale, setLogoScale,
    logoOpacity, setLogoOpacity
  } = useStore(useShallow(state => ({
    logoUrl: state.logoUrl,
    setLogoUrl: state.setLogoUrl,
    logoPosition: state.logoPosition,
    setLogoPosition: state.setLogoPosition,
    logoScale: state.logoScale,
    setLogoScale: state.setLogoScale,
    logoOpacity: state.logoOpacity,
    setLogoOpacity: state.setLogoOpacity
  })))
  const t = useTranslations('SignatureSettings')

  const handleLogoUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string
          
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            let width = img.width
            let height = img.height
            const MAX_SIZE = 800 // Prevent localStorage quota exceeded

            if (width > MAX_SIZE || height > MAX_SIZE) {
              if (width > height) {
                height = Math.round((height * MAX_SIZE) / width)
                width = MAX_SIZE
              } else {
                width = Math.round((width * MAX_SIZE) / height)
                height = MAX_SIZE
              }
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0, width, height)
            
            const resizedDataUrl = canvas.toDataURL('image/png')
            setLogoUrl(resizedDataUrl)
          }
          img.src = dataUrl
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleLogoUpload()
    }
  }

  return (
    <div className="space-y-4 font-sans">
      {!logoUrl ? (
        <div 
          role="button"
          tabIndex={0}
          onClick={handleLogoUpload}
          onKeyDown={handleKeyDown}
          className="w-full aspect-[2/1] rounded-xl border border-border bg-background shadow-subtle flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        >
          <Upload className="w-5 h-5 text-muted-foreground mb-2" />
          <span className="text-sm font-medium text-muted-foreground">{t('logoUploadLabel')}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative w-full aspect-[2/1] bg-background shadow-subtle rounded-xl border border-border overflow-hidden flex items-center justify-center group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
            <button 
              aria-label={t('logoDelete')}
              onClick={() => setLogoUrl(null)}
              className="absolute top-2 right-2 bg-background text-foreground p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive shadow-subtle border border-border transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground block">{t('position')}</Label>
            <PositionGrid
              value={logoPosition}
              options={LOGO_POSITION_OPTIONS}
              onChange={setLogoPosition}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex justify-between">
              {t('size')}
              <span className="text-muted-foreground">{logoScale}%</span>
            </Label>
            <Slider 
              value={[logoScale]} 
              onValueChange={(vals) => setLogoScale(Array.isArray(vals) ? vals[0] : vals)} 
              min={10} max={200} step={1} 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex justify-between">
              {t('opacity')}
              <span className="text-muted-foreground">{logoOpacity}%</span>
            </Label>
            <Slider 
              value={[logoOpacity]} 
              onValueChange={(vals) => setLogoOpacity(Array.isArray(vals) ? vals[0] : vals)} 
              min={0} max={100} step={1} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
