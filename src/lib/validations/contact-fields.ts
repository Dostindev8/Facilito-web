// Constants and form state shared by the server action and the client form.
export const BUSINESS_TYPES = ['colmado', 'ferreteria', 'farmacia', 'salon', 'restaurante', 'boutique', 'servicios', 'otro'] as const;
export const CONTACT_MOTIVES = ['demo', 'ventas', 'soporte'] as const;
/** Plan the visitor asks for; must match the plan ids in content/pricing.ts. */
export const CONTACT_PLANS = ['sin-definir', 'pro', 'business'] as const;

export const CONTACT_LIMITS = {
  name: 80,
  email: 120,
  message: 1000,
  honeypot: 200,
} as const;

const businessLabel: Record<(typeof BUSINESS_TYPES)[number], string> = {
  colmado: 'Colmado',
  ferreteria: 'Ferretería',
  farmacia: 'Farmacia',
  salon: 'Salón',
  restaurante: 'Restaurante',
  boutique: 'Boutique',
  servicios: 'Servicios profesionales',
  otro: 'Otro',
};

export const BUSINESS_TYPE_OPTIONS = BUSINESS_TYPES.map((value) => ({ value, label: businessLabel[value] }));

export interface ContactFormState {
  status: 'idle' | 'success' | 'error';
  message: string;
  fieldErrors: Record<string, string>;
}

export const contactIdle: ContactFormState = { status: 'idle', message: '', fieldErrors: {} };
