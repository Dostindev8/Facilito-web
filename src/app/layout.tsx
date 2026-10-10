import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { Poppins } from 'next/font/google';
import { CookieBanner } from '@/components/marketing/cookie-banner';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SmoothScroll } from '@/components/marketing/smooth-scroll';
import { WhatsAppButton } from '@/components/marketing/whatsapp-button';
import { siteUrl } from '@/lib/site';
import './globals.css';
import './marketing.css';

const sans = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: 'Facilito — Tu negocio, más fácil cada día', template: '%s · Facilito' },
  description: 'Ventas, inventario y facturación para negocios en República Dominicana. Facilito by Logic Code Spot.',
  applicationName: 'Facilito',
};

export const viewport: Viewport = {
  themeColor: '#0E8A5F',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Reading request headers opts every page into dynamic rendering so the CSP nonce is applied.
  await headers();
  return (
    <html lang="es-DO" className={sans.variable}>
      <body>
        <div className="mkt">
          <a className="skip-link mkt-skip" href="#contenido">
            Saltar al contenido
          </a>
          <SmoothScroll />
          <SiteHeader />
          <main id="contenido" className="mkt-main">
            {children}
          </main>
          <SiteFooter />
          <WhatsAppButton />
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
