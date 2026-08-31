import React from 'react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { LazyLayoutSettings } from '@/components/sidebar/LazySettings'
import { useTranslations } from 'next-intl'
import { MobileSheetHeader } from './MobileSheetHeader'
import { MobileSheetBody } from './MobileSheetBody'
import { MobileSheetAction } from './MobileSheetAction'

export function LayoutSheet({ open, onOpenChange, onNext, nextLabel }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNext: () => void
  nextLabel: string
}) {
  const t = useTranslations('MobileLayout')
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh] rounded-t-2xl bg-background">
        <MobileSheetHeader eyebrow={`02 / ${t('layoutSheetRole')}`} title={t('layoutSheetTitle')} description={t('layoutSheetDescription')} role={t('layoutSheetRole')} closeLabel={t('close')} />
        <MobileSheetBody open={open} className="custom-scrollbar overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom,1rem)+1.25rem)] pt-5">
          <LazyLayoutSettings />
        </MobileSheetBody>
        <MobileSheetAction label={nextLabel} onClick={onNext} />
      </DrawerContent>
    </Drawer>
  )
}
