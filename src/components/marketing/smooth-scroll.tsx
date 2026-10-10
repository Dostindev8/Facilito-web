'use client';

import { useEffect } from 'react';
import 'lenis/dist/lenis.css';
import { HEADER_OFFSET_PX } from '@/lib/motion-tokens';
import { registerScrollController } from '@/lib/scroll-lock';

/** Desktop-only smooth wheel scrolling. Touch devices keep native scrolling (CSS handles anchor offset). */
const SMOOTH_QUERY = '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(SMOOTH_QUERY).matches) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;
    const start = async () => {
      const { default: Lenis } = await import('lenis');
      if (cancelled) return;
      const lenis = new Lenis({
        autoRaf: true,
        anchors: { offset: -HEADER_OFFSET_PX },
        lerp: 0.12,
        stopInertiaOnNavigate: true,
      });
      registerScrollController(lenis);
      destroy = () => {
        registerScrollController(null);
        lenis.destroy();
      };
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => void start());
    return () => {
      cancelled = true;
      cancelIdle(handle);
      destroy?.();
    };
  }, []);
  return null;
}
