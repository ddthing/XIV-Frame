import React from 'react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { ImageUploader } from '@/components/sidebar/ImageUploader'
import { useTranslations } from 'next-intl'

export function ImageSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations('ImageUploader')
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-background">
        <DrawerTitle className="sr-only">{t('sheetTitle')}</DrawerTitle>
        <div className="p-4 pb-[calc(env(safe-area-inset-bottom,1rem)+1rem)] custom-scrollbar overflow-y-auto">
          <ImageUploader />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
