'use client'

import type { LucideIcon } from 'lucide-react'
import { Images, Info, LayoutTemplate, PanelLeftOpen, Type } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type EditorTab = 'layout' | 'image' | 'signature'

interface EditorNavigationProps {
  activeTab: EditorTab
  isHelpOpen: boolean
  isCollapsed: boolean
  onTabChange: (tab: EditorTab) => void
  onHelpChange: () => void
  onToggleCollapse: () => void
}

interface NavigationItem {
  value: EditorTab
  label: string
  icon: LucideIcon
}

export function EditorNavigation({
  activeTab,
  isHelpOpen,
  isCollapsed,
  onTabChange,
  onHelpChange,
  onToggleCollapse,
}: EditorNavigationProps) {
  const settingsT = useTranslations('SettingsPanel')
  const t = useTranslations('EditorNavigation')

  const items: NavigationItem[] = [
    { value: 'layout', label: settingsT('tabLayout'), icon: LayoutTemplate },
    { value: 'image', label: settingsT('tabImage'), icon: Images },
    { value: 'signature', label: settingsT('tabSignature'), icon: Type },
  ]

  return (
    <nav
      aria-label={settingsT('flowLabel')}
      className="hidden min-h-0 w-[64px] shrink-0 flex-col border-r border-border bg-background md:flex"
    >
      <div className="flex flex-col gap-1 p-1.5">
        {items.map(({ value, label, icon: Icon }, index) => {
          const isActive = activeTab === value && !isHelpOpen

          return (
            <button
              key={value}
              type="button"
              aria-current={isActive ? 'step' : undefined}
              aria-label={`${String(index + 1).padStart(2, '0')} ${label}`}
              title={label}
              onClick={() => onTabChange(value)}
              className={`flex min-h-[68px] w-full flex-col items-center justify-center gap-1 rounded-md px-1.5 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              <span
                aria-hidden="true"
                className={`font-mono text-[9px] font-semibold tabular-nums ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <Icon aria-hidden="true" className="size-4" />
              <span className="whitespace-nowrap text-[10px] font-semibold leading-4">{label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto p-1.5">
        <button
          type="button"
          aria-current={isHelpOpen ? 'page' : undefined}
          aria-label={t('infoLabel')}
          title={t('infoLabel')}
          onClick={onHelpChange}
          className={`flex min-h-[68px] w-full flex-col items-center justify-center gap-1 rounded-md px-1.5 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
            isHelpOpen
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          }`}
        >
          <span aria-hidden="true" className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">i</span>
          <Info aria-hidden="true" className="size-4" />
          <span className="whitespace-nowrap text-[10px] font-semibold leading-4">{t('infoLabel')}</span>
        </button>

        {isCollapsed && (
          <button
            type="button"
            aria-label={t('expand')}
            title={t('expand')}
            onClick={onToggleCollapse}
            className="mt-2 grid size-10 w-full place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <PanelLeftOpen aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </nav>
  )
}
