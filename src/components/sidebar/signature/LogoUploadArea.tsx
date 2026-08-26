import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useStore } from '@/store/useStore'
import { useShallow } from 'zustand/react/shallow'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PositionGrid } from '@/components/ui/PositionGrid'
import { LOGO_POSITION_OPTIONS } from '@/constants/signature'
import { EditorFieldHeader } from '@/components/ui/editor'
import { ImageUploadError, validateImageFile } from '@/lib/imageUpload'

const MAX_LOGO_FILE_SIZE = 10 * 1024 * 1024
const MAX_LOGO_DIMENSION = 512
const MAX_LOGO_DATA_URL_LENGTH = 1_500_000

function getLogoUploadErrorMessage(error: unknown, t: (key: string) => string) {
  if (!(error instanceof ImageUploadError)) return t('logoUploadPrepareError')

  switch (error.code) {
    case 'invalid-type':
      return t('logoUploadFileTypeError')
    case 'too-large':
      return t('logoUploadTooLarge')
    case 'decode':
      return t('logoUploadDecodeError')
    case 'cancelled':
      return t('logoUploadCancelled')
    default:
      return t('logoUploadPrepareError')
  }
}

export function LogoUploadArea() {
  const {
    logoUrl, resetVersion, setLogoUrl,
    logoPosition, setLogoPosition,
    logoScale, setLogoScale,
    logoOpacity, setLogoOpacity
  } = useStore(useShallow(state => ({
    logoUrl: state.logoUrl,
    resetVersion: state.resetVersion,
    setLogoUrl: state.setLogoUrl,
    logoPosition: state.logoPosition,
    setLogoPosition: state.setLogoPosition,
    logoScale: state.logoScale,
    setLogoScale: state.setLogoScale,
    logoOpacity: state.logoOpacity,
    setLogoOpacity: state.setLogoOpacity
  })))
  const t = useTranslations('SignatureSettings')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const uploadRequestRef = useRef(0)
  const readerRef = useRef<FileReader | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cancelPendingUpload = useCallback(() => {
    uploadRequestRef.current += 1

    const reader = readerRef.current
    readerRef.current = null
    if (reader) {
      reader.onload = null
      reader.onerror = null
      reader.onabort = null
      if (reader.readyState === FileReader.LOADING) reader.abort()
    }

    const image = imageRef.current
    imageRef.current = null
    if (image) {
      image.onload = null
      image.onerror = null
      image.src = ''
    }
  }, [])

  useEffect(() => cancelPendingUpload, [cancelPendingUpload])

  useEffect(() => {
    cancelPendingUpload()
  }, [cancelPendingUpload, resetVersion])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    // Clear the input so selecting the same file again still fires onChange.
    event.currentTarget.value = ''
    if (!file) return

    cancelPendingUpload()
    const requestId = uploadRequestRef.current
    const resetVersionAtStart = useStore.getState().resetVersion
    const isStale = () => (
      requestId !== uploadRequestRef.current
      || useStore.getState().resetVersion !== resetVersionAtStart
    )
    setUploadError(null)

    try {
      validateImageFile(file, MAX_LOGO_FILE_SIZE)
    } catch (cause) {
      if (isStale()) return
      setUploadError(getLogoUploadErrorMessage(cause, t))
      return
    }

    const reader = new FileReader()
    readerRef.current = reader
    const releaseReader = () => {
      if (readerRef.current === reader) readerRef.current = null
      reader.onload = null
      reader.onerror = null
      reader.onabort = null
    }
    reader.onerror = () => {
      releaseReader()
      if (!isStale()) setUploadError(t('logoUploadReadError'))
    }
    reader.onload = () => {
      releaseReader()
      if (isStale()) return
      const dataUrl = typeof reader.result === 'string' ? reader.result : null
      if (!dataUrl) {
        setUploadError(t('logoUploadReadError'))
        return
      }

      const img = new Image()
      imageRef.current = img
      const releaseImage = () => {
        if (imageRef.current === img) imageRef.current = null
        img.onload = null
        img.onerror = null
        img.src = ''
      }
      img.onerror = () => {
        releaseImage()
        if (!isStale()) setUploadError(t('logoUploadDecodeError'))
      }
      img.onload = () => {
        if (isStale()) {
          releaseImage()
          return
        }
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
            setUploadError(t('logoUploadPrepareError'))
          }
        } catch {
          if (!isStale()) setUploadError(t('logoUploadPrepareError'))
        } finally {
          releaseImage()
        }
      }
      img.src = dataUrl
    }

    try {
      reader.readAsDataURL(file)
    } catch {
      releaseReader()
      if (!isStale()) setUploadError(t('logoUploadReadError'))
    }
  }

  const handleDelete = () => {
    cancelPendingUpload()
    setLogoUrl(null)
    setUploadError(null)
  }

  return (
    <div className="space-y-5 font-sans">
      {!logoUrl ? (
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-dashed border-primary/25 bg-card shadow-subtle transition-colors hover:bg-surface-inset/60 focus-within:ring-2 focus-within:ring-primary">
          <div aria-hidden="true" className="pointer-events-none flex size-full cursor-pointer flex-col items-center justify-center">
            <span className="mb-3 grid size-9 place-items-center rounded-md bg-surface-inset text-foreground"><Upload className="size-4" /></span>
            <span className="text-xs font-semibold text-muted-foreground">{t('logoUploadLabel')}</span>
          </div>
          <input
            ref={fileInputRef}
            id="logo-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
            aria-label={t('logoUploadLabel')}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            id="logo-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            aria-label={t('logoUploadLabel')}
          />
          <div className="group relative flex aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
            <button 
              aria-label={t('logoDelete')}
               onClick={handleDelete}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-md border border-border bg-background text-foreground shadow-subtle transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="h-10 flex-1 rounded-md" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-3.5" aria-hidden="true" /> {t('logoChange')}
            </Button>
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
        <p role="alert" className="font-body text-[11px] leading-4 text-destructive">
          {uploadError}
        </p>
      )}
    </div>
  )
}
