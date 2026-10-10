'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2, FileText, Package, TrendingUp } from 'lucide-react';
import { copy } from '@/content/copy.es';
import { formatRd } from '@/lib/format';
import { COUNTER_MS } from '@/lib/motion-tokens';

const SPARK = [12, 18, 15, 22, 19, 27, 31];

/**
 * Counts up once, from 60% to the final value, the first time the card is on screen. SSR renders the final value.
 * Frames write textContent directly so the animation never re-renders React.
 */
function useCountUp<T extends HTMLElement>(target: number, format: (n: number) => string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const from = Math.round(target * 0.6);
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / COUNTER_MS);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = format(Math.round(from + (target - from) * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = format(target);
    };
  }, [target, format]);

  return ref;
}

function sparkPath(points: readonly number[], width: number, height: number): string {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = width / (points.length - 1);
  return points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p - min) / (max - min || 1)) * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function HeroPreview() {
  const { caption, sales, stock, invoice } = copy.heroPreview;
  const salesRef = useCountUp<HTMLParagraphElement>(sales.value, formatRd);
  const line = sparkPath(SPARK, 120, 36);

  return (
    <figure className="mkt-preview" aria-label={`${caption} del panel de Facilito`}>
      <figcaption className="mkt-preview-tag">{caption}</figcaption>

      <div className="mkt-pcard mkt-pcard-sales">
        <div className="mkt-pcard-head">
          <span className="mkt-pcard-icon" aria-hidden="true">
            <TrendingUp size={16} />
          </span>
          {sales.label}
        </div>
        <p className="mkt-pcard-value" ref={salesRef}>
          {formatRd(sales.value)}
        </p>
        <div className="mkt-pcard-foot">
          <span className="mkt-chip mkt-chip-up">{sales.delta}</span>
          <svg viewBox="0 0 120 36" width="120" height="36" aria-hidden="true" className="mkt-spark">
            <path d={`${line} L120 36 L0 36 Z`} className="mkt-spark-area" />
            <path d={line} className="mkt-spark-line" />
          </svg>
        </div>
      </div>

      <div className="mkt-pcard mkt-pcard-stock">
        <div className="mkt-pcard-head">
          <span className="mkt-pcard-icon" aria-hidden="true">
            <Package size={16} />
          </span>
          {stock.label}
        </div>
        <p className="mkt-pcard-sub">{stock.note}</p>
        <ul className="mkt-stock">
          {stock.items.map((item) => (
            <li key={item.name}>
              <span>{item.name}</span>
              <span className="mkt-stock-qty">{item.qty}</span>
              <span className="mkt-bar" aria-hidden="true">
                <span style={{ width: `${item.pct}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mkt-pcard mkt-pcard-invoice">
        <div className="mkt-pcard-head">
          <span className="mkt-pcard-icon" aria-hidden="true">
            <FileText size={16} />
          </span>
          {invoice.label}
        </div>
        <p className="mkt-pcard-sub">{invoice.number}</p>
        <div className="mkt-pcard-foot">
          <strong className="mkt-pcard-total">{formatRd(invoice.total)}</strong>
          <span className="mkt-chip mkt-chip-ok">
            <CheckCircle2 size={14} aria-hidden />
            {invoice.status}
          </span>
        </div>
      </div>
    </figure>
  );
}
