import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ExternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> {
  children: ReactNode
  newWindowLabel: string
}

export function ExternalLink({ children, newWindowLabel, className, ...props }: ExternalLinkProps) {
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex max-w-full gap-1 align-baseline', className)}
    >
      <span>{children}</span>
      <ExternalLinkIcon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="sr-only"> ({newWindowLabel})</span>
    </a>
  )
}
