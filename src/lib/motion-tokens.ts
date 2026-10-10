/** Keep in sync with the custom properties in globals.css (--dur-*, --ease). Seconds for motion, ms in CSS. */

export const MOTION = {
  ease: [0.2, 0.8, 0.2, 1] as const,
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  hero: 0.8,
} as const;

export const HEADER_OFFSET_PX = 88;
/** Max hero background parallax on desktop; disabled on touch and small screens. */
export const HERO_PARALLAX_PX = 24;
export const COUNTER_MS = 1200;
