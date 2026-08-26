import { DocumentPage } from '@/components/content/DocumentPage'
import Link from 'next/link'

export function TermsEn() {
  return (
    <DocumentPage
      eyebrow="07 / TERMS"
      title="Terms of Service"
      description="The service scope and user responsibilities for using XIV Frame safely and predictably."
      updatedLabel="Effective"
      updated="August 26, 2026"
      asideLabel="On this page"
      sections={[
        {
          id: 'service',
          index: '01',
          title: 'Service scope',
          children: (
            <>
              <p>XIV Frame is a free web tool for composing Final Fantasy XIV screenshots in a browser and saving the result. PNG is preferred, but an opaque result over 5 MB may be automatically optimized as a high-quality JPEG. It currently does not provide accounts, sign-in, paid plans, or server-side project storage.</p>
              <p>The features and supported formats shown in the editor may change for operational or technical reasons.</p>
            </>
          ),
        },
        {
          id: 'user-content',
          index: '02',
          title: 'User content and rights',
          children: (
            <>
              <p>You must have the right or permission needed to use any image, text, or logo you upload or enter. Do not use another person&apos;s private information, an image without the required consent, or material that infringes copyright or trademark rights.</p>
              <p>XIV Frame does not take ownership of content you enter. Rights to third-party game imagery, logos, and other assets remain with their respective owners and are not transferred merely because you make a frame.</p>
            </>
          ),
        },
        {
          id: 'acceptable-use',
          index: '03',
          title: 'Acceptable use',
          children: (
            <>
              <p>Use the service for its intended purpose, such as personal screenshot editing, community posts, or a non-intrusive showcase.</p>
              <ul>
                <li>Do not disrupt the service or send excessive automated requests.</li>
                <li>Do not process malware, unlawful content, or material that violates another person&apos;s rights.</li>
                <li>Do not bypass access controls or interfere with another user&apos;s access.</li>
                <li>Do not falsely claim an official partnership or endorsement by XIV Frame or a third party.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'local-processing',
          index: '04',
          title: 'Browser processing and storage',
          children: (
            <>
              <p>Image editing takes place in your browser. In-progress screenshots may not survive a refresh or browser close, so keep any source files you need independently.</p>
              <p>Layout, signature, and logo settings may remain in browser local storage. Use the service with that behavior in mind, especially on a shared device.</p>
            </>
          ),
        },
        {
          id: 'availability',
          index: '05',
          title: 'Availability and disclaimer',
          children: (
            <>
              <p>We work to keep the service reliable, but do not promise uninterrupted operation or support for every browser, file, and device combination. Keep your original files separately in case a browser, network, storage, or third-party issue causes a loss.</p>
              <p>You are responsible for decisions about using the service and publishing the output. For legal, copyright, or game-policy questions, consult the relevant rights holder or a qualified professional.</p>
            </>
          ),
        },
        {
          id: 'third-party-and-rights',
          index: '06',
          title: 'Third parties and trademarks',
          children: (
            <>
              <p>The site may link to third-party services for hosting, fonts, advertising, contact, or support. Their own terms and privacy policies apply when you use them.</p>
              <p>Final Fantasy XIV, its game imagery, and related trademarks belong to their respective owners. XIV Frame is not affiliated with or endorsed by Square Enix.</p>
            </>
          ),
        },
        {
          id: 'changes-and-contact',
          index: '07',
          title: 'Changes and contact',
          children: (
            <>
              <p>We may update these terms when the service, applicable requirements, or operating practices change. Revised terms will be posted on this page with an updated effective date.</p>
              <p>For questions about these terms or the service, use the <Link href="/en/contact">contact page</Link>.</p>
              <p>Last updated: August 26, 2026.</p>
            </>
          ),
        },
      ]}
    />
  )
}
