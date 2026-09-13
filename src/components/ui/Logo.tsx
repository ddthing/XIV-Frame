import { FrameWindowMark } from './FrameWindowMark'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  inverse?: boolean
}

export function Logo({ size = 'md', className = '', inverse = false }: LogoProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  }

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <FrameWindowMark size={iconSizes[size]} />
      <span className={`font-bold tracking-tight ${inverse ? 'text-primary-foreground' : 'text-foreground'} ${sizeClasses[size]}`}>
        XIV Frame
      </span>
    </div>
  )
}
