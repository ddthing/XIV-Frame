import React from 'react'
import { Container } from '@/components/layout/Container'

export function AboutEn() {
  return (
    <Container size="sm" className="py-12 lg:py-24">
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-8 text-foreground">About</h1>
      <div className="prose dark:prose-invert  max-w-none">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          XIV Frame is a premium screenshot formatting tool for Final Fantasy XIV players. We believe in providing a seamless, browser-based experience for decorating your screenshots without the need for complex image editing software.
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Open Source</h2>
        <p className="text-muted-foreground leading-relaxed">
          This project is fully open-source and available on GitHub. We welcome contributions and feedback from the community. Our design tokens, component system, and global navigation are meticulously crafted to ensure a perfect experience across all devices.
        </p>
      </div>
    </Container>
  )
}
