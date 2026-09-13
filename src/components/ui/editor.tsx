'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { EditorHelpPopover } from './EditorHelpPopover'

export const editorSegmentedGroupClass = 'rounded-lg bg-muted/65 p-1'

export const editorSegmentedOptionClass = (active: boolean) => cn(
  'flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
  active
    ? 'bg-card text-foreground shadow-subtle'
    : 'text-muted-foreground hover:bg-background/70 hover:text-foreground',
)

export function EditorSection({
  title,
  description,
  children,
  className,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      {(title || description) && (
        <div className="flex items-center gap-1.5">
          {title && <h3 className="text-sm font-semibold leading-5 tracking-tight text-foreground">{title}</h3>}
          {description && <EditorHelpPopover description={description} />}
        </div>
      )}
      {children}
    </section>
  )
}

export function EditorFieldHeader({
  label,
  value,
  htmlFor,
  description,
}: {
  label: React.ReactNode
  value?: React.ReactNode
  htmlFor?: string
  description?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1.5">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-xs font-semibold text-foreground">
            {label}
          </label>
        ) : (
          <span className="text-xs font-semibold text-foreground">{label}</span>
        )}
        {description && <EditorHelpPopover description={description} />}
      </div>
      {value !== undefined && (
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{value}</span>
      )}
    </div>
  )
}

type EditorRadioProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { checked: boolean }

export function EditorRadio({ checked, children, className, onKeyDown, ...props }: EditorRadioProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  const getGroupRadios = (button: HTMLButtonElement) => {
    const group = button.closest('[role="radiogroup"]')
    if (!group) return []

    return Array.from(group.children).filter(
      (child): child is HTMLButtonElement => child instanceof HTMLButtonElement && child.getAttribute('role') === 'radio' && !child.disabled,
    )
  }

  React.useEffect(() => {
    const button = buttonRef.current
    if (!button || checked) return
    const radios = getGroupRadios(button)
    if (radios.length > 0 && !radios.some((radio) => radio.tabIndex === 0)) {
      radios[0].tabIndex = 0
    }
  }, [checked])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    const radios = getGroupRadios(event.currentTarget)
    const currentIndex = radios.indexOf(event.currentTarget)
    if (currentIndex < 0 || radios.length < 2) return

    let nextIndex = currentIndex
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % radios.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + radios.length) % radios.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = radios.length - 1
    } else {
      return
    }

    event.preventDefault()
    const nextRadio = radios[nextIndex]
    nextRadio.click()
    nextRadio.focus()
  }

  return (
    <button
      {...props}
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {children}
    </button>
  )
}

export function EditorChoice({
  active = false,
  selectionMode = 'toggle',
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; selectionMode?: 'toggle' | 'radio' }) {
  const choiceClassName = cn(
    'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
    active
      ? 'border-primary bg-muted text-foreground shadow-subtle'
      : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/60 hover:text-foreground',
    className,
  )

  if (selectionMode === 'radio') {
    return <EditorRadio {...props} checked={active} className={choiceClassName}>{children}</EditorRadio>
  }

  return (
    <button
      type="button"
      {...props}
      aria-pressed={active}
      className={choiceClassName}
    >
      {children}
    </button>
  )
}
