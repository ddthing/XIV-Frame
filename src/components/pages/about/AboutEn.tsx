import React from 'react'
import { ContentPage, ContentPanel } from '@/components/layout/ContentPage'

export function AboutEn() {
  return (
    <ContentPage eyebrow="04 / ABOUT" size="md" contentClassName="!mt-8">
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-8 text-foreground">About</h1>
      <ContentPanel className="max-w-3xl [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>h2:not(:first-child)]:mt-8 [&>p]:text-foreground/75">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          XIV Frame is a premium screenshot formatting tool for Final Fantasy XIV players. We believe in providing a seamless, browser-based experience for decorating your screenshots without the need for complex image editing software.
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Open Source</h2>
        <p className="text-muted-foreground leading-relaxed">
          This project is fully open-source and available on GitHub. We welcome contributions and feedback from the community. Our design tokens, component system, and global navigation are meticulously crafted to ensure a perfect experience across all devices.
        </p>
      </ContentPanel>
    </ContentPage>
  )
}
