import type { ReactNode } from 'react';
import { Scale } from 'lucide-react';

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mkt-legal">
      <p className="mkt-eyebrow">Legal</p>
      <h1>{title}</h1>
      <p className="mkt-legal-meta">Última actualización: {updated}.</p>
      <p className="mkt-legal-review" role="note">
        <Scale size={18} aria-hidden />
        <span>Borrador pendiente de revisión por abogado. No es asesoría legal.</span>
      </p>
      {children}
    </article>
  );
}

export const LEGAL_UPDATED = '7 de octubre de 2026';
