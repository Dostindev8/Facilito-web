import fs from 'node:fs';
import path from 'node:path';

export { HERO_POSTER, HERO_POSTER_HEIGHT, HERO_POSTER_WIDTH } from './hero-media-shared';

const LOOP_FILES = ['facilito-hero-1080-loop.mp4', 'facilito-hero-720-loop.mp4'] as const;

/** True only when the encoded loops exist in public/media (see scripts/build-hero-video.mjs). */
export function heroVideoAvailable(): boolean {
  return LOOP_FILES.every((name) => fs.existsSync(path.join(process.cwd(), 'public', 'media', name)));
}
