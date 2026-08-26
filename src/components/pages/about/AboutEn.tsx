import { DocumentPage } from '@/components/content/DocumentPage'
import { FeatureCoverageTable } from '@/components/content/FeatureCoverageTable'
import Link from 'next/link'

export function AboutEn() {
  return (
    <DocumentPage
      eyebrow="04 / ABOUT"
      title="About XIV Frame"
      description="Learn what XIV Frame does and how it handles your images and editor settings."
      updatedLabel="Last updated"
      updated="August 26, 2026"
      asideLabel="On this page"
      sections={[
        {
          id: 'what-is-xiv-frame',
          index: '01',
          title: 'What is XIV Frame?',
          children: (
            <>
              <p>XIV Frame is a browser-based editor for composing Final Fantasy XIV (FF14) screenshots into one finished image. You can arrange several screenshots, add a character name, server label, or logo, and save the finished frame without opening a full image-editing suite.</p>
              <ul>
                <li>Add up to 16 screenshots and change their order. The four-slot 2×2 Grid uses three or four images; the 3×3 and 4×4 grids use 9 and 16.</li>
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
              <p>The simplest path is <strong>add images → choose a layout → tune each crop → tune the signature → export</strong>. You can also choose a layout first and fill its empty preview slots. Original ratio is the default, with the X timeline 16:9 profile and 2:1 available as options. The <Link href="/en/blog">guides</Link> follow that same order and explain the controls using the labels in the editor.</p>
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
              <p>The public operating identifier is <strong>ddthing / XIV Frame</strong>. Source code and change history are available in the <a href="https://github.com/ddthing/XIV-Frame" target="_blank" rel="noopener noreferrer">XIV Frame GitHub repository</a>. Send bug reports and product feedback through the <Link href="/en/contact">contact page</Link>.</p>
              <p>Rights to Final Fantasy XIV game content and trademarks belong to their respective owners. XIV Frame is not affiliated with or endorsed by Square Enix.</p>
            </>
          ),
        },
        {
          id: 'how-guides-are-maintained',
          index: '05',
          title: 'How are the guides maintained?',
          children: (
            <>
              <p>The guides are written around a real outcome in the editor, not as a list of search terms or controls. Separate articles cover different jobs such as layout, compositing, file size, and publishing checks so the same explanation is not repeated across thin pages.</p>
              <p>When a feature changes, the instructions and the updated date are reviewed together. We avoid documenting controls that cannot be confirmed in the editor and include recovery steps when a workflow fails. See the <Link href="/en/blog">guide library</Link> for the full set of workflows.</p>
            </>
          ),
        },
        {
          id: 'supported-workflow',
          index: '06',
          title: 'Recommended workflow and limits',
          children: (
            <>
              <p>For a predictable first edit, add photos, choose a layout, then move through compositing, signature, and export. On mobile, process one background-removal image at a time. PNG is preferred, while opaque results over X&apos;s 5 MB limit are automatically optimized as high-quality JPEG files.</p>
              <p>XIV Frame is an editing tool, not a service that decides image ownership or publishing permission. Check rights and consent yourself when another person&apos;s character, logo, or conversation appears in an image.</p>
            </>
          ),
        },
        {
          id: 'feature-coverage',
          index: '07',
          title: 'Verified feature coverage',
          children: (
            <FeatureCoverageTable
              intro="This feature and limitation list reflects the review build checked on August 26, 2026. The public deployment is checked again after release. Processing time can vary with the browser, device memory, and source file."
              areaLabel="Area"
              supportLabel="Supported feature"
              notesLabel="Usage notes"
              rows={[
                { area: 'Input images', support: 'AVIF · BMP · GIF · JPG · PNG · WebP', notes: 'Up to 50 MB per file and 16 photos. Large dimensions may be optimized in the browser.' },
                { area: 'Layouts', support: 'Split · vertical · 2×2 Grid · 3×3 · 4×4', notes: 'The four-slot 2×2 Grid uses 3–4 images; with three, one slot stays empty. The 3×3 and 4×4 grids use 9 and 16. Adjust X timeline, Original ratio, and 2:1 plus spacing, border, and background.' },
                { area: 'Compositing', support: 'Remove · erase · restore · shadow', notes: 'Runs in the browser; element size can be tuned from 25% to 500%.' },
                { area: 'Fine movement', support: 'Desktop arrows · mobile nudge', notes: 'Desktop supports 1 px/10 px steps; mobile uses buttons and long press.' },
                { area: 'Export and storage', support: 'PNG · JPEG download', notes: "PNG is preferred; opaque results over X's 5 MB limit are optimized as high-quality JPEG. Screenshots are not stored on the server." },
              ]}
            />
          ),
        },
      ]}
    />
  )
}
