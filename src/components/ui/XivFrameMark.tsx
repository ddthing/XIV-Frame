interface XivFrameMarkProps {
  size?: number
  className?: string
}

export function XivFrameMark({ size = 32, className = '' }: XivFrameMarkProps) {
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
      <rect x="7" y="7" width="82" height="82" rx="18" fill="#FFFDF8" stroke="#1A3300" strokeWidth="6" />
      <path
        d="M25 29L41 57M41 29L25 57M51 29V57M60 29L71 57L82 29"
        stroke="#1A3300"
        strokeWidth="7"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path d="M31 68H65" stroke="#F4F000" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
