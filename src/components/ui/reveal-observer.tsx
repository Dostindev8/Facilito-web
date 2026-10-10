'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Progressive enhancement for [data-reveal] blocks. Content is visible in the HTML;
 * only after this runs are off-screen blocks hidden and revealed on scroll.
 * Blocks already in the viewport are marked visible synchronously, so nothing above the fold flickers.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    const pending = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')];
    const fold = window.innerHeight;
    for (const el of pending) {
      if (el.getBoundingClientRect().top < fold * 0.95) el.setAttribute('data-revealed', 'static');
    }
    root.classList.add('js-reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', 'in');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    for (const el of pending) if (!el.hasAttribute('data-revealed')) observer.observe(el);

    // Safety net: never leave content hidden if an observer callback is missed.
    const timer = window.setTimeout(() => {
      for (const el of pending) {
        if (!el.hasAttribute('data-revealed') && el.getBoundingClientRect().top < window.innerHeight) el.setAttribute('data-revealed', 'in');
      }
    }, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
