import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { LogoMark } from '@/components/brand/logo';
import { copy } from '@/content/copy.es';
import { site, whatsappHref, WHATSAPP_DEMO_TEXT } from '@/lib/site';

export function FinalCta() {
  const wa = whatsappHref(WHATSAPP_DEMO_TEXT);
  return (
    <section className="mkt-final" aria-labelledby="cierre">
      <div className="mkt-wrap">
        <div className="mkt-final-box" data-reveal>
          <h2 id="cierre" className="mkt-final-manifesto">
            {copy.manifesto}
          </h2>
          <div className="mkt-final-copy">
            <p className="mkt-final-title">{copy.final.title}</p>
            <p>{copy.final.body}</p>
            <div className="mkt-actions">
              <a className="btn btn-light" href={site.registerPath}>
                Empezar gratis
                <ArrowRight size={18} aria-hidden />
              </a>
              <Link className="btn btn-accent" href="/contacto">
                Contacto
              </Link>
            </div>
            {wa && (
              <a className="mkt-final-wa" href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} aria-hidden />
                {copy.final.whatsapp}
              </a>
            )}
          </div>
          <span className="mkt-final-mark" aria-hidden="true">
            <LogoMark size={176} />
          </span>
        </div>
      </div>
    </section>
  );
}
