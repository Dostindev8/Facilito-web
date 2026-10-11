'use client';

import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import type { ShowcaseTab } from '@/content/showcase';
import { SHOWCASE_AUTOPLAY_MS } from '@/lib/motion-tokens';

type Labels = {
  tabs: string;
  captionCapture: string;
  captionIllustration: string;
  details: string;
  imageError: string;
  stopTour: string;
};

type ImageState = 'loaded' | 'error';
type Spot = { key: string; by: 'hover' | 'focus' | 'click' };

const SIZES = '(min-width: 1280px) 820px, (min-width: 1024px) calc(100vw - 460px), calc(100vw - 40px)';
const SWIPE_PX = 48;

/**
 * WAI-ARIA tabs (roving tabindex, arrows, Home/End) over the showcase panels, plus numbered
 * hotspots and an optional guided tour. The tour only exists without reduced motion on desktop pointers, pauses
 * while hovered, focused or off screen, and never resumes once the visitor takes control.
 */
export function ShowcaseTabs({ tabs, labels }: { tabs: ShowcaseTab[]; labels: Labels }) {
  const [active, setActive] = useState(0);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [images, setImages] = useState<Record<number, ImageState>>({});
  const [mounted, setMounted] = useState(false);
  const [vertical, setVertical] = useState(false);
  const [tour, setTour] = useState<'off' | 'on' | 'stopped'>('off');
  const [holds, setHolds] = useState({ offscreen: true, hover: false, focus: false, hidden: false });
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const count = tabs.length;

  const warm = useCallback((index: number) => {
    const img = rootRef.current?.querySelector<HTMLImageElement>(`img[data-index="${index}"]`);
    if (img && img.loading === 'lazy') img.loading = 'eager';
  }, []);

  const select = useCallback(
    (index: number, options: { user?: boolean; focus?: boolean } = {}) => {
      setActive(index);
      setSpot(null);
      if (options.user) setTour((current) => (current === 'on' ? 'stopped' : current));
      if (options.focus) tabRefs.current[index]?.focus();
    },
    [],
  );

  const setHold = useCallback((key: keyof typeof holds, value: boolean) => {
    setHolds((current) => (current[key] === value ? current : { ...current, [key]: value }));
  }, []);

  useEffect(() => {
    setMounted(true);
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLImageElement>('img[data-index]').forEach((img) => {
      if (img.complete) setImages((s) => ({ ...s, [Number(img.dataset.index)]: img.naturalWidth > 0 ? 'loaded' : 'error' }));
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 1024px)');
    // Touch screens have no hover to pause it while reading, so the tour is desktop-pointer only.
    const pointer = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
    const apply = () => {
      setTour((current) => (current === 'stopped' ? current : reduce.matches || !pointer.matches ? 'off' : 'on'));
      setVertical(wide.matches);
    };
    apply();
    reduce.addEventListener('change', apply);
    wide.addEventListener('change', apply);
    pointer.addEventListener('change', apply);

    const observer = new IntersectionObserver(([entry]) => setHold('offscreen', !entry?.isIntersecting), { threshold: 0.35 });
    observer.observe(root);
    const onVisibility = () => setHold('hidden', document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      reduce.removeEventListener('change', apply);
      wide.removeEventListener('change', apply);
      pointer.removeEventListener('change', apply);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [setHold]);

  // Keep the active chip visible in the horizontal (mobile) tab row without scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    const tab = tabRefs.current[active];
    if (list && tab && list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    }
    warm((active + 1) % count);
  }, [active, count, warm]);

  // Clicked popovers close on any tap outside a hotspot.
  useEffect(() => {
    if (spot?.by !== 'click') return;
    const onDown = (event: globalThis.PointerEvent) => {
      if (!(event.target as Element | null)?.closest('.mkt-show-spot')) setSpot(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [spot]);

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: (active + 1) % count,
      ArrowDown: (active + 1) % count,
      ArrowLeft: (active - 1 + count) % count,
      ArrowUp: (active - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, { user: true, focus: true });
  };

  const onRootKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Escape' || !spot) return;
    document.getElementById(`${spot.key}-pin`)?.focus();
    setSpot(null);
  };

  const onRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHold('focus', false);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') swipe.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    select(dx < 0 ? (active + 1) % count : (active - 1 + count) % count, { user: true });
  };

  const running = tour === 'on' && !holds.offscreen && !holds.hover && !holds.focus && !holds.hidden;

  return (
    <div
      ref={rootRef}
      className="mkt-show-grid"
      onKeyDown={onRootKey}
      onFocus={() => setHold('focus', true)}
      onBlur={onRootBlur}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHold('hover', true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setHold('hover', false)}
    >
      <div className="mkt-show-nav">
        <div
          ref={listRef}
          role="tablist"
          aria-label={labels.tabs}
          aria-orientation={vertical ? 'vertical' : 'horizontal'}
          className="mkt-show-tabs"
          onKeyDown={onTabKey}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`show-tab-${tab.id}`}
              aria-selected={index === active}
              aria-controls={`show-panel-${tab.id}`}
              tabIndex={index === active ? 0 : -1}
              className="mkt-show-tab"
              onClick={() => select(index, { user: true })}
              onPointerEnter={() => warm(index)}
            >
              <span className="mkt-show-tab-label">{tab.label}</span>
              <span className="mkt-show-tab-line">{tab.summary}</span>
            </button>
          ))}
        </div>
        {tour === 'on' && (
          <div className="mkt-show-tour">
            <span className="mkt-show-progress" aria-hidden="true">
              <span
                key={active}
                data-running={running || undefined}
                style={{ animationDuration: `${SHOWCASE_AUTOPLAY_MS}ms` }}
                onAnimationEnd={() => select((active + 1) % count)}
              />
            </span>
            <button type="button" className="mkt-show-stop" onClick={() => setTour('stopped')}>
              {labels.stopTour}
            </button>
          </div>
        )}
      </div>

      <div className="mkt-show-stage">
        {tabs.map((tab, index) => {
          const media = tab.media;
          const state = media ? images[index] : 'error';
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`show-panel-${tab.id}`}
              aria-labelledby={`show-tab-${tab.id}`}
              tabIndex={0}
              hidden={index !== active}
              className="mkt-show-panel"
            >
              <figure className="mkt-show-frame">
                <div className="mkt-show-chrome" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span className="mkt-show-address">facilito · {tab.label}</span>
                </div>
                <div
                  className="mkt-show-screen"
                  data-state={mounted ? (state ?? 'loading') : undefined}
                  style={{
                    aspectRatio: media ? `${media.width} / ${media.height}` : '1024 / 490',
                    backgroundImage: media ? `url("${media.blur}")` : undefined,
                  }}
                  onPointerDown={onPointerDown}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => {
                    swipe.current = null;
                  }}
                >
                  {media && state !== 'error' && (
                    <picture>
                      <source type="image/avif" srcSet={media.avif} sizes={SIZES} />
                      <source type="image/webp" srcSet={media.webp} sizes={SIZES} />
                      <img
                        src={media.src}
                        width={media.width}
                        height={media.height}
                        alt={tab.image.alt}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        data-index={index}
                        draggable={false}
                        onLoad={() => setImages((s) => ({ ...s, [index]: 'loaded' }))}
                        onError={() => setImages((s) => ({ ...s, [index]: 'error' }))}
                      />
                    </picture>
                  )}
                  {state === 'error' && <p className="mkt-show-error">{labels.imageError}</p>}
                  {tab.hotspots.map((hotspot, n) => {
                    const key = `show-${tab.id}-${n + 1}`;
                    const open = spot?.key === key;
                    return (
                      <div
                        key={key}
                        className="mkt-show-spot"
                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                        data-side={hotspot.x > 60 ? 'start' : 'end'}
                        data-up={hotspot.y > 62 || undefined}
                      >
                        <span className="mkt-show-marker" aria-hidden="true">
                          {n + 1}
                        </span>
                        <button
                          type="button"
                          id={`${key}-pin`}
                          className="mkt-show-pin"
                          aria-expanded={open}
                          aria-controls={key}
                          aria-label={`${n + 1}. ${hotspot.title}`}
                          onClick={() => {
                            setTour((current) => (current === 'on' ? 'stopped' : current));
                            setSpot(open && spot?.by !== 'hover' ? null : { key, by: 'click' });
                          }}
                          onPointerEnter={(event) => event.pointerType === 'mouse' && !open && setSpot({ key, by: 'hover' })}
                          onPointerLeave={(event) => event.pointerType === 'mouse' && spot?.by === 'hover' && open && setSpot(null)}
                          onFocus={(event) => event.currentTarget.matches(':focus-visible') && setSpot({ key, by: 'focus' })}
                          onBlur={() => spot?.by === 'focus' && open && setSpot(null)}
                        >
                          {n + 1}
                        </button>
                        <span id={key} className="mkt-show-pop" hidden={!open}>
                          <strong>{hotspot.title}</strong>
                          <span>{hotspot.body}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <figcaption>{tab.image.kind === 'capture' ? labels.captionCapture : labels.captionIllustration}</figcaption>
              </figure>

              <div className="mkt-show-copy">
                <h3>{tab.title}</h3>
                <ul className="mkt-show-points">
                  {tab.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {tab.soon && <p className="mkt-show-soon">{tab.soon}</p>}
                <div className="mkt-show-details">
                  <p>{labels.details}</p>
                  <ol>
                    {tab.hotspots.map((hotspot) => (
                      <li key={hotspot.title}>
                        <strong>{hotspot.title}:</strong> {hotspot.body}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
