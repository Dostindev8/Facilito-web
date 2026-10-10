import { HeartHandshake, MapPin, Sparkles } from 'lucide-react';
import { LogoMark } from '@/components/brand/logo';
import { JsonLd } from '@/components/marketing/json-ld';
import { PageHero } from '@/components/marketing/page-hero';
import { breadcrumbJsonLd, pageMeta } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = pageMeta({
  title: 'Nosotros',
  description: 'Facilito es de Logic Code Spot, en Santo Domingo. Software de gestión para negocios dominicanos.',
  path: '/nosotros',
});

const VALUES = [
  { icon: MapPin, title: 'Desde Santo Domingo', body: 'Pensado para el colmado, la ferretería y el salón de aquí.' },
  { icon: Sparkles, title: 'Simple primero', body: 'Menos fricción en la caja y en el inventario.' },
  { icon: HeartHandshake, title: 'Sin humo', body: 'Lo que no está en el panel no se vende como si estuviera.' },
] as const;

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Nosotros', path: '/nosotros' },
        ])}
      />
      <PageHero eyebrow="Quiénes somos" title="Nosotros" lead={`Facilito es de ${site.maker}, en ${site.city}.`} />
      <section className="mkt-section mkt-section-tight" aria-label="Historia">
        <div className="mkt-wrap mkt-about">
          <div className="mkt-about-copy">
            <p data-reveal>
              {site.legalName} nace en {site.city} para que un colmado, una ferretería o un salón no dependan de un cuaderno y de tres hojas de cálculo para saber si el día cerró bien.
            </p>
            <h2 data-reveal>La misión</h2>
            <p data-reveal>
              Menos fricción en la caja y en el inventario. El lema es simple: {site.tagline}. El cierre que buscamos: {site.closing}.
            </p>
            <h2 data-reveal>Quién lo hace</h2>
            <p data-reveal>
              {site.maker} diseña y mantiene Facilito. No publicamos cifras de clientes ni reseñas: preferimos que el producto se vea en el panel, no en una estrella inventada.
            </p>
          </div>
          <figure className="mkt-about-art" data-reveal>
            <div className="mkt-about-panel" aria-hidden="true">
              <LogoMark size={128} />
              <span className="mkt-about-ring mkt-about-ring-1" />
              <span className="mkt-about-ring mkt-about-ring-2" />
            </div>
            <figcaption>Ilustración propia con los colores de la marca. No usamos fotos de stock.</figcaption>
          </figure>
        </div>
      </section>
      <section className="mkt-section mkt-section-soft" aria-label="Valores">
        <div className="mkt-wrap">
          <ul className="mkt-values">
            {VALUES.map(({ icon: Icon, title, body }, index) => (
              <li key={title} className="mkt-card" data-reveal style={{ ['--reveal-i' as string]: index }}>
                <div className="mkt-icon">
                  <Icon size={22} aria-hidden />
                </div>
                <h2>{title}</h2>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
