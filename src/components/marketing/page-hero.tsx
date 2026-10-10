import type { ReactNode } from 'react';

/** Shared header band for inner pages: same container and rhythm as the home sections. */
export function PageHero({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead: ReactNode; children?: ReactNode }) {
  return (
    <section className="mkt-page-hero" aria-labelledby="page-title">
      <div className="mkt-wrap">
        <p className="mkt-eyebrow">{eyebrow}</p>
        <h1 id="page-title">{title}</h1>
        <p className="mkt-lead">{lead}</p>
        {children}
      </div>
    </section>
  );
}
