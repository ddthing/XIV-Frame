import Image from 'next/image'

interface FrameWindowMarkProps {
  size?: number
  className?: string
}

export function FrameWindowMark({ size = 32, className = '' }: FrameWindowMarkProps) {
  return (
    <Image
      aria-hidden="true"
      className={`block shrink-0 ${className}`}
      src="/icon.svg"
      alt=""
      width={size}
      height={size}
      draggable="false"
    />
  )
}
