import { XivFrameMark } from './XivFrameMark'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  inverse?: boolean
}

export function Logo({ size = 'md', className = '', inverse = false }: LogoProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <XivFrameMark size={iconSizes[size]} />
      <span className={`font-bold tracking-tight ${inverse ? 'text-primary-foreground' : 'text-foreground'} ${sizeClasses[size]}`}>
        XIV Frame
      </span>
    </div>
  )
}
