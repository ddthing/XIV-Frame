interface FrameWindowMarkProps {
  size?: number
  className?: string
}

export function FrameWindowMark({ size = 32, className = '' }: FrameWindowMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="88" height="88" rx="22" fill="var(--accent)" />
      <rect x="20" y="20" width="57" height="57" rx="5" stroke="var(--accent-foreground)" strokeWidth="6" />
      <path d="M58 29H70V41" stroke="var(--primary)" strokeWidth="6" strokeLinecap="square" />
    </svg>
  )
}
