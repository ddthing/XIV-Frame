import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { LazySignatureSettings } from '@/components/sidebar/LazySettings'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store/useStore'
import { MobileSheetHeader } from './MobileSheetHeader'
import { MobileSheetBody } from './MobileSheetBody'

export function SignatureSheet({ open, onOpenChange, onContinue }: { open: boolean; onOpenChange: (open: boolean) => void; onContinue?: () => void }) {
  const t = useTranslations('SignatureSettings')
  const settingsT = useTranslations('SettingsPanel')
  const mobileT = useTranslations('MobileLayout')
  const imageCount = useStore(state => state.images.filter(Boolean).length)
  const emptySignatureHintId = 'mobile-signature-empty-hint'

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
      return
    }

    onOpenChange(false)
    window.dispatchEvent(new CustomEvent('xiv-frame:open-export'))
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh] rounded-t-2xl bg-background">
        <MobileSheetHeader open={open} onClose={() => onOpenChange(false)} eyebrow={mobileT('signatureEyebrow')} title={t('sheetTitle')} description={t('sheetDescription')} />
        <MobileSheetBody open={open} className="custom-scrollbar overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,1rem)+1.25rem)] pt-5">
          <LazySignatureSettings idPrefix="mobile-signature" />
          {imageCount === 0 && (
            <p id={emptySignatureHintId} className="mt-5 font-body text-xs leading-5 text-muted-foreground">
              {mobileT('emptySignatureHint')}
            </p>
          )}
          <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex items-center justify-end bg-background/95 px-5 pb-1 pt-4 backdrop-blur-sm">
            <Button type="button" size="sm" className="h-10 rounded-md px-3 text-xs" onClick={handleContinue} disabled={imageCount === 0} aria-describedby={imageCount === 0 ? emptySignatureHintId : undefined}>
              {settingsT('nextExport')}
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </MobileSheetBody>
      </DrawerContent>
    </Drawer>
  )
}
