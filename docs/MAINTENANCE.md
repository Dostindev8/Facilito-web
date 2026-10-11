# Mantenimiento del sitio público

## Qué puede cambiar el equipo sin tocar lógica

- Textos: `src/content/copy.es.ts`, `features.ts`, `pricing.ts`.
- Precios: `src/content/pricing.ts`. Poner `PRICES_CONFIRMED = true` solo cuando la oferta sea real; eso quita el aviso de «precios de referencia».
- Marca y enlaces: `src/lib/site.ts` y las variables de abajo.
- Video del hero: con el mp4 fuente y ffmpeg instalado, `node scripts/build-hero-video.mjs <ruta-al-mp4>`. Genera en `public/media/` `facilito-hero-1080-loop.{mp4,webm}`, `facilito-hero-720-loop.{mp4,webm}` y el póster. No copies el original a `public/`. El hero monta `<video>` solo si existen los mp4; si no, se queda con el póster.

## «Facilito por dentro» (pestañas de la home)

Contenido en `src/content/showcase.ts` (máximo 6 pestañas, validado con zod). Imágenes en `public/product/`.

Para agregar o reemplazar una captura:

1. Captura el panel con una cuenta de demostración y guarda el PNG en `public/product/_raw/<nombre>.png`. Esa carpeta no se sube a git. Revisa que no queden nombres, RNC, correos ni teléfonos reales. Si quedan, agrega una entrada en `EDITS` de `scripts/product-images.mjs` que repinte ese texto.
2. Instala sharp fuera del repo, una sola vez: `npm i sharp --prefix <carpeta-temporal>`.
3. Genera los archivos con `SHARP_DIR=<carpeta-temporal> node scripts/product-images.mjs`. Crea AVIF y WebP en los anchos que permite el original (no amplía) y actualiza `src/content/showcase-media.json`. Para revisar cómo quedó la imagen redactada, agrega `KEEP_PREVIEW=1`; la vista previa se guarda en `_raw/preview/`.
4. Si es una pestaña nueva, agrégala en `showcaseTabsData` con `image.name` igual al nombre del PNG, `kind: 'capture'` y 2 o 3 hotspots. Cada hotspot lleva `x` e `y` en % de la imagen; ubícalo en el borde del elemento para que no tape datos.
5. Si reemplazas una ilustración por una captura real, cambia `kind` a `'capture'` y quita «Ilustración» del alt. Ajusta también el test de ilustraciones en `showcase.test.ts`.
6. Corre `pnpm check`, regenera las capturas de la sección con `node scripts/capture.mjs showcase` (servidor en el puerto 3100) y revisa los pines a 375, 1024 y 1440. Si cambia la cantidad de pestañas, actualiza las pruebas de teclado e imágenes en `e2e/marketing.spec.ts`.

Las ilustraciones de Ventas y Facturación salen de `scripts/showcase-mocks.mjs` (necesita el servidor en el 3100 para usar Poppins); el script imprime las posiciones de los `[data-spot]` para los hotspots.

Nunca muestres e-CF ni los formatos 606/607/608 como disponibles: van en `soon`. El test lo verifica.

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
pnpm e2e          # 54 pruebas: responsive 320–2560, menú, formulario, pestañas, marquee, CSP, SEO, axe
pnpm audit --prod
```
