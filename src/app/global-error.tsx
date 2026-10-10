'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import './globals.css';
import './marketing.css';

/** Last-resort boundary: replaces the root layout when it crashes, so it must render its own <html>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[facilito-web] unhandled UI error', { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <html lang="es-DO">
      <body>
        <main className="mkt">
          <section className="mkt-status" role="alert">
            <h1>Algo salió mal</h1>
            <p>Ocurrió un error inesperado. Recarga la página o vuelve al inicio.</p>
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
        </main>
      </body>
    </html>
  );
}
