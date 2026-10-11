/**
 * Precios confirmados por Logic Code Spot (11 oct 2026): Pro US$16/mes y Business US$39/mes,
 * primer mes gratis en ambos. El equipo prepara el usuario según el plan y el pago es por
 * transferencia bancaria. No hay cobro automático ni tarjeta.
 */
export const PRICES_CONFIRMED = true;

export const TRIAL = {
  label: '1 mes gratis',
  /** Short promise reused in CTAs and notes. */
  note: 'Primer mes gratis en cualquier plan. Pagas por transferencia desde el segundo mes.',
} as const;

export type PlanId = 'pro' | 'business';

export interface Plan {
  id: PlanId;
  name: string;
  priceUsd: number;
  blurb: string;
  items: readonly string[];
  cta: string;
  featured: boolean;
}

export const plans: readonly Plan[] = [
  {
    id: 'pro',
    name: 'Pro',
    priceUsd: 16,
    blurb: 'Para el negocio que vende todos los días y quiere sus números en orden.',
    items: ['Ventas, inventario, clientes y facturas', 'Reportes por período', 'Usuario preparado por nuestro equipo', 'Soporte por el canal de contacto'],
    cta: 'Elegir Pro',
    featured: true,
  },
  {
    id: 'business',
    name: 'Business',
    priceUsd: 39,
    blurb: 'Para quien quiere acompañamiento en la puesta en marcha y respuesta prioritaria.',
    items: ['Todo lo de Pro', 'Acompañamiento para la puesta en marcha', 'Prioridad de respuesta'],
    cta: 'Elegir Business',
    featured: false,
  },
];

export const PLAN_IDS = plans.map((plan) => plan.id) as readonly PlanId[];

export function planById(id: string | undefined): Plan | undefined {
  return plans.find((plan) => plan.id === id);
}

/** How a new customer starts; shown on /precios. */
export const startSteps = [
  { title: 'Elige tu plan', body: 'Pro o Business. El primer mes no pagas nada.' },
  { title: 'Escríbenos', body: 'Por el formulario o WhatsApp, con los datos de tu negocio.' },
  { title: 'Te preparamos el usuario', body: 'Activamos tu cuenta según el plan y te enviamos el acceso.' },
  { title: 'Paga desde el segundo mes', body: 'Por transferencia bancaria, mes a mes, para seguir usando el sistema.' },
] as const;

export const pricingFaqs = [
  {
    question: '¿Cuánto cuesta Facilito?',
    answer: 'Pro cuesta US$16 al mes y Business US$39 al mes. En los dos planes el primer mes es gratis.',
  },
  {
    question: '¿Cómo funciona el mes gratis?',
    answer:
      'Eliges el plan y nos escribes. Preparamos tu usuario según ese plan y lo usas un mes completo sin pagar. Si al terminar quieres seguir, pagas la mensualidad.',
  },
  {
    question: '¿Cómo se paga?',
    answer:
      'Por transferencia bancaria, por el momento. Te damos los datos de pago al activar tu cuenta. No pedimos tarjeta y no hay cobros automáticos: nada se cobra sin que tú hagas la transferencia.',
  },
  {
    question: '¿Facilito ya envía comprobantes electrónicos a la DGII?',
    answer:
      'No. Hoy puedes emitir facturas en el panel y configurar secuencias de comprobantes. El envío electrónico e-CF está marcado como próximamente y el servicio fiscal del producto sigue en modo de prueba, apagado.',
  },
  {
    question: '¿Puedo entrar con Google?',
    answer: 'El botón está en la pantalla de acceso, pero el inicio con Google todavía no está disponible.',
  },
  {
    question: '¿Dónde quedan mis datos?',
    answer:
      'En la cuenta de tu negocio dentro de Facilito. El RNC y la cédula se guardan cifrados. La sesión de acceso usa una cookie httpOnly.',
  },
  {
    question: '¿Hay contrato anual?',
    answer: 'No. Pagas mes a mes. No hay una oferta anual publicada; cuando exista, se verá en esta página.',
  },
] as const;
