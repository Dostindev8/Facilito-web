import Link from 'next/link';
import { Check, Info } from 'lucide-react';
import { plans, PRICES_CONFIRMED } from '@/content/pricing';
import { site } from '@/lib/site';

export function PricingTable() {
  return (
    <>
      {!PRICES_CONFIRMED && (
        <p className="mkt-price-banner" role="note">
          <Info size={18} aria-hidden />
          <span>Precios de referencia. No son una oferta vigente: hay que confirmarlos con {site.maker} antes de contratar.</span>
        </p>
      )}
      <div className="mkt-prices">
        {plans.map((plan, index) => {
          const cta = plan.id === 'gratis' ? site.registerPath : '/contacto?motivo=ventas';
          return (
            <article
              key={plan.id}
              className={`mkt-price${plan.featured ? ' featured' : ''}`}
              aria-labelledby={`plan-${plan.id}`}
              data-reveal
              style={{ ['--reveal-i' as string]: index }}
            >
              {plan.featured && <span className="mkt-price-flag">Recomendado</span>}
              <h2 id={`plan-${plan.id}`}>{plan.name}</h2>
              <p className="mkt-price-amount">
                <strong>US${plan.priceUsd}</strong>
                <span> / mes</span>
              </p>
              <p className="mkt-price-blurb">{plan.blurb}</p>
              <ul className="mkt-checks">
                {plan.items.map((item) => (
                  <li key={item}>
                    <Check size={18} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              {plan.id === 'gratis' ? (
                <a className={`btn ${plan.featured ? 'btn-primary' : 'btn-outline'}`} href={cta}>
                  {plan.cta}
                </a>
              ) : (
                <Link className={`btn ${plan.featured ? 'btn-primary' : 'btn-outline'}`} href={cta}>
                  {plan.cta}
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
