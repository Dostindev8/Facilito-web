'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { MARQUEE_PX_PER_S } from '@/lib/motion-tokens';

/**
 * Wraps the CSS marquee: sets the duration from the measured width of one copy (constant px/s)
 * and flags when the band is on screen so the animation and `will-change` only run while visible.
 * No per-frame JavaScript: the loop itself is a CSS animation.
 */
export function MarqueeMotion({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    const copy = root?.querySelector<HTMLElement>('.mkt-marquee-track');
    if (!root || !copy) return;

    let width = 0;
    const measure = () => {
      const next = copy.getBoundingClientRect().width;
      if (Math.abs(next - width) < 1) return;
      width = next;
      root.style.setProperty('--marquee-duration', `${(width / MARQUEE_PX_PER_S).toFixed(2)}s`);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(copy);

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) root.setAttribute('data-inview', '');
      else root.removeAttribute('data-inview');
    });
    visibility.observe(root);

    return () => {
      resize.disconnect();
      visibility.disconnect();
    };
  }, []);

  return (
    <section ref={ref} className="mkt-marquee" aria-label={label}>
      {children}
    </section>
  );
}
