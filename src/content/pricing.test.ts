import { describe, expect, it } from 'vitest';
import { copy } from './copy.es';
import { plans, PRICES_CONFIRMED, pricingFaqs, startSteps } from './pricing';
import { CONTACT_PLANS } from '../lib/validations/contact-fields';

const allText = JSON.stringify({ copy, plans, pricingFaqs, startSteps });

describe('planes y mes gratis', () => {
  it('publica solo Pro y Business con sus precios confirmados', () => {
    expect(PRICES_CONFIRMED).toBe(true);
    expect(plans.map((plan) => [plan.id, plan.priceUsd])).toEqual([
      ['pro', 16],
      ['business', 39],
    ]);
    expect(plans.filter((plan) => plan.featured)).toHaveLength(1);
  });

  it('los planes del formulario coinciden con los publicados', () => {
    expect(CONTACT_PLANS.filter((id) => id !== 'sin-definir')).toEqual(plans.map((plan) => plan.id));
  });

  it('el sitio ya no dice que el servicio es gratis ni que el registro no cobra', () => {
    expect(allText).not.toMatch(/Empezar gratis|Plan Gratis|no pide tarjeta|no cobra|precios de referencia/i);
  });

  it('explica el mes gratis, la preparación del usuario y el pago por transferencia', () => {
    expect(allText).toMatch(/primer mes (es )?gratis/i);
    expect(allText).toMatch(/preparamos (el|tu) usuario/i);
    expect(pricingFaqs.find((faq) => faq.question === '¿Cómo se paga?')?.answer).toMatch(/transferencia/);
    expect(startSteps).toHaveLength(4);
  });
});
