'use client'

import type { ReactNode } from 'react'
import { CircleHelp } from 'lucide-react'
import { Popover } from '@base-ui/react/popover'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

interface EditorHelpPopoverProps {
  description: ReactNode
  className?: string
}

export function EditorHelpPopover({ description, className }: EditorHelpPopoverProps) {
  const t = useTranslations('EditorSection')

  return (
    <Popover.Root>
      <Popover.Trigger
        type="button"
        aria-label={t('helpLabel')}
        title={t('helpLabel')}
        className={cn(
          'inline-grid size-10 -m-2 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80',
          className,
        )}
      >
        <CircleHelp aria-hidden="true" className="size-4" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <Popover.Popup
            initialFocus={false}
            role="dialog"
            aria-label={t('helpTitle')}
            className="w-[min(18rem,calc(100vw-2rem))] rounded-md border border-border bg-popover p-3 text-xs leading-5 text-popover-foreground shadow-subtle-2 outline-none"
          >
            <Popover.Title className="sr-only">{t('helpTitle')}</Popover.Title>
            <Popover.Description>{description}</Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
