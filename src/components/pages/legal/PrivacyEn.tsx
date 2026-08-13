import { DocumentPage } from '@/components/content/DocumentPage'
import Link from 'next/link'

export function PrivacyEn() {
  return (
    <DocumentPage
      eyebrow="06 / PRIVACY"
      title="Privacy Policy"
      description="How XIV Frame handles edited images, browser settings, technical requests, and advertising."
      updatedLabel="Effective"
      updated="August 13, 2026"
      asideLabel="On this page"
      sections={[
        {
          id: 'scope',
          index: '01',
          title: 'Scope',
          children: (
            <>
              <p>This policy applies to the XIV Frame website and its browser-based editor. XIV Frame does not currently provide accounts, sign-in, or paid checkout.</p>
              <p>If you follow a link to X, GitHub, Ko-fi, or an external contact service, that service&apos;s own privacy policy applies.</p>
            </>
          ),
        },
        {
          id: 'images-and-editor',
          index: '02',
          title: 'Images and editor data',
          children: (
            <>
              <p>Your screenshots are read by your browser and composited on the canvas. XIV Frame does not currently upload or store screenshot files on an account or image server. Screenshot files must be selected again after a refresh.</p>
              <p>Layout, canvas ratio, signature text, position, and style settings may be kept in your browser&apos;s local storage for convenience. An uploaded logo may be resized by the browser and stored locally as data. XIV Frame&apos;s server cannot retrieve this local data.</p>
            </>
          ),
        },
        {
          id: 'technical-requests',
          index: '03',
          title: 'Technical requests and external resources',
          children: (
            <>
              <p>The hosting or CDN that delivers and protects the website may record technical information needed to handle requests and security, such as an IP address, browser details, request time, and requested path. XIV Frame does not use that information to profile the contents of your edited images.</p>
              <p>The site may load fonts, icons, or advertising resources from third parties. Those providers may process information needed to fulfill a request, under their own policies.</p>
            </>
          ),
        },
        {
          id: 'ads-and-cookies',
          index: '04',
          title: 'Cookies and Google advertising',
          children: (
            <>
              <p>The site may use Google AdSense or Google advertising tags. When an ad request is made, Google and certified third-party vendors may use cookies, web beacons, IP addresses, or similar technologies to serve and measure advertising.</p>
              <p>See <a href="https://support.google.com/adsense/answer/1348695" target="_blank" rel="noopener noreferrer">Google&apos;s AdSense required content guidance</a> for more information about advertising cookies. You can manage personalized advertising in <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> and some third-party advertising cookies through <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">About Ads choices</a>.</p>
              <p>Where required, a consent management experience may be used in accordance with applicable law and Google&apos;s consent requirements. We do not encourage ad clicks or make ads look like navigation or download controls.</p>
            </>
          ),
        },
        {
          id: 'your-controls',
          index: '05',
          title: 'Your controls',
          children: (
            <>
              <p>You can clear or block local storage and cookies in your browser settings. Clearing local storage may reset saved layout, signature, and logo settings.</p>
              <p>For questions about privacy or the service, use the <Link href="/en/contact">contact page</Link>. Requests about information handled directly by an external provider should be sent to that provider.</p>
            </>
          ),
        },
        {
          id: 'changes-and-contact',
          index: '06',
          title: 'Changes and contact',
          children: (
            <>
              <p>We may update this policy when the service, advertising setup, or applicable requirements change. The effective date on this page will be updated when a revision is published.</p>
              <p>Last updated: August 13, 2026.</p>
            </>
          ),
        },
      ]}
    />
  )
}
