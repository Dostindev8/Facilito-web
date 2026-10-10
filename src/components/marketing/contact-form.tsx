'use client';

import { useActionState, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { submitContact } from '@/app/contacto/actions';
import { contactFieldErrors } from '@/lib/validations/contact';
import { BUSINESS_TYPE_OPTIONS, CONTACT_LIMITS, CONTACT_MOTIVES, contactIdle } from '@/lib/validations/contact-fields';

const MOTIVE_LABEL = { demo: 'Pedir demo', ventas: 'Ventas', soporte: 'Soporte' } as const;
type Motive = (typeof CONTACT_MOTIVES)[number];
type FieldName = 'nombre' | 'telefono' | 'email' | 'tipoNegocio' | 'motivo' | 'mensaje';
const FIELD_ORDER: readonly FieldName[] = ['nombre', 'telefono', 'email', 'tipoNegocio', 'motivo', 'mensaje'];

export function ContactForm({ initialMotivo }: { initialMotivo: Motive }) {
  const [state, action, pending] = useActionState(submitContact, contactIdle);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const uid = useId();
  const [values, setValues] = useState<Record<FieldName, string>>({
    nombre: '',
    telefono: '',
    email: '',
    tipoNegocio: 'colmado',
    motivo: initialMotivo,
    mensaje: '',
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [clientMessage, setClientMessage] = useState('');
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  useEffect(() => {
    setClientMessage('');
    setServerErrors(state.fieldErrors);
    if (state.status === 'error') {
      statusRef.current?.focus();
    } else if (state.status === 'success') {
      setValues((current) => ({ ...current, mensaje: '' }));
      setTouched({});
      statusRef.current?.focus();
    }
  }, [state]);

  const errors = { ...serverErrors, ...clientErrors };
  const message = clientMessage || state.message;
  const isSuccess = !clientMessage && state.status === 'success';

  const validate = (next: Record<FieldName, string>) => contactFieldErrors({ ...next, company_website: '' });

  const update = (name: FieldName, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (serverErrors[name]) {
      setServerErrors((current) => {
        const copy = { ...current };
        delete copy[name];
        return copy;
      });
    }
    if (touched[name]) {
      const fieldError = validate(next)[name];
      setClientErrors((current) => {
        const copy = { ...current };
        if (fieldError) copy[name] = fieldError;
        else delete copy[name];
        return copy;
      });
    }
  };

  const blur = (name: FieldName) => {
    setTouched((current) => ({ ...current, [name]: true }));
    const fieldError = validate(values)[name];
    setClientErrors((current) => {
      const copy = { ...current };
      if (fieldError) copy[name] = fieldError;
      else delete copy[name];
      return copy;
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (pending) {
      event.preventDefault();
      return;
    }
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      setClientErrors(found);
      setTouched(Object.fromEntries(FIELD_ORDER.map((name) => [name, true])));
      setClientMessage('Revisa los campos marcados.');
      const first = FIELD_ORDER.find((name) => found[name]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setClientErrors({});
    setClientMessage('');
  };

  const fieldProps = (name: FieldName) => ({
    id: `${uid}-${name}`,
    name,
    value: values[name],
    onBlur: () => blur(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${uid}-${name}-error` : undefined,
  });

  const errorFor = (name: FieldName) =>
    errors[name] ? (
      <p id={`${uid}-${name}-error`} className="mkt-field-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form ref={formRef} className="mkt-form" action={action} onSubmit={onSubmit} noValidate aria-busy={pending}>
      <div className="mkt-hp" aria-hidden="true">
        <label>
          Sitio web
          <input name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="mkt-field">
        <label htmlFor={`${uid}-nombre`}>Nombre</label>
        <input {...fieldProps('nombre')} required maxLength={CONTACT_LIMITS.name} autoComplete="name" onChange={(event) => update('nombre', event.target.value)} />
        {errorFor('nombre')}
      </div>

      <div className="mkt-form-row">
        <div className="mkt-field">
          <label htmlFor={`${uid}-telefono`}>WhatsApp o celular</label>
          <input
            {...fieldProps('telefono')}
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="809 000 0000"
            onChange={(event) => update('telefono', event.target.value)}
          />
          {errorFor('telefono')}
        </div>
        <div className="mkt-field">
          <label htmlFor={`${uid}-email`}>Correo</label>
          <input
            {...fieldProps('email')}
            required
            type="email"
            autoComplete="email"
            maxLength={CONTACT_LIMITS.email}
            onChange={(event) => update('email', event.target.value)}
          />
          {errorFor('email')}
        </div>
      </div>

      <div className="mkt-form-row">
        <div className="mkt-field">
          <label htmlFor={`${uid}-tipoNegocio`}>Tipo de negocio</label>
          <select {...fieldProps('tipoNegocio')} onChange={(event) => update('tipoNegocio', event.target.value)}>
            {BUSINESS_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errorFor('tipoNegocio')}
        </div>
        <div className="mkt-field">
          <label htmlFor={`${uid}-motivo`}>Motivo</label>
          <select {...fieldProps('motivo')} onChange={(event) => update('motivo', event.target.value)}>
            {CONTACT_MOTIVES.map((item) => (
              <option key={item} value={item}>
                {MOTIVE_LABEL[item]}
              </option>
            ))}
          </select>
          {errorFor('motivo')}
        </div>
      </div>

      <div className="mkt-field">
        <label htmlFor={`${uid}-mensaje`}>Mensaje</label>
        <textarea
          {...fieldProps('mensaje')}
          required
          minLength={10}
          maxLength={CONTACT_LIMITS.message}
          rows={5}
          onChange={(event) => update('mensaje', event.target.value)}
        />
        <span className="mkt-field-hint" aria-hidden="true">
          {values.mensaje.length}/{CONTACT_LIMITS.message}
        </span>
        {errorFor('mensaje')}
      </div>

      <button type="submit" className="btn btn-primary mkt-submit" disabled={pending}>
        {pending ? <Loader2 size={18} className="mkt-spin" aria-hidden /> : <Send size={18} aria-hidden />}
        {pending ? 'Enviando…' : 'Enviar mensaje'}
      </button>

      <p
        ref={statusRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={message ? (isSuccess ? 'mkt-form-status mkt-success' : 'mkt-form-status mkt-error') : 'mkt-form-status'}
      >
        {isSuccess && <CheckCircle2 size={18} aria-hidden />}
        {message}
      </p>
    </form>
  );
}
