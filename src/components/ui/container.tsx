import type { ElementType, ReactNode } from 'react';

/** Single source of horizontal rhythm: header, sections and footer all align to this box. */
export function Container({
  as: Tag = 'div',
  size = 'default',
  className,
  children,
}: {
  as?: ElementType;
  size?: 'default' | 'narrow';
  className?: string;
  children: ReactNode;
}) {
  const classes = ['mkt-wrap', size === 'narrow' ? 'mkt-wrap-narrow' : '', className].filter(Boolean).join(' ');
  return <Tag className={classes}>{children}</Tag>;
}
