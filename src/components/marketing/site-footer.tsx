import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { LcsCredit } from './lcs-credit';
import { copy } from '@/content/copy.es';
import { site, whatsappHref, WHATSAPP_DEMO_TEXT } from '@/lib/site';

const PRODUCT = [
  { href: '/features', label: 'Producto' },
  { href: '/precios', label: 'Precios' },
  { href: `/#${copy.how.id}`, label: 'Cómo funciona' },
] as const;

const COMPANY = [
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/contacto?motivo=demo', label: 'Pedir demo' },
] as const;

const LEGAL = [
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/terminos', label: 'Términos' },
  { href: '/legal/cookies', label: 'Cookies' },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();
  const wa = whatsappHref(WHATSAPP_DEMO_TEXT);
  return (
    <footer className="mkt-footer">
      <div className="mkt-footer-watermark" aria-hidden="true">
        <Image src="/brand/facilito-mark.png" alt="" width={520} height={520} sizes="(min-width: 1024px) 520px, 280px" draggable={false} />
      </div>
      <div className="mkt-wrap mkt-footer-inner">
        <div className="mkt-footer-grid">
          <div className="mkt-footer-brand" data-reveal>
            <Logo size={40} tone="light" byline />
            <p>{site.description}</p>
            <div className="mkt-footer-cta">
              <a className="btn btn-primary btn-sm" href={site.registerPath}>
                Empezar gratis
              </a>
              <a className="btn btn-glass btn-sm" href={site.loginPath}>
                Iniciar sesión
              </a>
            </div>
          </div>
          <nav aria-label="Producto" className="mkt-footer-col" data-reveal style={{ ['--reveal-i' as string]: 1 }}>
            <h2>Producto</h2>
            <ul>
              {PRODUCT.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Empresa" className="mkt-footer-col" data-reveal style={{ ['--reveal-i' as string]: 2 }}>
            <h2>Empresa</h2>
            <ul>
              {COMPANY.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mkt-footer-col" data-reveal style={{ ['--reveal-i' as string]: 3 }}>
            <h2>Contacto</h2>
            <ul>
              {site.email ? (
                <li>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
              ) : null}
              {wa ? (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
              ) : null}
              <li>
                <span>
                  {site.city}, {site.country}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mkt-footer-bottom">
          <div className="mkt-footer-meta">
            <small>
              © {year} {site.legalName}
            </small>
            <LcsCredit />
          </div>
          <nav aria-label="Legal">
            <ul>
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              <li>
                <a href="#contenido">
                  Volver arriba
                  <ArrowUp size={14} aria-hidden />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
