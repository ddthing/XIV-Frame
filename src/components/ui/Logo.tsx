import React from 'react'
import Image from 'next/image'

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

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image 
        src="/logo.png" 
        alt="XIV Frame Logo" 
        width={iconSizes[size]} 
        height={iconSizes[size]} 
        className="object-contain"
        priority
        unoptimized
      />
      <span className={`font-bold tracking-tight text-foreground ${sizeClasses[size]}`}>
        XIV Frame
      </span>
    </div>
  )
}
