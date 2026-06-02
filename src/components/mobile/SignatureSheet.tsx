import React from 'react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { SignatureSettings } from '@/components/sidebar/SignatureSettings'

export function SignatureSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-slate-50">
        <DrawerTitle className="sr-only">시그니처 설정</DrawerTitle>
        <div className="p-4 pb-[calc(env(safe-area-inset-bottom,1rem)+1rem)] custom-scrollbar overflow-y-auto">
          <SignatureSettings />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
