import { brandOg, ogContentType, ogSize } from '@/components/marketing/og-card';

export const alt = 'Precios de Facilito: Pro US$16/mes y Business US$39/mes. Primer mes gratis.';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return brandOg('Precios', 'Pro US$16 · Business US$39 al mes. Primer mes gratis.');
}
