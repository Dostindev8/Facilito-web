import { PageHero } from '@/components/marketing/page-hero';
import { PricingFaq } from '@/components/marketing/pricing-faq';
import { PricingTable } from '@/components/marketing/pricing-table';
import { JsonLd } from '@/components/marketing/json-ld';
import { pricingFaqs } from '@/content/pricing';
import { breadcrumbJsonLd, faqJsonLd, pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Precios',
  description: 'Planes de Facilito: Pro US$16/mes y Business US$39/mes. El primer mes es gratis y te preparamos el usuario según el plan.',
  path: '/precios',
});

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Precios', path: '/precios' },
        ])}
      />
      <JsonLd data={faqJsonLd([...pricingFaqs])} />
      <PageHero
        eyebrow="Planes"
        title="Precios"
        lead="Dos planes mensuales. Eliges uno, te preparamos el usuario y el primer mes es gratis."
      />
      <section className="mkt-section mkt-section-tight mkt-anchor" id="planes" aria-label="Planes">
        <div className="mkt-wrap">
          <PricingTable />
        </div>
      </section>
      <section className="mkt-section mkt-section-soft" aria-labelledby="faq">
        <div className="mkt-wrap mkt-wrap-narrow">
          <h2 id="faq">Preguntas frecuentes</h2>
          <PricingFaq />
        </div>
      </section>
    </>
  );
}
