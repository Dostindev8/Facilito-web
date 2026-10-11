'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { lockScroll, unlockScroll } from '@/lib/scroll-lock';
import { site } from '@/lib/site';

const LINKS = [
  { href: '/features', label: 'Producto' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/precios', label: 'Precios' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
] as const;

const SCROLLED_PX = 24;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const overHero = pathname === '/' && !scrolled && !open;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > SCROLLED_PX);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Home only: highlight the nav link whose section sits in the middle band of the viewport.
  useEffect(() => {
    setSection(null);
    if (pathname !== '/' || !('IntersectionObserver' in window)) return;
    const targets = [...document.querySelectorAll<HTMLElement>('[data-nav-section]')];
    if (targets.length === 0) return;
    const visible = new Set<HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(el);
          else visible.delete(el);
        }
        const current = targets.find((el) => visible.has(el));
        setSection(current?.dataset.navSection ?? null);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => desktop.matches && setOpen(false);
    desktop.addEventListener('change', closeOnDesktop);

    const focusable = () => [...(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])];
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        burgerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', closeOnDesktop);
      unlockScroll();
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className="mkt-header"
      data-over-hero={overHero || undefined}
      data-scrolled={scrolled || undefined}
      data-menu-open={open || undefined}
    >
      <div className="mkt-wrap mkt-header-inner">
        <Link href="/" className="mkt-header-logo" aria-label="Facilito, inicio">
          <Logo size={36} priority tone={overHero ? 'light' : 'brand'} />
        </Link>
        <nav className="mkt-nav" aria-label="Principal">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              data-active={section === link.href || undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mkt-header-cta">
          <a className="mkt-login-link" href={site.loginPath}>
            Iniciar sesión
          </a>
          <a className="btn btn-primary btn-sm mkt-header-register" href={site.registerPath}>
            Empezar gratis
          </a>
          <button
            ref={burgerRef}
            type="button"
            className="icon-btn mkt-burger"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
            <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </div>
      </div>
      {open && (
        <>
          <button type="button" className="mkt-menu-backdrop" aria-hidden="true" tabIndex={-1} onClick={() => setOpen(false)} />
          <div ref={panelRef} id={panelId} className="mkt-menu" role="dialog" aria-modal="true" aria-label="Menú" data-lenis-prevent>
            <nav aria-label="Menú móvil">
              {LINKS.map((link) => (
                <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? 'page' : undefined} onClick={() => setOpen(false)}>
                  {link.label}
                  <ArrowRight size={18} aria-hidden />
                </Link>
              ))}
            </nav>
            <div className="mkt-menu-actions">
              <a className="btn btn-primary" href={site.registerPath}>
                Empezar gratis
              </a>
              <a className="btn btn-outline" href={site.loginPath}>
                Iniciar sesión
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
