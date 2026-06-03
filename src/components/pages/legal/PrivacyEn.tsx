import React from 'react'
import { Container } from '@/components/layout/Container'

export function PrivacyEn() {
  return (
    <Container size="sm" className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight mb-8 text-foreground">Privacy Policy</h1>
      <div className="prose dark:prose-invert">
        <h2 className="text-xl font-semibold tracking-tight">Information Collection</h2>
        <p className="mb-4">XIV Frame does not require registration, nor does it upload or store your images on any server. All image processing and file downloads happen locally within your browser (client-side).</p>
        <h2 className="text-xl font-semibold tracking-tight">Cookies and Local Storage</h2>
        <p className="mb-4">For your convenience, settings (such as language, layout options, etc.) may be temporarily saved in your browser's local storage.</p>
        <h2 className="text-xl font-semibold tracking-tight">Contact</h2>
        <p className="mb-4">If you have any questions, please contact the service provider.</p>
      </div>
    </Container>
  )
}
