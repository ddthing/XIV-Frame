import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const iconClasses = {
    sm: 'w-6 h-6 rounded-md text-xs',
    md: 'w-8 h-8 rounded-lg text-sm',
    lg: 'w-10 h-10 rounded-xl text-base',
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`bg-primary text-primary-foreground flex items-center justify-center font-normal ${iconClasses[size]}`}>
        X
      </div>
      <span className={`font-normal tracking-tight text-foreground ${sizeClasses[size]}`}>
        XIV Frame
      </span>
    </div>
  )
}
