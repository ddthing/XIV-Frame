import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PositionGrid } from '@/components/ui/PositionGrid'
import { LOGO_POSITION_OPTIONS } from '@/constants/signature'
import { EditorFieldHeader } from '@/components/ui/editor'

const MAX_LOGO_FILE_SIZE = 10 * 1024 * 1024
const MAX_LOGO_DIMENSION = 512
const MAX_LOGO_DATA_URL_LENGTH = 1_500_000

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleLogoUpload = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    // Clear the input so selecting the same file again still fires onChange.
    event.currentTarget.value = ''
    if (!file) return

    setUploadError(null)
    if (file.size > MAX_LOGO_FILE_SIZE) {
      setUploadError(t('logoUploadTooLarge'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => setUploadError(t('logoUploadError'))
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null
      if (!dataUrl) {
        setUploadError(t('logoUploadError'))
        return
      }

      const img = new Image()
      img.onerror = () => setUploadError(t('logoUploadError'))
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const sourceWidth = img.naturalWidth || img.width
          const sourceHeight = img.naturalHeight || img.height
          const scale = Math.min(1, MAX_LOGO_DIMENSION / Math.max(sourceWidth, sourceHeight))
          const width = Math.max(1, Math.round(sourceWidth * scale))
          const height = Math.max(1, Math.round(sourceHeight * scale))

          canvas.width = width
          canvas.height = height
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Canvas context unavailable')
          context.drawImage(img, 0, 0, width, height)

          // WebP keeps transparency while reducing the persisted payload.
          const webpDataUrl = canvas.toDataURL('image/webp', 0.82)
          const resizedDataUrl = webpDataUrl.startsWith('data:image/webp')
            ? webpDataUrl
            : canvas.toDataURL('image/png')

          if (resizedDataUrl.length > MAX_LOGO_DATA_URL_LENGTH) {
            setUploadError(t('logoUploadTooLarge'))
            return
          }

          try {
            setLogoUrl(resizedDataUrl)
            setUploadError(null)
          } catch {
            setUploadError(t('logoUploadError'))
          }
        } catch {
          setUploadError(t('logoUploadError'))
        }
      }
      img.src = dataUrl
    }

    try {
      reader.readAsDataURL(file)
    } catch {
      setUploadError(t('logoUploadError'))
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleLogoUpload()
    }
  }

  return (
    <div className="space-y-5 font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        tabIndex={-1}
        onChange={handleFileChange}
        className="hidden"
        aria-label={t('logoUploadLabel')}
      />
      {!logoUrl ? (
        <div 
          role="button"
          tabIndex={0}
          onClick={handleLogoUpload}
          onKeyDown={handleKeyDown}
          className="flex aspect-[2/1] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/25 bg-card shadow-subtle transition-colors hover:bg-surface-inset/60 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="mb-3 grid size-9 place-items-center rounded-md bg-surface-inset text-foreground"><Upload className="size-4" /></span>
          <span className="text-xs font-semibold text-muted-foreground">{t('logoUploadLabel')}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="group relative flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
            <button 
              aria-label={t('logoDelete')}
              onClick={() => setLogoUrl(null)}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-md border border-border bg-background text-foreground opacity-0 shadow-subtle transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
          
          <div className="space-y-2">
            <Label className="block text-xs font-semibold text-foreground">{t('position')}</Label>
            <PositionGrid
              value={logoPosition}
              options={LOGO_POSITION_OPTIONS}
              onChange={setLogoPosition}
            />
          </div>
          
          <div className="space-y-2">
            <EditorFieldHeader label={t('size')} value={`${logoScale}%`} htmlFor="logo-scale" />
            <Slider 
              id="logo-scale"
              value={[logoScale]} 
              onValueChange={(vals) => setLogoScale(Array.isArray(vals) ? vals[0] : vals)} 
              min={10} max={200} step={1} 
            />
          </div>

          <div className="space-y-2">
            <EditorFieldHeader label={t('opacity')} value={`${logoOpacity}%`} htmlFor="logo-opacity" />
            <Slider 
              id="logo-opacity"
              value={[logoOpacity]} 
              onValueChange={(vals) => setLogoOpacity(Array.isArray(vals) ? vals[0] : vals)} 
              min={0} max={100} step={1} 
            />
          </div>
        </div>
      )}
      {uploadError && (
        <p role="alert" className="text-[11px] leading-4 text-destructive">
          {uploadError}
        </p>
      )}
    </div>
  )
}
