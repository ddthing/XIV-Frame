import React from 'react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { LayoutSettings } from '@/components/sidebar/LayoutSettings'
import { useTranslations } from 'next-intl'

export function LayoutSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations('MobileLayout')
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-background">
        <DrawerTitle className="sr-only">{t('sheetTitle')}</DrawerTitle>
        <div className="p-4 pb-[calc(env(safe-area-inset-bottom,1rem)+1rem)] custom-scrollbar overflow-y-auto">
          <div className="space-y-6">
            <LayoutSettings />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
