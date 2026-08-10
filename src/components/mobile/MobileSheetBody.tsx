'use client'

import { useEffect, useRef } from 'react'

export function MobileSheetBody({
  open,
  children,
  className = '',
}: {
  open: boolean
  children: React.ReactNode
  className?: string
}) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => bodyRef.current?.scrollTo({ top: 0 }))
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  return <div ref={bodyRef} className={className}>{children}</div>
}
