import React from 'react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { LazyLayoutSettings } from '@/components/sidebar/LazySettings'
import { useTranslations } from 'next-intl'
import { MobileSheetHeader } from './MobileSheetHeader'
import { MobileSheetBody } from './MobileSheetBody'

export function LayoutSheet({ open, onOpenChange, onContinue }: { open: boolean; onOpenChange: (open: boolean) => void; onContinue?: () => void }) {
  const t = useTranslations('MobileLayout')
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh] rounded-t-2xl bg-background">
        <MobileSheetHeader open={open} onClose={() => onOpenChange(false)} eyebrow={t('layoutEyebrow')} title={t('layoutSheetTitle')} description={t('layoutSheetDescription')} />
        <MobileSheetBody open={open} className="custom-scrollbar overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,1rem)+1.25rem)] pt-5">
          <LazyLayoutSettings idPrefix="mobile-layout" showRatio={false} stickyContinue onContinue={onContinue ?? (() => {
            onOpenChange(false)
            window.dispatchEvent(new CustomEvent('xiv-frame:open-image'))
          })} />
        </MobileSheetBody>
      </DrawerContent>
    </Drawer>
  )
}
