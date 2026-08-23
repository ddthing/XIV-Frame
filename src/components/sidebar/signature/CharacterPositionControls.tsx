'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Move } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { dispatchCharacterNudge } from '@/lib/characterPosition'

type Direction = 'up' | 'left' | 'right' | 'down'
type Step = 1 | 10

const directionDelta: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
  down: { dx: 0, dy: 1 },
}

export function CharacterPositionControls() {
  const t = useTranslations('SignatureSettings')
  const [step, setStep] = useState<Step>(1)
  const repeatTimeoutRef = useRef<number | null>(null)
  const repeatIntervalRef = useRef<number | null>(null)

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

  useEffect(() => () => {
    if (repeatTimeoutRef.current !== null) window.clearTimeout(repeatTimeoutRef.current)
    if (repeatIntervalRef.current !== null) window.clearInterval(repeatIntervalRef.current)
  }, [])

  const move = (direction: Direction, amount = step) => {
    const delta = directionDelta[direction]
    dispatchCharacterNudge({ dx: delta.dx * amount, dy: delta.dy * amount })
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
    up: { icon: ArrowUp, label: t('characterNudgeUp') },
    left: { icon: ArrowLeft, label: t('characterNudgeLeft') },
    right: { icon: ArrowRight, label: t('characterNudgeRight') },
    down: { icon: ArrowDown, label: t('characterNudgeDown') },
  }

  const renderButton = (direction: Direction) => {
    const { icon: Icon, label } = buttons[direction]
    return (
      <button
        type="button"
        aria-label={`${label} · ${step}px`}
        className="grid min-h-11 min-w-11 place-items-center rounded-md border border-border bg-surface-inset/70 text-foreground transition-colors hover:border-primary/35 hover:bg-muted/70 active:bg-accent active:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
    <div className="space-y-3 rounded-lg border border-border bg-card p-3 md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-foreground">{t('characterNudgeTitle')}</p>
          <p className="mt-0.5 font-body text-[11px] leading-4 text-muted-foreground">{t('characterNudgeStep')}</p>
        </div>
        <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{step}px</span>
      </div>

      <div className="mx-auto grid w-[148px] grid-cols-3 gap-2" aria-label={t('characterNudgeTitle')}>
        <span aria-hidden="true" />
        {renderButton('up')}
        <span aria-hidden="true" />
        {renderButton('left')}
        <button
          type="button"
          aria-label={t('characterNudgeToggleStep')}
        className="grid min-h-11 min-w-11 place-items-center rounded-md border border-primary/30 bg-accent/60 text-accent-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={() => setStep((current) => current === 1 ? 10 : 1)}
        >
          <span className="flex flex-col items-center gap-0.5">
            <Move className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold tabular-nums">{step}px</span>
          </span>
        </button>
        {renderButton('right')}
        <span aria-hidden="true" />
        {renderButton('down')}
        <span aria-hidden="true" />
      </div>

      <p className="font-body text-[11px] leading-4 text-muted-foreground">{t('characterNudgeHint')}</p>
    </div>
  )
}
