import React from 'react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { LazySignatureSettings } from '@/components/sidebar/LazySettings'
import { useTranslations } from 'next-intl'
import { MobileSheetHeader } from './MobileSheetHeader'
import { MobileSheetBody } from './MobileSheetBody'

export function SignatureSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations('SignatureSettings')
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh] rounded-t-2xl bg-background">
        <MobileSheetHeader eyebrow="03 / Inspector" title={t('sheetTitle')} description={t('sheetDescription')} role={t('sheetRole')} closeLabel={t('close')} />
        <MobileSheetBody open={open} className="custom-scrollbar overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,1rem)+1.25rem)] pt-5">
          <LazySignatureSettings />
        </MobileSheetBody>
      </DrawerContent>
    </Drawer>
  )
}
