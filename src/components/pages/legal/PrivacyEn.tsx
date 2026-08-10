import React from 'react'
import { ContentPage } from '@/components/layout/ContentPage'

export function PrivacyEn() {
  return (
    <ContentPage eyebrow="06 / PRIVACY" size="sm" contentClassName="!mt-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">Privacy Policy</h1>
      <div className="max-w-2xl space-y-8 text-base leading-7 text-foreground/80 [&>h2]:border-t [&>h2]:border-border [&>h2]:pt-6 [&>h2:first-child]:border-t-0 [&>h2:first-child]:pt-0 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-foreground [&>p]:-mt-5">
        <h2 className="text-xl font-semibold tracking-tight">Information Collection</h2>
        <p className="mb-4">XIV Frame does not require registration, nor does it upload or store your images on any server. All image processing and file downloads happen locally within your browser (client-side).</p>
        <h2 className="text-xl font-semibold tracking-tight">Cookies and Local Storage</h2>
        <p className="mb-4">For your convenience, settings (such as language, layout options, etc.) may be temporarily saved in your browser&apos;s local storage.</p>
        <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
        <p className="mb-4">If you have any questions, please contact the service provider.</p>
      </div>
    </ContentPage>
  )
}
