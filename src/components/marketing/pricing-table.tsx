import Link from 'next/link';
import { Check, Gift, MessageCircle } from 'lucide-react';
import { plans, startSteps, TRIAL } from '@/content/pricing';
import { planContactPath, whatsappHref, whatsappPlanText } from '@/lib/site';

export function PricingTable() {
  return (
    <>
      <p className="mkt-trial-banner" role="note">
        <Gift size={20} aria-hidden />
        <span>{TRIAL.note}</span>
      </p>
      <div className="mkt-prices">
        {plans.map((plan, index) => {
          const wa = whatsappHref(whatsappPlanText(plan.name));
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
              <p className="mkt-price-trial">{TRIAL.label}, luego US${plan.priceUsd} al mes</p>
              <p className="mkt-price-blurb">{plan.blurb}</p>
              <ul className="mkt-checks">
                {plan.items.map((item) => (
                  <li key={item}>
                    <Check size={18} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Link className={`btn ${plan.featured ? 'btn-primary' : 'btn-outline'}`} href={planContactPath(plan.id)}>
                {plan.cta}
              </Link>
              {wa && (
                <a className="mkt-price-wa" href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} aria-hidden />
                  Pedirlo por WhatsApp
                </a>
              )}
            </article>
          );
        })}
      </div>
      <div className="mkt-start" data-reveal>
        <h2 id="como-empiezas">Cómo empiezas</h2>
        <ol aria-labelledby="como-empiezas">
          {startSteps.map((step, index) => (
            <li key={step.title}>
              <span className="mkt-start-n" aria-hidden="true">
                {index + 1}
              </span>
              <strong>{step.title}</strong>
              <span>{step.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
