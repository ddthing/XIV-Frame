import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { EditorChoice, EditorFieldHeader, EditorSection } from '@/components/ui/editor'
import { Switch } from '@/components/ui/switch'
import { useStore, type CopyrightColor, type CopyrightPosition } from '@/store/useStore'

export function CopyrightSettings() {
  const {
    showCopyright,
    setShowCopyright,
    copyrightPosition,
    setCopyrightPosition,
    copyrightColor,
    setCopyrightColor,
  } = useStore(useShallow(state => ({
    showCopyright: state.showCopyright,
    setShowCopyright: state.setShowCopyright,
    copyrightPosition: state.copyrightPosition,
    setCopyrightPosition: state.setCopyrightPosition,
    copyrightColor: state.copyrightColor,
    setCopyrightColor: state.setCopyrightColor,
  })))
  const t = useTranslations('LayoutSettings')

  const positions: { value: CopyrightPosition; label: string }[] = [
    { value: 'bottom-left', label: t('posLeft') },
    { value: 'bottom-center', label: t('posCenter') },
    { value: 'bottom-right', label: t('posRight') },
  ]
  const colors: { value: CopyrightColor; label: string }[] = [
    { value: 'black', label: t('colorBlack') },
    { value: 'white', label: t('colorWhite') },
    { value: 'gray', label: t('colorGray') },
  ]

  return (
    <EditorSection title={t('creditTitle')} description={t('creditDescription')} className="border-t border-border pt-5">
      <div className="editor-control-surface space-y-4 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <EditorFieldHeader label={t('copyrightToggle')} />
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{t('creditHint')}</p>
          </div>
          <Switch checked={showCopyright} onCheckedChange={setShowCopyright} aria-label={t('copyrightToggle')} />
        </div>

        {showCopyright && (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <EditorFieldHeader label={t('copyrightPosition')} value={positions.find(item => item.value === copyrightPosition)?.label} />
              <div className="grid grid-cols-3 gap-2">
                {positions.map(({ value, label }) => (
                  <EditorChoice key={value} active={copyrightPosition === value} onClick={() => setCopyrightPosition(value)} className="px-2">
                    {label}
                  </EditorChoice>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <EditorFieldHeader label={t('copyrightColor')} value={colors.find(item => item.value === copyrightColor)?.label} />
              <div className="grid grid-cols-3 gap-2">
                {colors.map(({ value, label }) => (
                  <EditorChoice key={value} active={copyrightColor === value} onClick={() => setCopyrightColor(value)} className="px-2">
                    {label}
                  </EditorChoice>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </EditorSection>
  )
}
