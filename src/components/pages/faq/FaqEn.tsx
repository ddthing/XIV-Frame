import { FaqPage } from '@/components/content/FaqPage'
import Link from 'next/link'

export function FaqEn() {
  return (
    <FaqPage
      locale="en"
      eyebrow="05 / FAQ"
      title="Frequently asked questions"
      description="Answers to the questions that come up between adding an image and saving the finished result file."
      groups={[
        {
          number: '01',
          title: 'Getting started',
          items: [
            {
              question: 'Do I need an account or an installation?',
              answer: <p>No. Open XIV Frame in a browser and start editing. Desktop and mobile use the same editing structure. The latest Chrome, Edge, Safari, or Firefox is recommended.</p>,
            },
            {
              question: 'How many images can I add, and what is the limit?',
              answer: <p>You can add up to 16 image files from the image panel. The 3×3 grid needs 9 images and the 4×4 grid needs 16. Each file can be up to 50 MB; after selection, the browser optimizes its dimensions and format for editing. Use a browser-readable image such as PNG, JPG, or WebP.</p>,
            },
            {
              question: 'Are uploaded screenshots stored on a server?',
              answer: <p>Currently, screenshots are read by your browser and rendered on the canvas rather than stored in an XIV Frame image server or account. Select them again after a refresh or browser close. See the <Link href="/en/legal/privacy">Privacy Policy</Link> for details.</p>,
            },
          ],
        },
        {
          number: '02',
          title: 'Layout and styling',
          items: [
            {
              question: 'Where do I change the image order and layout?',
              answer: <p>Use the <strong>Image</strong> tab to reorder cards or clear them. For multiple images, use the <strong>Layout</strong> tab to choose split, vertical, grid, and other composition presets, then set the canvas ratio. Grid is a four-slot 2×2 layout for three or four images; with three images, one slot stays empty. With one photo, the canvas does not split automatically, so you can add a signature without choosing a layout.</p>,
            },
            {
              question: 'How do I fix a crop or move an image?',
              answer: <p>Select an image card and use the selected-image scale control. The scale range is 50%–300%, and you can drag the image directly on the canvas. Turn on the position lock when you want to prevent accidental dragging.</p>,
            },
            {
              question: 'How do I add text or a logo?',
              answer: <p>In the <strong>Signature</strong> tab, use <strong>Text</strong> to enter a character name and server label, then adjust position, alignment, size, color, and opacity. Use <strong>Logo Upload</strong> in the same tab for an image mark and tune its position, size, and opacity.</p>,
            },
          ],
        },
        {
          number: '03',
          title: 'Saving and troubleshooting',
          items: [
            {
              question: 'How do I save the finished frame?',
              answer: <p>On desktop, select <strong>Export PNG</strong> in the top bar. On mobile, open <strong>Export</strong> from the bottom bar and choose <strong>Save Photo</strong>. PNG is preferred, but an opaque result over 5 MB is saved as a high-quality JPEG. If a transparent PNG cannot fit under 5 MB, the editor shows guidance instead of downloading it.</p>,
            },
            {
              question: 'I selected an image, but it is not visible.',
              answer: <p>Check that the file is an image and is under 50 MB. The browser optimizes larger dimensions after selection. Confirm that the image card is selected, then refresh and choose the file again. Browser permissions or a file that was moved or deleted can also require a new selection.</p>,
            },
            {
              question: 'Will my settings be available next time?',
              answer: <p>Layout, signature text and style, positions, and logo settings may remain in browser local storage. Screenshot files are not persisted and will not survive a refresh. Clearing browser data also clears saved settings.</p>,
            },
            {
              question: 'Is XIV Frame an official Final Fantasy XIV service?',
              answer: <p>No. XIV Frame is not affiliated with or endorsed by Square Enix. Game content and trademarks belong to their respective owners, and you are responsible for confirming your right to upload or publish materials.</p>,
            },
          ],
        },
        {
          number: '04',
          title: 'Quality and publishing checks',
          items: [
            {
              question: 'Is slow background removal an error?',
              answer: <p>The first run may take longer while the browser prepares the background-removal model. Keep the page open and wait for the state to finish. Read the error category—model preparation, browser support, memory, image processing, or timeout—before choosing the recovery step, and process one image at a time on mobile. The <Link href="/en/blog/composite-elements-background-removal">compositing guide</Link> lists the checks for each symptom.</p>,
            },
            {
              question: 'Would removing the 50 MB limit make uploads easier?',
              answer: <p>The limit protects browser memory while the canvas and background-removal model are active. Files over the limit are rejected before optimization begins, so save a smaller copy and select it again. See the <Link href="/en/blog/large-ffxiv-screenshots-upload">large-file guide</Link> for a safer preparation workflow.</p>,
            },
            {
              question: 'What should I check in the downloaded result?',
              answer: <p>Check other players&apos; characters, chat, notifications, logo permissions, any implication of official affiliation, composite halos, and clipped text. Open the downloaded PNG or JPEG rather than relying only on the preview. The <Link href="/en/blog/ffxiv-screenshot-publishing-checklist">publishing checklist</Link> includes a short final review.</p>,
            },
            {
              question: 'Which guide should I read first?',
              answer: <p>Start with the complete workflow if you are new. Choose the layout guide for a multi-image composition, the compositing guide for a PNG element, or the signature guide for a character name and server label.</p>,
            },
          ],
        },
      ]}
      helpLabel="MORE HELP"
      helpTitle="Does something behave differently?"
      helpDescription="Include your browser, file type, and the steps that reproduce the issue so it is easier to investigate."
      helpButton="Contact us"
    />
  )
}
