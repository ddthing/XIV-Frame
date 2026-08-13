import { DocumentPage } from '@/components/content/DocumentPage'
import Link from 'next/link'

export function AboutEn() {
  return (
    <DocumentPage
      eyebrow="04 / ABOUT"
      title="About XIV Frame"
      description="Learn what XIV Frame does and how it handles your images and editor settings."
      updatedLabel="Last updated"
      updated="August 13, 2026"
      asideLabel="On this page"
      sections={[
        {
          id: 'what-is-xiv-frame',
          index: '01',
          title: 'What is XIV Frame?',
          children: (
            <>
              <p>XIV Frame is a browser-based editor for composing Final Fantasy XIV (FF14) screenshots into one PNG. You can arrange several screenshots, add a character name, server label, or logo, and save the finished frame without opening a full image-editing suite.</p>
              <ul>
                <li>Add up to four screenshots and change their order.</li>
                <li>Choose split, vertical, or grid layouts and set the canvas ratio.</li>
                <li>Adjust each image&apos;s scale and position, then place a text signature or logo.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'who-it-is-for',
          index: '02',
          title: 'Who is it for?',
          children: (
            <>
              <p>Use it when you want to show a character from multiple angles, document a glamour or housing project, or prepare a single showcase image for a community post.</p>
              <p>The simplest path is <strong>add images → choose a layout → tune the signature → save PNG</strong>. The <Link href="/en/blog">guides</Link> follow that same order and explain the controls using the labels in the editor.</p>
            </>
          ),
        },
        {
          id: 'data-and-storage',
          index: '03',
          title: 'How are images and settings handled?',
          children: (
            <>
              <p>Uploaded screenshots are read by your browser and rendered on the canvas. The editor does not currently require an account or provide an image-upload service. Screenshot files themselves must be selected again after a refresh.</p>
              <p>Layout, signature, position, and similar settings may remain in your browser&apos;s local storage for convenience. An uploaded logo is resized and stored locally as data, so review browser data after using a shared computer.</p>
            </>
          ),
        },
        {
          id: 'open-source-and-rights',
          index: '04',
          title: 'Open source and rights',
          children: (
            <>
              <p>The source code is available in the <a href="https://github.com/ddthing/XIV-Frame" target="_blank" rel="noopener noreferrer">XIV Frame GitHub repository</a>. Send bug reports and product feedback through the <Link href="/en/contact">contact page</Link>.</p>
              <p>Rights to Final Fantasy XIV game content and trademarks belong to their respective owners. XIV Frame is not affiliated with or endorsed by Square Enix.</p>
            </>
          ),
        },
      ]}
    />
  )
}
