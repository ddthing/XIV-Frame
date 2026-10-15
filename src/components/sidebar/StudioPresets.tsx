'use client'

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store/useStore'
import { EditorSection } from '@/components/ui/editor'
import type { EditorSnapshot } from '@/store/history'
import { useShallow } from 'zustand/react/shallow'

const presets: { id: 'gallery' | 'cinema' | 'portrait'; ratio: string; settings: Partial<EditorSnapshot> }[] = [
  { id: 'gallery', ratio: '1:1', settings: { layoutPreset: 'grid', canvasRatio: '1:1', imageGap: 24, borderWidth: 32, imageTransition: 'none', backgroundColor: 'white', grainIntensity: 0 } },
  { id: 'cinema', ratio: '2:1', settings: { layoutPreset: 'split', canvasRatio: '2:1', imageGap: 8, borderWidth: 0, imageTransition: 'none', backgroundColor: 'white', grainIntensity: 0 } },
  { id: 'portrait', ratio: '4:5', settings: { layoutPreset: 'vertical-split', canvasRatio: '4:5', imageGap: 24, borderWidth: 40, imageTransition: 'none', backgroundColor: 'white', grainIntensity: 0 } },
]

export function StudioPresets() {
  const t = useTranslations('Studio')
  const state = useStore(useShallow(state => ({ layoutPreset: state.layoutPreset, canvasRatio: state.canvasRatio, imageGap: state.imageGap, borderWidth: state.borderWidth, imageTransition: state.imageTransition, backgroundColor: state.backgroundColor, grainIntensity: state.grainIntensity, applyEdit: state.applyEdit })))
  return (
    <EditorSection title={t('presets')} description={t('presetsHint')}>
      <div className="grid grid-cols-3 gap-2">
        {presets.map(preset => {
          const selected = Object.entries(preset.settings).every(([key, value]) => state[key as keyof typeof state] === value)
          return (
            <button key={preset.id} type="button" onClick={() => state.applyEdit(preset.settings)} aria-pressed={selected}
              className={`preset-card group relative min-w-0 rounded-lg border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'border-primary bg-muted' : 'border-border bg-card hover:border-primary/40'}`}>
              <span className={`preset-art preset-art-${preset.id}`} aria-hidden="true"><i /><i /><i /><i /></span>
              <span className="mt-2 flex items-center justify-between gap-1 text-[11px] font-semibold">{t(preset.id)}{selected && <Check className="size-3" aria-hidden="true" />}</span>
              <span className="mt-0.5 block font-mono text-[9px] text-muted-foreground">{preset.ratio}</span>
            </button>
          )
        })}
      </div>
    </EditorSection>
  )
}
