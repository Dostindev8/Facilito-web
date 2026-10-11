import type { ReactNode } from 'react';

/** Wraps the first occurrence of `emphasis` in the accent span; falls back to the plain title. */
function withEmphasis(title: ReactNode, emphasis?: string): ReactNode {
  if (!emphasis || typeof title !== 'string') return title;
  const at = title.indexOf(emphasis);
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <span className="mkt-em">{emphasis}</span>
      {title.slice(at + emphasis.length)}
    </>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  index,
  title,
  emphasis,
  lead,
  align = 'start',
  as: Tag = 'h2',
  tone = 'default',
  children,
}: {
  id: string;
  eyebrow?: string;
  /** Section number shown before the eyebrow, e.g. 1 → "01 — Producto". */
  index?: number;
  title: ReactNode;
  /** Word or phrase of `title` set in the accent colour. */
  emphasis?: string;
  lead?: ReactNode;
  align?: 'start' | 'center';
  as?: 'h1' | 'h2';
  tone?: 'default' | 'light';
  children?: ReactNode;
}) {
  return (
    <header className="mkt-heading" data-align={align} data-tone={tone} data-reveal>
      {eyebrow && (
        <p className="mkt-eyebrow">
          {index !== undefined && (
            <>
              <span className="mkt-eyebrow-n">{String(index).padStart(2, '0')}</span>
              <span className="mkt-eyebrow-sep" aria-hidden="true" />
            </>
          )}
          {eyebrow}
        </p>
      )}
      <Tag id={id}>{withEmphasis(title, emphasis)}</Tag>
      {lead && <p className="mkt-lead">{lead}</p>}
      {children}
    </header>
  );
}
