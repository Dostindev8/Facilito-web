'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const SHOW_AFTER_PX = 720;

export function BackToTop() {
  const [scrolled, setScrolled] = useState(false);
  const [footerInView, setFooterInView] = useState(false);
  // The footer has its own "Volver arriba"; hiding the floating button there keeps it off the footer links.
  const visible = scrolled && !footerInView;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > SHOW_AFTER_PX);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    const footer = document.querySelector('.mkt-footer');
    const observer =
      footer && 'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => setFooterInView(Boolean(entry?.isIntersecting)))
        : null;
    if (footer) observer?.observe(footer);
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.getElementById('contenido')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      className="mkt-top"
      data-visible={visible || undefined}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={toTop}
    >
      <ArrowUp size={20} aria-hidden />
      <span className="sr-only">Volver arriba</span>
    </button>
  );
}
