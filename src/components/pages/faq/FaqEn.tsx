import { FaqPage } from '@/components/content/FaqPage'
import Link from 'next/link'

export function FaqEn() {
  return (
    <FaqPage
      locale="en"
      eyebrow="05 / FAQ"
      title="Frequently asked questions"
      description="Answers to the questions that come up between adding an image and saving the final PNG."
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
              answer: <p>You can add up to four image files from the image panel. Each file must be 10 MB or smaller and should be a format your browser can read, such as PNG or JPG.</p>,
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
              answer: <p>Use the <strong>Image</strong> tab to reorder cards or clear them. Use the <strong>Layout</strong> tab to choose split, vertical, or grid and set the canvas ratio. Grid becomes available with three or more images.</p>,
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
              answer: <p>On desktop, select <strong>Save PNG</strong> in the top bar. On mobile, open <strong>Export</strong> from the bottom bar and choose the photo-saving action. Check the preview edges and text placement before saving.</p>,
            },
            {
              question: 'I selected an image, but it is not visible.',
              answer: <p>Check that the file is an image and is under 10 MB. Confirm that the image card is selected, then refresh and choose the file again. Browser permissions or a file that was moved or deleted can also require a new selection.</p>,
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
      ]}
      helpLabel="MORE HELP"
      helpTitle="Does something behave differently?"
      helpDescription="Include your browser, file type, and the steps that reproduce the issue so it is easier to investigate."
      helpButton="Contact us"
    />
  )
}
