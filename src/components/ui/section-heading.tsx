import type { ReactNode } from 'react';

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  align = 'start',
  as: Tag = 'h2',
  tone = 'default',
  children,
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'start' | 'center';
  as?: 'h1' | 'h2';
  tone?: 'default' | 'light';
  children?: ReactNode;
}) {
  return (
    <header className="mkt-heading" data-align={align} data-tone={tone} data-reveal>
      {eyebrow && <p className="mkt-eyebrow">{eyebrow}</p>}
      <Tag id={id}>{title}</Tag>
      {lead && <p className="mkt-lead">{lead}</p>}
      {children}
    </header>
  );
}
