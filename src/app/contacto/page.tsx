import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/marketing/contact-form';
import { JsonLd } from '@/components/marketing/json-ld';
import { PageHero } from '@/components/marketing/page-hero';
import { CONTACT_MOTIVES } from '@/lib/validations/contact-fields';
import { breadcrumbJsonLd, pageMeta } from '@/lib/seo';
import { site, whatsappHref, WHATSAPP_DEMO_TEXT } from '@/lib/site';

export const metadata = pageMeta({
  title: 'Contacto',
  description: 'Pide una demo o escribe a Facilito. Santo Domingo, República Dominicana.',
  path: '/contacto',
});

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  const { motivo } = await searchParams;
  const initial = CONTACT_MOTIVES.find((item) => item === motivo) ?? 'ventas';
  const wa = whatsappHref(WHATSAPP_DEMO_TEXT);
  const map = 'https://www.google.com/maps/search/?api=1&query=Santo%20Domingo%20Republica%20Dominicana';

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Contacto', path: '/contacto' },
        ])}
      />
      <PageHero
        eyebrow="Hablemos"
        title="Contacto"
        lead="Cuéntanos del negocio. Si el correo no está configurado en el servidor, el formulario lo dice claro y no finge que envió."
      />
      <section className="mkt-section mkt-section-tight" aria-label="Formulario de contacto">
        <div className="mkt-wrap mkt-contact">
          <div className="mkt-contact-card">
            <ContactForm initialMotivo={initial} />
          </div>
          <aside className="mkt-contact-side" aria-labelledby="contact-side">
            <h2 id="contact-side">También por aquí</h2>
            <ul>
              <li>
                <MessageCircle size={20} aria-hidden />
                {wa ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                ) : (
                  <span>Pronto publicamos nuestra línea de WhatsApp. Mientras, usa el formulario.</span>
                )}
              </li>
              <li>
                <Mail size={20} aria-hidden />
                {site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : <span>Pronto publicamos el correo de contacto.</span>}
              </li>
              <li>
                <MapPin size={20} aria-hidden />
                <span>
                  {site.city}, {site.country}
                  <br />
                  <a href={map} target="_blank" rel="noopener noreferrer">
                    Ver Santo Domingo en el mapa
                  </a>
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
