import { ChevronRight } from 'lucide-react'

export function MobileSheetAction({
  label,
  onClick,
  disabled = false,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <div className="shrink-0 border-t border-border bg-background/95 px-5 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-3 backdrop-blur-sm">
      <button
        type="button"
        data-mobile-step-action
        onClick={onClick}
        disabled={disabled}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-subtle transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {label}
        {!disabled && <ChevronRight className="size-4" aria-hidden="true" />}
      </button>
    </div>
  )
}
