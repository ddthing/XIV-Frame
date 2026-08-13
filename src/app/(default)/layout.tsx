import type { Metadata } from 'next'
import '../globals.css'
import { RootDocument } from '@/components/layout/RootDocument'
import { rootMetadata } from '@/lib/metadata'

export const metadata: Metadata = rootMetadata

export default function DefaultRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument locale="ko">{children}</RootDocument>
}
