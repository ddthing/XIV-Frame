'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Move } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Direction = 'up' | 'left' | 'right' | 'down'
type Step = 1 | 10
type Position = { x: number; y: number }

const directionDelta: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
}

export function ImagePositionControls({
  position,
  onChange,
  disabled = false,
}: {
  position: Position
  onChange: (position: Position) => void
  disabled?: boolean
}) {
  const t = useTranslations('ImageUploader')
  const [step, setStep] = useState<Step>(1)
  const positionRef = useRef(position)
  const onChangeRef = useRef(onChange)
  const repeatTimeoutRef = useRef<number | null>(null)
  const repeatIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    positionRef.current = position
    onChangeRef.current = onChange
  }, [onChange, position])

  const stopRepeat = () => {
    if (repeatTimeoutRef.current !== null) {
      window.clearTimeout(repeatTimeoutRef.current)
      repeatTimeoutRef.current = null
    }
    if (repeatIntervalRef.current !== null) {
      window.clearInterval(repeatIntervalRef.current)
      repeatIntervalRef.current = null
    }
  }

  useEffect(() => () => stopRepeat(), [])

  const move = (direction: Direction, amount = step) => {
    const delta = directionDelta[direction]
    const nextPosition = {
      x: positionRef.current.x + delta.x * amount,
      y: positionRef.current.y + delta.y * amount,
    }
    positionRef.current = nextPosition
    onChangeRef.current(nextPosition)
  }

  const startRepeat = (direction: Direction) => {
    stopRepeat()
    move(direction)
    repeatTimeoutRef.current = window.setTimeout(() => {
      repeatIntervalRef.current = window.setInterval(() => move(direction), 70)
    }, 280)
  }

  const handleKeyboardMove = (event: React.KeyboardEvent<HTMLButtonElement>, direction: Direction) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    move(direction)
  }

  const buttons: Record<Direction, { icon: typeof ArrowUp; label: string }> = {
    up: { icon: ArrowUp, label: t('positionUp') },
    left: { icon: ArrowLeft, label: t('positionLeft') },
    right: { icon: ArrowRight, label: t('positionRight') },
    down: { icon: ArrowDown, label: t('positionDown') },
  }

  const renderButton = (direction: Direction) => {
    const { icon: Icon, label } = buttons[direction]
    return (
      <button
        type="button"
        aria-label={`${label} · ${step}px`}
        disabled={disabled}
        className="grid min-h-11 min-w-11 place-items-center rounded-md border border-border bg-surface-inset/70 text-foreground transition-colors hover:border-primary/35 hover:bg-muted/70 active:bg-sticky-note-mint active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-45"
        onPointerDown={(event) => {
          event.preventDefault()
          event.currentTarget.setPointerCapture(event.pointerId)
          startRepeat(direction)
        }}
        onPointerUp={stopRepeat}
        onPointerCancel={stopRepeat}
        onPointerLeave={stopRepeat}
        onKeyDown={(event) => handleKeyboardMove(event, direction)}
      >
        <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
      </button>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3" role="group" aria-label={t('positionNudge')}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-foreground">{t('positionNudge')}</p>
          <p className="mt-0.5 font-body text-[11px] leading-4 text-muted-foreground">{t('positionHint')}</p>
        </div>
        <div className="text-right">
          <button
            type="button"
            aria-label={t('positionStepToggle')}
            aria-pressed={step === 10}
            disabled={disabled}
            className="inline-flex min-h-9 items-center gap-1 rounded-md border border-primary/30 bg-sticky-note-mint/60 px-2 text-primary transition-colors hover:bg-sticky-note-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-45"
            onClick={() => setStep((current) => current === 1 ? 10 : 1)}
          >
            <Move className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold tabular-nums">{step}px</span>
          </button>
          <span className="sr-only">{t('positionStep')}</span>
        </div>
      </div>

      <div className="mx-auto grid w-[148px] grid-cols-3 gap-2">
        <span aria-hidden="true" />
        {renderButton('up')}
        <span aria-hidden="true" />
        {renderButton('left')}
        <span className="grid min-h-11 min-w-11 place-items-center rounded-md border border-border bg-surface-inset/45 font-mono text-[10px] font-semibold tabular-nums text-muted-foreground" aria-hidden="true">
          {Math.round(position.x)},{Math.round(position.y)}
        </span>
        {renderButton('right')}
        <span aria-hidden="true" />
        {renderButton('down')}
        <span aria-hidden="true" />
      </div>

      <p className="font-body text-[11px] leading-4 text-muted-foreground">{disabled ? t('positionLocked') : t('positionKeyboardHint')}</p>
    </div>
  )
}
