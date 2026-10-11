'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Cloud, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { HeroPreview } from './hero-preview';
import { HeroVideo } from './hero-video';
import { copy } from '@/content/copy.es';
import { HERO_PARALLAX_PX } from '@/lib/motion-tokens';
import { site } from '@/lib/site';

type Conn = { saveData?: boolean; effectiveType?: string };

const TRUST_ICONS = [ShieldCheck, Zap, Cloud, MapPin] as const;

/** Deterministic particle field (no Math.random, so server and client markup match). */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  size: 2 + ((i * 7) % 4),
  duration: 14 + ((i * 11) % 16),
  delay: -((i * 13) % 20),
}));

function splitTitle(title: string, highlight: string): [string, string, string] {
  const at = title.indexOf(highlight);
  if (at < 0) return [title, '', ''];
  return [title.slice(0, at), highlight, title.slice(at + highlight.length)];
}

export function Hero({ videoReady }: { videoReady: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [motionOk, setMotionOk] = useState(false);
  const [parallax, setParallax] = useState(false);
  const [paused, setPaused] = useState(false);
  const [before, highlight, after] = splitTitle(copy.hero.title, copy.hero.highlight);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const connection = (navigator as Navigator & { connection?: Conn }).connection;
    const lite = connection?.saveData === true || /(^|-)2g$|^3g$/.test(connection?.effectiveType ?? '');
    const apply = () => {
      const ok = !reduce.matches && !lite;
      setMotionOk(ok);
      setParallax(ok && desktop.matches);
    };
    apply();
    reduce.addEventListener('change', apply);
    desktop.addEventListener('change', apply);
    return () => {
      reduce.removeEventListener('change', apply);
      desktop.removeEventListener('change', apply);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    if (!parallax || !section || !media) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = section.offsetHeight || 1;
      const progress = Math.min(Math.max(window.scrollY / height, 0), 1);
      media.style.transform = `translate3d(0, ${(progress * HERO_PARALLAX_PX).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      media.style.transform = '';
    };
  }, [parallax]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let inView = true;
    const sync = () => setPaused(!inView || document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      sync();
    });
    observer.observe(section);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <section
      className="mkt-hero"
      ref={sectionRef}
      aria-labelledby="hero-title"
      data-motion={motionOk ? 'on' : 'off'}
      data-paused={paused || undefined}
    >
      <div className="mkt-hero-bg" aria-hidden="true">
        <div className="mkt-hero-media" ref={mediaRef}>
          <HeroVideo videoReady={videoReady} allowMotion={motionOk} paused={paused} />
        </div>
        <div className="mkt-clouds">
          <span className="mkt-cloud mkt-cloud-1" />
          <span className="mkt-cloud mkt-cloud-2" />
          <span className="mkt-cloud mkt-cloud-3" />
        </div>
        <div className="mkt-particles">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="mkt-hero-scrim" />
      </div>

      <div className="mkt-wrap mkt-hero-grid">
        <div className="mkt-hero-copy">
          <h1 id="hero-title" className="mkt-hero-title">
            {before}
            <span className="mkt-hl">{highlight}</span>
            {after}
          </h1>
          <p className="mkt-hero-lead">{copy.hero.subtitle}</p>
          <div className="mkt-actions">
            <a className="btn btn-primary" href={site.registerPath}>
              {copy.hero.primary}
            </a>
            <Link className="btn btn-glass" href="/contacto?motivo=demo">
              {copy.hero.secondary}
            </Link>
          </div>
          <p className="mkt-note">
            {copy.hero.note}{' '}
            <a className="mkt-hero-how" href={`#${copy.how.id}`}>
              {copy.hero.howLink}
              <ArrowDown size={14} aria-hidden />
            </a>
          </p>
        </div>
        <HeroPreview />
      </div>

      <div className="mkt-wrap">
        <ul className="mkt-hero-trust" aria-label="Por qué Facilito">
          {copy.heroTrust.map((item, index) => {
            const Icon = TRUST_ICONS[index] ?? ShieldCheck;
            return (
              <li key={item.title}>
                <span className="mkt-hero-trust-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
