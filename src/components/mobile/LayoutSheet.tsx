import React from 'react'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { LayoutSettings } from '@/components/sidebar/LayoutSettings'

export function LayoutSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-slate-50">
        <DrawerTitle className="sr-only">레이아웃 설정</DrawerTitle>
        <div className="p-4 pb-[calc(env(safe-area-inset-bottom,1rem)+1rem)] custom-scrollbar overflow-y-auto">
          <div className="space-y-6">
            <LayoutSettings />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
