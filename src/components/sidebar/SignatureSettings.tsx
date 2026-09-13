import { ImagePlus, Type } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CopyrightSettings } from './signature/CopyrightSettings'
import { LogoUploadArea } from './signature/LogoUploadArea'
import { TextSettingsGroup } from './signature/TextSettingsGroup'

export function SignatureSettings({ idPrefix = 'signature' }: { idPrefix?: string }) {
  const t = useTranslations('SignatureSettings')

  return (
    <div className="space-y-6">
      <Accordion multiple defaultValue={['text']} className="gap-1" aria-label={t('sheetTitle')}>
        <AccordionItem value="text">
          <AccordionTrigger className="min-h-12 py-3 hover:no-underline">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Type className="size-4 text-muted-foreground" aria-hidden="true" />
              {t('tabText')}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4">
              <TextSettingsGroup idPrefix={`${idPrefix}-text`} />
              <CopyrightSettings />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="logo">
          <AccordionTrigger className="min-h-12 py-3 hover:no-underline">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ImagePlus className="size-4 text-muted-foreground" aria-hidden="true" />
              {t('tabLogo')}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <LogoUploadArea idPrefix={`${idPrefix}-logo`} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  )
}
