import { afterEach, describe, expect, it, vi } from 'vitest';
import { absoluteUrl, isIndexable, siteUrl } from './site';
import { breadcrumbJsonLd, robotsMeta, softwareJsonLd, websiteJsonLd } from './seo';

describe('indexación', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('preview de Vercel lleva noindex', () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(isIndexable()).toBe(false);
    expect(robotsMeta()).toEqual({ index: false, follow: false });
  });

  it('producción de Vercel se indexa', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(isIndexable()).toBe(true);
    expect(robotsMeta()).toEqual({ index: true, follow: true });
  });

  it('declara el WebSite', () => {
    expect(websiteJsonLd()['@type']).toBe('WebSite');
  });
});

describe('seo helpers', () => {
  it('arma URL absoluta sin doble barra', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://facilito.example/';
    expect(siteUrl().origin).toBe('https://facilito.example');
    expect(absoluteUrl('/precios')).toBe('https://facilito.example/precios');
  });

  it('no inventa reseñas ni precio en el software', () => {
    const data = softwareJsonLd();
    expect(data.aggregateRating).toBeUndefined();
    expect(JSON.stringify(data)).not.toMatch(/aggregateRating|price/);
  });

  it('numera las migas', () => {
    const data = breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Precios', path: '/precios' },
    ]);
    const items = data.itemListElement as { position: number }[];
    expect(items.map((item) => item.position)).toEqual([1, 2]);
  });
});
