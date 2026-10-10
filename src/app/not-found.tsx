import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="mkt-status" aria-labelledby="nf-title">
      <LogoMark size={64} />
      <p className="mkt-status-code" aria-hidden="true">
        404
      </p>
      <h1 id="nf-title">Esta página no está</h1>
      <p>La dirección no existe o se movió. Puedes volver al inicio o entrar a tu cuenta.</p>
      <div className="mkt-actions">
        <Link href="/" className="btn btn-primary">
          Ir al inicio
        </Link>
        <a href={site.loginPath} className="btn btn-outline">
          Iniciar sesión
        </a>
      </div>
    </section>
  );
}
