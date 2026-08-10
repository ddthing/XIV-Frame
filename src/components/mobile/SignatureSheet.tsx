import React from 'react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { SignatureSettings } from '@/components/sidebar/SignatureSettings'
import { useTranslations } from 'next-intl'
import { MobileSheetHeader } from './MobileSheetHeader'
import { MobileSheetBody } from './MobileSheetBody'

export function SignatureSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations('SignatureSettings')
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh] rounded-t-2xl bg-background">
        <MobileSheetHeader eyebrow="02 / Inspector" title={t('sheetTitle')} description={t('sheetDescription')} role={t('sheetRole')} />
        <MobileSheetBody open={open} className="custom-scrollbar overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,1rem)+1.25rem)] pt-5">
          <SignatureSettings />
        </MobileSheetBody>
      </DrawerContent>
    </Drawer>
  )
}
