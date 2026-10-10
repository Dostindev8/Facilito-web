'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[facilito-web] page error', { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <section className="mkt-status" role="alert">
      <h1>No pudimos abrir esta página</h1>
      <p>Ocurrió un error inesperado. Intenta de nuevo en unos segundos.</p>
      {error.digest && <p className="mkt-status-digest">Código: {error.digest}</p>}
      <div className="mkt-actions">
        <button type="button" className="btn btn-primary" onClick={reset}>
          Reintentar
        </button>
        <Link href="/" className="btn btn-outline">
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
