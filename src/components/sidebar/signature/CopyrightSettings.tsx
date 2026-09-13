import { useTranslations } from 'next-intl'
import { useShallow } from 'zustand/react/shallow'

import { EditorFieldHeader, EditorRadio, EditorSection, editorSegmentedGroupClass, editorSegmentedOptionClass } from '@/components/ui/editor'
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
    <EditorSection title={t('creditTitle')} description={t('creditDescription')}>
      <div className="rounded-xl bg-muted/35 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <EditorFieldHeader label={t('copyrightToggle')} description={t('creditHint')} />
          </div>
          <Switch checked={showCopyright} onCheckedChange={setShowCopyright} aria-label={t('copyrightToggle')} />
        </div>

        {showCopyright && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <EditorFieldHeader label={t('copyrightPosition')} value={positions.find(item => item.value === copyrightPosition)?.label} />
              <div className={`grid grid-cols-3 gap-0.5 ${editorSegmentedGroupClass}`} role="radiogroup" aria-label={t('copyrightPosition')}>
                {positions.map(({ value, label }) => (
                  <EditorRadio checked={copyrightPosition === value} key={value} onClick={() => setCopyrightPosition(value)} className={`${editorSegmentedOptionClass(copyrightPosition === value)} px-2`}>
                    {label}
                  </EditorRadio>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <EditorFieldHeader label={t('copyrightColor')} value={colors.find(item => item.value === copyrightColor)?.label} />
              <div className={`grid grid-cols-3 gap-0.5 ${editorSegmentedGroupClass}`} role="radiogroup" aria-label={t('copyrightColor')}>
                {colors.map(({ value, label }) => (
                  <EditorRadio checked={copyrightColor === value} key={value} onClick={() => setCopyrightColor(value)} className={`${editorSegmentedOptionClass(copyrightColor === value)} px-2`}>
                    {label}
                  </EditorRadio>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </EditorSection>
  )
}
