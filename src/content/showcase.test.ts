import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { hotspotSchema, showcaseMedia, showcaseSchema, showcaseTabs, showcaseTabsData } from './showcase';

const NOT_LIVE = /e-CF|DGII|60[678]/i;

describe('showcase', () => {
  it('cumple el esquema: 5 pestañas con ids únicos', () => {
    expect(() => showcaseSchema.parse(showcaseTabsData)).not.toThrow();
    expect(showcaseTabsData).toHaveLength(5);
    expect(new Set(showcaseTabsData.map((tab) => tab.id)).size).toBe(5);
  });

  it('los hotspots están dentro de la imagen (0–100%) y son 2 o 3 por captura', () => {
    for (const tab of showcaseTabsData) {
      expect(tab.hotspots.length).toBeGreaterThanOrEqual(2);
      expect(tab.hotspots.length).toBeLessThanOrEqual(3);
      for (const spot of tab.hotspots) {
        expect(spot.x).toBeGreaterThanOrEqual(0);
        expect(spot.x).toBeLessThanOrEqual(100);
        expect(spot.y).toBeGreaterThanOrEqual(0);
        expect(spot.y).toBeLessThanOrEqual(100);
      }
    }
    expect(() => hotspotSchema.parse({ x: 101, y: 50, title: 'a', body: 'b' })).toThrow();
    expect(() => hotspotSchema.parse({ x: 50, y: -1, title: 'a', body: 'b' })).toThrow();
  });

  it('cada imagen tiene AVIF y WebP en disco, sin ampliar el original', () => {
    for (const tab of showcaseTabs()) {
      expect(tab.media, tab.id).not.toBeNull();
      const entry = showcaseMedia[tab.image.name]!;
      for (const width of entry.widths) {
        expect(width).toBeLessThanOrEqual(entry.width);
        for (const ext of ['avif', 'webp']) {
          expect(existsSync(path.join('public', 'product', `${tab.image.name}-${width}.${ext}`)), `${tab.image.name}-${width}.${ext}`).toBe(true);
        }
      }
    }
  });

  it('e-CF y formatos DGII solo aparecen como "próximamente", nunca como disponibles', () => {
    for (const tab of showcaseTabsData) {
      for (const point of tab.points) expect(point, tab.id).not.toMatch(NOT_LIVE);
      const texts = [tab.soon, ...tab.hotspots.flatMap((spot) => [spot.title, spot.body])].filter(Boolean) as string[];
      for (const text of texts.filter((t) => NOT_LIVE.test(t))) {
        const spot = tab.hotspots.find((h) => h.title === text || h.body === text);
        const context = spot ? `${spot.title} ${spot.body}` : text;
        expect(context, tab.id).toMatch(/próximamente|todavía no está disponible/i);
      }
      expect(JSON.stringify(tab)).not.toMatch(/certificad[oa] (por la |ante la )?DGII/i);
    }
  });

  it('las ilustraciones nunca se presentan como capturas reales', () => {
    const illustrations = showcaseTabsData.filter((tab) => tab.image.kind === 'illustration');
    expect(illustrations.map((tab) => tab.id)).toEqual(['ventas', 'facturacion']);
    for (const tab of illustrations) expect(tab.image.alt).toMatch(/^Ilustración/);
  });
});
