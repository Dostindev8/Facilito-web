import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { Poppins } from 'next/font/google';
import { BackToTop } from '@/components/marketing/back-to-top';
import { CookieBanner } from '@/components/marketing/cookie-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SmoothScroll } from '@/components/marketing/smooth-scroll';
import { WhatsAppButton } from '@/components/marketing/whatsapp-button';
import { RevealObserver } from '@/components/ui/reveal-observer';
import { WebVitals } from '@/components/web-vitals';
import { robotsMeta } from '@/lib/seo';
import { site, siteUrl } from '@/lib/site';
import './globals.css';
import './marketing.css';

const sans = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'optional' });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: `${site.name} - ${site.tagline}`, template: '%s · Facilito' },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.maker }],
  creator: site.maker,
  publisher: site.legalName,
  formatDetection: { telephone: false, email: false, address: false },
  robots: robotsMeta(),
};

export const viewport: Viewport = {
  themeColor: '#0D855B',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reading request headers opts every page into dynamic rendering so the CSP nonce is applied.
  await headers();
  return (
    <html lang="es-DO" className={sans.variable} data-scroll-behavior="smooth">
      <body>
        <div className="mkt">
          <a className="skip-link" href="#contenido">
            Saltar al contenido
          </a>
          <SmoothScroll />
          <RevealObserver />
          <WebVitals />
          <SiteHeader />
          <main id="contenido" className="mkt-main" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
          <BackToTop />
          <WhatsAppButton />
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
