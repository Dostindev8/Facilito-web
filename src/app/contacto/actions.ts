'use server';

import { headers } from 'next/headers';
import { createContactNotifier } from '@/lib/contact-notifier';
import { hitRateLimit, ipKey } from '@/lib/rate-limit';
import { parseContact, type ContactFormState } from '@/lib/validations/contact';

/** Upper bound for the whole submission; the schema enforces per-field limits. */
const MAX_FORM_BYTES = 8 * 1024;

async function clientKey(): Promise<string> {
  const h = await headers();
  // On Vercel the platform overwrites x-forwarded-for; the first hop is the client.
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return ipKey(h.get('x-real-ip') || forwarded || 'local');
}

function formBytes(formData: FormData): number {
  let total = 0;
  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') return Number.POSITIVE_INFINITY;
    total += key.length + value.length;
  }
  return total;
}

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  if (formBytes(formData) > MAX_FORM_BYTES) {
    return { status: 'error', message: 'El mensaje es demasiado largo.', fieldErrors: {} };
  }

  const raw = {
    nombre: formData.get('nombre'),
    telefono: formData.get('telefono'),
    email: formData.get('email'),
    tipoNegocio: formData.get('tipoNegocio'),
    mensaje: formData.get('mensaje'),
    motivo: formData.get('motivo'),
    plan: formData.get('plan') ?? undefined,
    company_website: formData.get('company_website') ?? '',
  };

  const parsed = parseContact(raw);
  if (!parsed.ok) {
    if (parsed.honeypot) {
      return { status: 'error', message: 'No pudimos enviar el mensaje.', fieldErrors: {} };
    }
    const first = Object.values(parsed.fieldErrors)[0] ?? 'Revisa los campos.';
    return { status: 'error', message: first, fieldErrors: parsed.fieldErrors };
  }

  const limit = await hitRateLimit(`contact:${await clientKey()}`);
  if (!limit.ok) {
    return {
      status: 'error',
      message: 'Demasiados envíos. Espera un momento e intenta de nuevo.',
      fieldErrors: {},
    };
  }

  try {
    const result = await createContactNotifier().send(parsed.message);
    if (result === 'unconfigured') {
      return {
        status: 'error',
        message: 'El correo de contacto no está configurado. Escríbenos por WhatsApp si el botón está disponible, o intenta más tarde.',
        fieldErrors: {},
      };
    }
    return { status: 'success', message: 'Listo. Recibimos tu mensaje y te respondemos por el correo o el WhatsApp que dejaste.', fieldErrors: {} };
  } catch {
    return { status: 'error', message: 'No pudimos enviar el mensaje. Intenta de nuevo en unos minutos.', fieldErrors: {} };
  }
}
