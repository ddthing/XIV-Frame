import { ImagePlus, Type } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Tabs, TabsContent } from '@/components/ui/tabs'
import { SketchbookTabsList, SketchbookTabsTrigger } from '@/components/ui/SketchbookTabs'
import { CopyrightSettings } from './signature/CopyrightSettings'
import { LogoUploadArea } from './signature/LogoUploadArea'
import { TextSettingsGroup } from './signature/TextSettingsGroup'

export function SignatureSettings() {
  const t = useTranslations('SignatureSettings')

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text" className="w-full">
        <SketchbookTabsList className="h-11">
          <SketchbookTabsTrigger value="text" className="gap-2">
            <Type className="size-3.5" aria-hidden="true" />
            {t('tabText')}
          </SketchbookTabsTrigger>
          <SketchbookTabsTrigger value="logo" className="gap-2">
            <ImagePlus className="size-3.5" aria-hidden="true" />
            {t('tabLogo')}
          </SketchbookTabsTrigger>
        </SketchbookTabsList>

        <TabsContent value="text" className="mt-5 space-y-4 focus-visible:outline-none">
          <TextSettingsGroup />
          <CopyrightSettings />
        </TabsContent>

        <TabsContent value="logo" className="mt-5 space-y-4 focus-visible:outline-none">
          <LogoUploadArea />
        </TabsContent>

      </Tabs>

    </div>
  )
}
