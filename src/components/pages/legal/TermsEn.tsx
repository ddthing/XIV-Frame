import React from 'react'
import { Container } from '@/components/layout/Container'

export function TermsEn() {
  return (
    <Container size="sm" className="py-12">
      <h1 className="text-4xl font-normal tracking-tight mb-8 text-foreground">Terms of Service</h1>
      <div className="prose dark:prose-invert">
        <h2 className="text-2xl font-normal tracking-tight">Service Usage</h2>
        <p className="mb-4">XIV Frame is a free web service provided for the purpose of decorating Final Fantasy XIV screenshots.</p>
        <h2 className="text-2xl font-normal tracking-tight">Disclaimer</h2>
        <p className="mb-4">The copyright and responsibility for images generated through this service lie entirely with the user who created them. The service provider may change or suspend the contents of the service without prior notice.</p>
      </div>
    </Container>
  )
}
