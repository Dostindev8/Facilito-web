import type { MetadataRoute } from 'next';
import { isIndexable, siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl().toString().replace(/\/$/, '');
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${base}/sitemap.xml`,
    host: siteUrl().origin,
  };
}
