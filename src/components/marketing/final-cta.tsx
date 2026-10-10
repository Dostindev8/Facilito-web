import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { LogoMark } from '@/components/brand/logo';
import { copy } from '@/content/copy.es';
import { site, whatsappHref, WHATSAPP_DEMO_TEXT } from '@/lib/site';

export function FinalCta() {
  const wa = whatsappHref(WHATSAPP_DEMO_TEXT);
  return (
    <section className="mkt-final" aria-labelledby="cierre">
      <div className="mkt-wrap">
        <div className="mkt-final-box" data-reveal>
          <div className="mkt-final-copy">
            <h2 id="cierre">{copy.final.title}</h2>
            <p>{copy.final.body}</p>
            <div className="mkt-actions">
              <a className="btn btn-light" href={site.registerPath}>
                Empezar gratis
              </a>
              {wa ? (
                <a className="btn btn-accent" href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} aria-hidden />
                  {copy.final.whatsapp}
                </a>
              ) : (
                <Link className="btn btn-accent" href="/contacto">
                  Contacto
                </Link>
              )}
            </div>
          </div>
          <span className="mkt-final-mark" aria-hidden="true">
            <LogoMark size={176} />
          </span>
        </div>
      </div>
    </section>
  );
}
