'use client'

import { Redo2, Undo2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useStore } from '@/store/useStore'

export function HistoryControls({ inverse = false }: { inverse?: boolean }) {
  const t = useTranslations('Studio')
  const canUndo = useStore(state => state.canUndo)
  const canRedo = useStore(state => state.canRedo)
  const undo = useStore(state => state.undo)
  const redo = useStore(state => state.redo)

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={t('history')}>
      {[{ label: t('undo'), shortcut: 'Control+Z Meta+Z', hint: '⌘ / Ctrl Z', action: undo, enabled: canUndo, Icon: Undo2 },
        { label: t('redo'), shortcut: 'Control+Shift+Z Meta+Shift+Z', hint: '⌘ / Ctrl ⇧ Z', action: redo, enabled: canRedo, Icon: Redo2 }].map(({ label, shortcut, hint, action, enabled, Icon }) => (
        <button key={shortcut} type="button" onClick={action} disabled={!enabled} aria-label={label} aria-keyshortcuts={shortcut} title={`${label} · ${hint}`}
          className={`grid size-10 shrink-0 place-items-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${inverse ? 'text-primary-foreground/80 hover:bg-primary-foreground/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
          <Icon className="size-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
