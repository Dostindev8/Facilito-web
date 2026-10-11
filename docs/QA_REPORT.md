# QA — sitio público Facilito

## Rediseño de la landing (11 oct 2026, rama `feat/landing-redesign`)

Build de producción local, misma máquina. Decisiones 27–43 en `DECISIONS.md`.

| Verificación | Resultado |
|---|---|
| `pnpm typecheck` | 0 errores |
| `pnpm lint` (`--max-warnings=0`) | 0 |
| `pnpm build` | sin errores ni avisos; `/` 6,97 kB, First Load 118 kB (igual que antes) |
| Vitest | 26/26 |
| Playwright | 41/41 (33 previas + 8 nuevas) |
| axe WCAG 2.2 AA, 8 rutas | 0 violaciones serias o críticas |
| Rutas del footer (HTTP) | 200 en las 9: `/`, `/features`, `/precios`, `/nosotros`, `/contacto`, `/contacto?motivo=demo`, `/legal/privacidad`, `/legal/terminos`, `/legal/cookies` |
| Scroll horizontal | 0 a 375, 390, 414, 430, 768, 820, 1024, 1280, 1440, 1920 y 2560 |

Pruebas e2e nuevas:

- La píldora no aparece en ninguna ruta.
- La copia del marquee tiene `aria-hidden`.
- Con reduced motion, el marquee queda estático, con una sola copia y sin recortes.
- El FAQ abre y cierra con teclado.
- El enlace del crédito tiene `href`, `target` y `rel` correctos.
- El botón flotante no tapa enlaces del footer.
- «Cómo funciona» del menú lleva a la sección desde otra ruta.
- 414 px en la matriz de desborde.

Capturas en `docs/captures/redesign/` (home a 375, 414, 768, 1024, 1280 y 1440) y `docs/captures/redesign-reduced/` (reduced motion a 414 y 768). Se regeneran con `WIDTHS=… ROUTES=/ [REDUCED=1] node scripts/capture.mjs <carpeta>`.

### Lighthouse móvil, simulado

Base y rediseño se midieron intercalados contra dos servidores para que la carga de la máquina afectara a ambos por igual. La máquina tenía OneDrive sincronizando y Chrome abierto, así que los valores varían entre rondas.

| Ronda | Base `/` | Rediseño `/` |
|---|---|---|
| Máquina más libre | 87–89 (LCP 3,2 s, TBT 230–280 ms, CLS 0) | 88–89 (LCP 3,2 s, TBT 220–270 ms, CLS 0,001) |
| Máquina cargada | 75–82 | 67–82 |

A11y 100, Best Practices 100 y SEO 92 en las 6 rutas.

Ronda final de las 6 rutas (con carga): `/` 75, `/features` 89, `/precios` 88, `/contacto` 79, `/nosotros` 90, `/legal/privacidad` 92. CLS 0 en todas.

Lo que se corrigió en esta ronda:

- **CLS de la home de 0,047 a 0**: una nube se movía con el reflujo del hero.
- **Layout inicial de la home de ~3,1 s a ~2,1 s** con CPU 4× más lenta, gracias a `content-visibility`. Antes de ese cambio, el rediseño bloqueaba más que la base: TBT 450–570 ms frente a 190–300 ms con throttling devtools.

### Fuera de meta (Performance < 90)

El LCP móvil simulado (3,2 s) ya estaba en la rama base y es igual en ambas. Sin throttling, el LCP real es el párrafo del hero y pinta a ~0,9 s. El simulador alarga el primer layout de la página, que con CPU 4× más lenta tarda ~0,8 s; la causa de ese costo no quedó aislada (las pruebas quitando `text-wrap`, el fondo o la vista previa dieron diferencias dentro del ruido). Pendiente: medir con PageSpeed Insights sobre la URL de Vercel antes de optimizar más.

## Ronda anterior

Medición: 8 oct 2026, rama `feat/website-3ds`, build de producción local (`next start`), Windows, Node 22.23.2, Chromium de Playwright 1.63.

## Pruebas

| Suite | Resultado |
|---|---|
| `pnpm typecheck` | 0 errores |
| `pnpm lint` (`--max-warnings=0`) | 0 |
| Vitest (5 archivos: validación de contacto, rate limit, SEO, formato) | 26/26 |
| Playwright (`e2e/marketing.spec.ts`) | 33/33 |
| `pnpm audit --prod` | 0 vulnerabilidades |

Las 33 pruebas e2e cubren:

- H1 exacto «Tu negocio, más fácil cada día.» con «fácil» resaltado y espacios visibles (375/768/1440).
- CTAs que van a la app.
- «Cómo funciona» sin doble numeración, con tarjetas de igual altura y sin skeletons.
- Header, hero y trust en el mismo contenedor (375/1440/2560).
- Precios: mismos montos y tarjetas de igual altura.
- Sin scroll horizontal en 375, 390, 430, 768, 820, 1024, 1280, 1440, 1920 y 2560 en las 5 rutas, más móvil horizontal.
- Menú móvil: teclado, Esc, clic afuera, bloqueo de scroll y navegación.
- Cookies.
- Formulario: validación en cliente, honeypot, éxito y límite.
- Sin violaciones de CSP ni errores de consola.
- robots, sitemap, meta y JSON-LD.
- Reduced motion y Save-Data.
- 404.
- axe WCAG 2.2 AA en 8 rutas: 0 violaciones serias o críticas.

No cubierto: WebKit/Safari y Firefox; solo Chromium.

## Lighthouse 12

### Móvil, throttling simulado (el que usa PageSpeed Insights)

| Ruta | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 91 | 100 | 100 | 92 | 3,0 s | 0 | 194 ms |
| `/features` | 95 | 100 | 100 | 92 | 2,5 s | 0 | 176 ms |
| `/precios` | 96 | 100 | 100 | 92 | 2,6 s | 0 | 107 ms |
| `/contacto` | 94 | 100 | 100 | 92 | 2,8 s | 0 | 141 ms |
| `/nosotros` | 96 | 100 | 100 | 92 | 2,7 s | 0 | 102 ms |
| `/legal/privacidad` | 95 | 100 | 100 | 92 | 2,6 s | 0 | 145 ms |

### Móvil, throttling aplicado (devtools)

| Ruta | Perf | LCP | CLS | TBT |
|---|---|---|---|---|
| `/` | 94 | 2,3 s | 0 | 145 ms |
| `/features` | 96 | 1,5 s | 0 | 205 ms |
| `/precios` | 97 | 1,5 s | 0 | 188 ms |
| `/contacto` | 98 | 1,4 s | 0 | 149 ms |
| `/nosotros` | 97 | 1,7 s | 0 | 152 ms |
| `/legal/privacidad` | 97 | 1,3 s | 0 | 207 ms |

### Escritorio

Perf 99–100, A11y 100, BP 100, SEO 92, LCP 0,58–0,71 s, CLS 0, TBT ≤ 7 ms en las 6 rutas.

### Antes de esta ronda (misma máquina)

- Escritorio `/`: CLS 0,45, causado por `loading.tsx` (decisión #20).
- Móvil `/nosotros`: CLS 0,118, causado por el swap de fuente (decisión #4).
- JS inicial de `/`: 159 kB.

### Después de esta ronda

- CLS 0 en todas las rutas.
- JS inicial de `/`: 118 kB, tras quitar `motion` y cargar Lenis solo en escritorio.

### Fuera de meta

- **SEO 92 en todas las rutas** («Document does not have a meta description»). Next 15 transmite los metadatos al `<body>` para navegadores que no reconoce como bots, y Lighthouse es uno de ellos. Forzarlos al `<head>` da SEO 100 pero baja Performance móvil a 78–88 (decisión #19). Googlebot y los bots sociales sí reciben la descripción.
- **LCP móvil simulado de 2,5 a 3,0 s** (meta < 2,5 s). El LCP es el texto del hero. En la traza real pinta a 0,3 s sin throttling y a 1,0 s con la CPU 4× más lenta. El simulador cuenta el JS que, en localhost, termina antes del primer pintado. Hay que confirmarlo con PageSpeed Insights sobre la URL de Vercel.

## Cabeceras (respuesta real de `/`)

- `Content-Security-Policy` con nonce y `strict-dynamic`, en modo enforce.
- `Strict-Transport-Security`, solo en el build de producción.
- `X-Content-Type-Options: nosniff` y `X-Frame-Options: DENY`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy`.
- `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Resource-Policy: same-origin`.
- En previews de Vercel, además, `X-Robots-Tag: noindex, nofollow`.

## Bundle (First Load JS)

| Ruta | Página | First Load |
|---|---|---|
| `/` | 7 kB | 118 kB |
| `/contacto` | 29 kB | 132 kB (zod en el cliente) |
| `/nosotros` | 1,75 kB | 110 kB |
| `/precios` | 1,48 kB | 108 kB |
| `/features`, `/legal/*` | 1,48 kB | 104 kB |

## Capturas

`docs/captures/after/` tiene las 5 rutas a 375 y 1440 px en WebP. El set completo (375/768/1024/1440/1920) se regenera con `node scripts/capture.mjs after` y sale con desborde horizontal 0 en las 25 combinaciones.

## Video del hero

No producido: no hay mp4 fuente ni ffmpeg en esta máquina. El hero usa el póster (`/media/facilito-hero-poster.webp`). Ver `MAINTENANCE.md`.
