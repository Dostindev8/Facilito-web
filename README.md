# Facilito — sitio público

Sitio de marketing de **Facilito by Logic Code Spot** (Santo Domingo, República Dominicana). Es independiente de la app: no tiene login ni base de datos. «Empezar gratis» e «Iniciar sesión» llevan a la app en `NEXT_PUBLIC_APP_URL`.

Stack: Next.js 15 (App Router) · React 19 · TypeScript estricto · CSS propio (`globals.css` con tokens + `marketing.css`) · zod · Lenis (solo escritorio) · Vitest · Playwright + axe.

## Requisitos

- Node 22 (ver `.nvmrc` y `engines`)
- pnpm 9 (`corepack enable`)

## Arranque

```bash
pnpm install
cp .env.example .env.local   # completar lo necesario
pnpm dev                     # http://localhost:3000
```

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` / `pnpm start` | Build y servidor de producción |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint sin warnings |
| `pnpm test` | Vitest (validación, rate limit, SEO, formato) |
| `pnpm e2e` | Playwright contra un build de producción (hace falta `pnpm build` antes) |
| `pnpm check` | typecheck + lint + test + build |
| `node scripts/capture.mjs <etiqueta> [url]` | Capturas de página completa en `docs/captures/<etiqueta>/` y tabla de desborde horizontal |
| `node scripts/build-hero-video.mjs <mp4>` | Genera los loops del video del hero (requiere ffmpeg) |

## Variables de entorno

Todas están en `.env.example`. Las mínimas para producción:

- `NEXT_PUBLIC_SITE_URL`: dominio canónico (canonical, sitemap, Open Graph).
- `NEXT_PUBLIC_APP_URL`: URL de la app (registro e inicio de sesión).
- `CONTACT_DELIVERY=smtp` y `SMTP_*`, `MAIL_FROM`, `CONTACT_TO_EMAIL`: entrega del formulario. Sin SMTP el formulario falla cerrado y muestra un error.

Opcionales: `NEXT_PUBLIC_CONTACT_EMAIL` y `NEXT_PUBLIC_WHATSAPP_E164` (vacías ocultan los botones) y `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (límite de envíos compartido entre instancias; sin ellas el límite es por instancia).

## Indexación

Solo se indexa producción (`VERCEL_ENV=production`, o `NODE_ENV=production` fuera de Vercel). Los previews de Vercel responden `X-Robots-Tag: noindex`, `<meta name="robots" content="noindex">` y un `robots.txt` que bloquea todo.

## Estructura

```
src/app/               rutas (/, /features, /precios, /contacto, /nosotros, /legal/*), API de Web Vitals, SEO
src/components/brand/  <Logo /> (variantes full e icon)
src/components/ui/     Container, SectionHeading, RevealObserver
src/components/marketing/  header, hero, secciones, formulario, footer
src/content/           textos (copy.es.ts), módulos, precios
src/lib/               site, seo, rate limit, validaciones, tokens de motion
e2e/                   Playwright (responsive, menú, formulario, CSP, SEO, axe)
docs/                  decisiones, QA, mantenimiento, capturas
```

## Despliegue (Vercel)

1. Importar el repo como proyecto nuevo (framework Next.js, pnpm detectado por el lockfile).
2. Definir las variables de entorno de arriba en Production y, si se quiere, en Preview.
3. Rama de producción: `main`.

Más detalle en [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md), decisiones en [`docs/DECISIONS.md`](docs/DECISIONS.md) y mediciones en [`docs/QA_REPORT.md`](docs/QA_REPORT.md).
