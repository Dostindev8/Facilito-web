import { describe, expect, it } from 'vitest';
import { contactFieldErrors, parseContact } from './contact';

const valid = {
  nombre: 'María Pérez',
  telefono: '809-555-0101',
  email: 'maria@colmado.test',
  tipoNegocio: 'colmado',
  mensaje: 'Quiero ver el inventario con mis productos.',
  motivo: 'demo',
  company_website: '',
};

describe('parseContact', () => {
  it('normaliza un envío válido', () => {
    const result = parseContact(valid);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.message.telefono).toBe('+18095550101');
  });

  it('rechaza campos de más y límites', () => {
    expect(parseContact({ ...valid, extra: 'no' }).ok).toBe(false);
    const longName = parseContact({ ...valid, nombre: 'a'.repeat(81) });
    expect(longName.ok).toBe(false);
    const shortMsg = parseContact({ ...valid, mensaje: 'hola' });
    expect(shortMsg.ok).toBe(false);
    if (!shortMsg.ok && !shortMsg.honeypot) expect(shortMsg.fieldErrors.mensaje).toBeTruthy();
  });

  it('acepta el plan elegido y usa "sin-definir" si no viene', () => {
    const withPlan = parseContact({ ...valid, plan: 'pro' });
    expect(withPlan.ok && withPlan.message.plan).toBe('pro');
    const withoutPlan = parseContact(valid);
    expect(withoutPlan.ok && withoutPlan.message.plan).toBe('sin-definir');
    expect(parseContact({ ...valid, plan: 'gratis' }).ok).toBe(false);
  });

  it('rechaza el honeypot sin tratarlo como error de campo', () => {
    const result = parseContact({ ...valid, company_website: 'https://spam.test' });
    expect(result).toEqual({ ok: false, honeypot: true });
  });

  it('exige celular dominicano', () => {
    const result = parseContact({ ...valid, telefono: '5551234567' });
    expect(result.ok).toBe(false);
    if (!result.ok && !result.honeypot) expect(result.fieldErrors.telefono).toMatch(/809/);
  });

  it('rechaza valores que no son texto (FormData con archivos)', () => {
    expect(parseContact({ ...valid, mensaje: 42 }).ok).toBe(false);
    expect(parseContact({ ...valid, nombre: null }).ok).toBe(false);
  });
});

describe('contactFieldErrors (validación del formulario en el navegador)', () => {
  it('devuelve un mensaje por campo, en español', () => {
    const errors = contactFieldErrors({ ...valid, nombre: '', email: 'no-es-correo' });
    expect(errors.nombre).toBe('Escribe tu nombre.');
    expect(errors.email).toBe('Escribe un correo válido.');
  });

  it('vacío cuando el envío es válido o es el honeypot', () => {
    expect(contactFieldErrors(valid)).toEqual({});
    expect(contactFieldErrors({ ...valid, company_website: 'x' })).toEqual({});
  });
});
