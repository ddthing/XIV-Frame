import { Tabs, TabsContent } from '@/components/ui/tabs'
import { SketchbookTabsList, SketchbookTabsTrigger } from '@/components/ui/SketchbookTabs'
import { TextSettingsGroup } from './signature/TextSettingsGroup'
import { LogoUploadArea } from './signature/LogoUploadArea'
import { useTranslations } from 'next-intl'

export function SignatureSettings() {
  const t = useTranslations('SignatureSettings')

  return (
    <Tabs defaultValue="text" className="w-full font-sans">
      <SketchbookTabsList className="grid grid-cols-2 mb-6">
        <SketchbookTabsTrigger value="text">{t('tabText')}</SketchbookTabsTrigger>
        <SketchbookTabsTrigger value="logo">{t('tabLogo')}</SketchbookTabsTrigger>
      </SketchbookTabsList>

      <TabsContent value="text" className="space-y-3">
        <TextSettingsGroup />
      </TabsContent>

      <TabsContent value="logo" className="space-y-3">
        <LogoUploadArea />
      </TabsContent>
    </Tabs>
  )
}
