# Mantenimiento del sitio público

## Qué puede cambiar el equipo sin tocar lógica

- Textos: `src/content/copy.es.ts`, `features.ts`, `pricing.ts`.
- Precios: `src/content/pricing.ts`. Poner `PRICES_CONFIRMED = true` solo cuando la oferta sea real; eso quita el aviso de «precios de referencia».
- Marca y enlaces: `src/lib/site.ts` y las variables de abajo.
- Video del hero: con el mp4 fuente y ffmpeg instalado, `node scripts/build-hero-video.mjs <ruta-al-mp4>`. Genera en `public/media/` `facilito-hero-1080-loop.{mp4,webm}`, `facilito-hero-720-loop.{mp4,webm}` y el póster. No copies el original a `public/`. El hero monta `<video>` solo si existen los mp4; si no, se queda con el póster.

## Variables

Ver `.env.example`.

- `NEXT_PUBLIC_SITE_URL`: origen canónico (metadata, sitemap, robots).
- `NEXT_PUBLIC_APP_URL`: app de Facilito (registro e inicio de sesión). Hoy `https://facilitord.vercel.app`.
- `NEXT_PUBLIC_CONTACT_EMAIL`: mailto. Vacío lo oculta.
- `NEXT_PUBLIC_WHATSAPP_E164`: dígitos con código de país. Vacío oculta WhatsApp.
- `CONTACT_TO_EMAIL`: buzón que recibe el formulario. Si falta, usa `MAIL_REPLY_TO` y luego `SMTP_USER`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`: entrega del formulario.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: límite de envíos compartido entre instancias (opcional).
- `CONTACT_DELIVERY=sink`: solo pruebas. En producción no se define o vale `smtp`.

## Vercel

Proyecto nuevo apuntando a este repo, rama de producción `main`. Definir las variables en Production. Los previews quedan con `noindex` automáticamente (`VERCEL_ENV=preview`).

Cuando exista el dominio propio, `NEXT_PUBLIC_SITE_URL=https://<dominio>` y redirección 308 de los hosts `*.vercel.app` al canónico desde la configuración de dominios de Vercel.

## Legal

`/legal/privacidad`, `/legal/terminos` y `/legal/cookies` son borradores alineados con la Ley 172-13 en lo que el sitio hace hoy, y lo dicen en la página. **Un abogado tiene que revisarlos antes del lanzamiento.** No son asesoría legal.

## Next.js 16

El repo está en Next 15.5.27. El soporte de la línea 15 termina el **21 de octubre de 2026**. La migración (`npx @next/codemod@canary upgrade latest`) va en un PR aparte, con `pnpm check` y `pnpm e2e` en verde.

## Comprobar antes de publicar

```bash
pnpm check        # typecheck, lint, unit, build
pnpm e2e          # 33 pruebas: responsive 375–2560, menú, formulario, CSP, SEO, axe
pnpm audit --prod
```
