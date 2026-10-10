'use client';

import { useReportWebVitals } from 'next/web-vitals';

const ENDPOINT = '/api/vitals';

/** Sends Core Web Vitals to our own endpoint (no third party). Production only. */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== 'production') return;
    const body = JSON.stringify({
      name: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      id: metric.id,
      path: window.location.pathname,
    });
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) return;
    void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => undefined);
  });
  return null;
}
