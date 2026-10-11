# Decisiones — sitio público Facilito

1. El sitio vive en este repo (`Facilito-web`) como app Next independiente. Salió del monorepo `Facilito` (`apps/web`); la app (login, panel, API) sigue allá y se publica en `https://facilitord.vercel.app`.
2. Next se queda en 15.5.27. La subida a 16 queda aparte, antes del fin de soporte de la línea 15 (21 oct 2026).
3. Sin Tailwind ni shadcn: `globals.css` define los tokens (color, espacio, radios, sombras, motion 150/250/400/800 ms con `cubic-bezier(.2,.8,.2,1)`) y `marketing.css` los componentes bajo `.mkt`. Breakpoints 375 → 640 → 768 → 1024 → 1280 → 1536, mobile-first.
4. Tipografía: Poppins self-hosted con `next/font`, `display: optional` y precarga. Con `swap` el cambio de fuente movía un párrafo de `/nosotros` (CLS 0,118 en móvil con throttling); con `optional` el CLS es 0 y, si la fuente no llega en ~100 ms, esa vista usa el fallback ajustado.
5. «Empezar gratis» lleva a `${NEXT_PUBLIC_APP_URL}/login?tab=registro` e «Iniciar sesión» a `${NEXT_PUBLIC_APP_URL}/login`. `/login` y `/register` en este sitio redirigen a la app. `/modulos` redirige 308 a `/features`.
6. Las páginas siguen dinámicas porque el layout llama `headers()` para el nonce de la CSP.
7. Sin auth en el sitio: el header no consulta sesión.
8. CSP en enforce con nonce (`middleware.ts`). `media/` fuera del matcher.
9. Sin analítica. El aviso de cookies no enciende ningún script. Web Vitals se envían a `/api/vitals` (mismo origen, solo producción) y se registran en los logs; no hay cookies ni identificadores.
10. Formulario de contacto: zod en cliente y servidor, honeypot, cuerpo máximo de 8 KB (y 32 KB en Server Actions), sin doble envío. Límite de 5 envíos cada 10 min por IP; IPv6 se agrupa por /64. Con `UPSTASH_REDIS_REST_*` el límite es compartido; si Upstash falla o no está configurado, cae a un mapa en memoria por instancia. SMTP con nodemailer; sin SMTP falla cerrado. `CONTACT_DELIVERY=sink` solo para pruebas.
11. La IP sale de `x-real-ip` o del primer valor de `x-forwarded-for` (los fija Vercel). Fuera de Vercel un cliente podría falsearla; el límite no es el único control.
12. Precios de referencia (0 / 16 / 39 USD) visibles como no vigentes (`PRICES_CONFIRMED = false`). No hay oferta anual.
13. e-CF ante la DGII se dice «próximamente».
14. Animaciones solo con `transform`/`opacity`. El hero no oculta texto (el LCP es el párrafo del hero). Las secciones se revelan al hacer scroll solo si corre JS (`.js-reveal`); lo que ya está en pantalla al cargar se marca visible sin animar y hay un temporizador de seguridad de 2,5 s.
15. Fondo vivo del hero: póster como LCP, video solo si existen los loops, pausa fuera de vista o con la pestaña oculta. Sin video ni partículas con `prefers-reduced-motion`, Save-Data o conexión 2g/3g. Nubes con ciclos de 90–140 s. Partículas (24) y parallax (24 px) solo en escritorio con puntero fino. El parallax es un listener de scroll pasivo con `requestAnimationFrame`; se quitó la librería `motion` (~47 kB) que solo hacía eso.
16. Contraste del hero: velo navy 0,62–0,86 sobre el cielo más claro muestreado deja el blanco por encima de 4,5:1. El botón naranja usa texto navy (el blanco sobre `#f5871f` medía 2,5:1).
17. `backdrop-filter` del header se apaga con el menú abierto: si no, el header pasa a ser el bloque contenedor de los `position: fixed` del menú y del fondo, y el clic afuera no cierra. El blur de las tarjetas de confianza del hero solo se aplica en escritorio: sobre el cielo animado se re-rasteriza en cada frame.
18. zod en el cliente con `z.config({ jitless: true })`: zod 4 prueba `new Function` y eso viola `script-src` en la CSP estricta.
19. Metadatos en streaming (comportamiento por defecto de Next 15). Medido de nuevo el 8 oct 2026: con `htmlLimitedBots: /.*/` Lighthouse SEO sube de 92 a 100, pero Performance móvil simulada baja de 91–96 a 78–88 en todas las rutas. Se mantiene el streaming. Googlebot ejecuta JS y lee los metadatos; los bots sociales (`facebookexternalhit`, `WhatsApp`, `Twitterbot`, `LinkedInBot`, `Slackbot`…) reciben `<meta name="description">` en el `<head>`.
20. Sin `loading.tsx` global: envolvía cada página en un Suspense raíz, el primer HTML pintaba solo la barra de carga y el footer, y al llegar el contenido el footer se movía (CLS 0,45 en escritorio) y el LCP se retrasaba ~3 s. Las páginas no esperan datos, así que no hay nada que mostrar mientras tanto.
21. Lenis solo en escritorio con puntero fino, cargado en idle. En táctil el scroll es nativo; `scroll-padding-top` compensa el header fijo en los anclas y `scroll-behavior: smooth` (con `data-scroll-behavior="smooth"` en `<html>`) da el desplazamiento suave.
22. Un solo `<Logo />` (`variant` full/icon, `tone` brand/light) y un solo `Container` (`mkt-wrap`): el header, el hero y las secciones comparten el mismo borde izquierdo en todos los anchos (probado en e2e a 375, 1440 y 2560).
23. Vista previa del hero en HTML (Ventas hoy, Inventario, Facturación) con datos de ejemplo rotulados «Vista de ejemplo». El contador corre una vez, del 60 % al valor final, escribiendo el texto directo (sin re-render de React por frame); el HTML del servidor ya trae el valor final.
24. Contradicción de registro (sin resolver, no se tocó la lógica de producto): el sitio invita a «Empezar gratis», pero en el monorepo hay cambios sin publicar en la API que responden 410 `registration_closed` al registro. Si el registro se cierra, la propuesta es cambiar el CTA a «Pedir acceso» → `/contacto?motivo=acceso` (solo texto en `copy.es.ts` y `site.ts`). Decide producto.
25. Textos de contacto: sin `NEXT_PUBLIC_WHATSAPP_E164` ni `NEXT_PUBLIC_CONTACT_EMAIL`, la página dice «Pronto publicamos…» en vez de mostrar el nombre de la variable de entorno.
26. `postcss` forzado a ≥ 8.5.23 con `pnpm.overrides`: Next 15.5.27 fija 8.4.31, que tiene 2 avisos altos y 2 moderados (lectura de archivos vía `sourceMappingURL`). Solo corre en build sobre nuestro CSS, pero así `pnpm audit --prod` queda en 0.

## Rediseño de la landing (rama `feat/landing-redesign`, 11 oct 2026)

27. Referencia de ritmo y estructura: somosnovasoft.com (hero con líneas de confianza, secciones numeradas, pasos, FAQ en acordeón, bloque de cierre). No se copió texto, imagen, logo, código ni cifra. El primer título del FAQ («Las cosas claras») se cambió por «Antes de abrir tu cuenta» por parecerse al de la referencia.
28. Se quitó la píldora «FACILITO · LOGIC CODE SPOT» del hero y su CSS (`.mkt-kicker*`). «by Logic Code Spot» sigue en el logo del footer y en el copyright. Una prueba e2e verifica que no vuelve en ninguna ruta pública.
29. Paleta sin cambios: no hay hex nuevos. El énfasis de títulos usa `--green-700` (sobre fondo claro) y `#ffb066` (ya usado en el hero) sobre fondo oscuro. Sin cursiva para no cargar otra variante de Poppins.
30. Orden de la home: Hero → 01 Producto → marquee de módulos → 02 Cómo funciona → barra de confianza → 03 Preguntas → cierre. El manifiesto («No más cuadernos…») pasó a ser el titular del bloque final; el texto es el mismo.
31. FAQ de la home: 4 preguntas tomadas tal cual de las FAQ de `/precios` (tarjeta, DGII, datos, Google). No se escribieron respuestas nuevas. `<details>` nativo: teclado y lector de pantalla sin JS.
32. Marquee: la segunda copia lleva `aria-hidden`. Con `prefers-reduced-motion` no se anima, se oculta la copia y la lista se reparte en filas centradas. Se pausa con hover y con foco.
33. «Cómo funciona»: la lista se revela en secuencia (la línea de progreso crece con `scale`, luego cada tarjeta) en vez de entrar como bloque. Títulos con `text-wrap: balance`; entre 1024 y 1279 px se reservan dos líneas de título para que todas las descripciones arranquen a la misma altura.
34. Barra de confianza: mismo contenido. «e-CF ante la DGII: próximamente» queda literal, como detalle de «Comprobantes en el panel». «RNC y cédula cifrados en reposo» se verificó en el código del monorepo (`apps/api/src/utils/crypto.ts`, AES-256-GCM, usado en `auth.service.ts`, `settings.service.ts` y `parties.service.ts`). No se pudo verificar en el despliegue.
35. Vista previa del hero rotulada «Demo ilustrativa» (antes «Vista de ejemplo»).
36. Header: «Cómo funciona» entra al menú. En `/` un `IntersectionObserver` marca el enlace de la sección visible (`data-active`). No hay JS de scroll suave nuevo: se mantiene Lenis en escritorio.
37. Footer: marca de agua del isotipo (opacidad 0,06, `aria-hidden`, sin eventos ni selección, 280 px en móvil y 520 px desde 1024). Grid de 12 columnas en escritorio (marca 4/12 y tres columnas), 2 en tableta y 1 en móvil. Barra inferior: copyright y crédito a la izquierda; legales y «Volver arriba» a la derecha; apilada y centrada en móvil.
38. Crédito «Creado por Logic Code Spot» en un único enlace a `https://logic-codespot-com.vercel.app/` con `target="_blank"`, `rel="noopener noreferrer"` y `aria-label`. El logo sale de `public/brand/logic-code-spot.png` solo si el archivo existe en build (`NEXT_PUBLIC_LCS_LOGO`, calculado en `next.config.ts`); hoy no existe y se muestra solo el texto.
39. El botón flotante «volver arriba» se oculta mientras el footer está en pantalla, así nunca tapa sus enlaces. Con el botón de WhatsApp activo, el footer suma padding inferior.
40. Fuente: el pedido fue `display: swap`. Medido el 11 oct 2026: con `swap` el CLS móvil de `/nosotros` vuelve a 0,119 (un párrafo baja cuando el título cambia de número de líneas al llegar Poppins). Se mantiene `optional` (decisión 4) porque el pedido también exige CLS 0 y cero regresiones. Si se prefiere `swap`, hay que fijar los saltos de línea de ese título.
41. Las nubes del hero se dimensionan con el viewport (`60svh`) y no con la altura del hero: un reflujo del texto movía una nube y sumaba CLS 0,047.
42. `content-visibility: auto` en las secciones de la home bajo el pliegue (`#como-funciona`, `#preguntas`, marquee, barra de confianza) y en el footer. Con CPU 4× más lenta, el layout inicial de la home bajó de ~3,1 s (rama base) a ~2,1 s. En impresión se fuerza `visible`. `scripts/capture.mjs` también lo fuerza antes de las capturas de página completa, que si no salen en blanco bajo el pliegue.
43. `next.config.ts`: `images.formats` pide AVIF y luego WebP.

## Facilito por dentro (rama `feat/product-showcase`, 11 oct 2026)

44. La rama sale de `feat/landing-redesign`. Orden de la home: Hero → 01 Producto → marquee → 02 Facilito por dentro → 03 Cómo funciona → barra de confianza → 04 Preguntas → cierre.
45. Las capturas originales van en `public/product/_raw/`, que está en `.gitignore` porque pueden traer datos reales. `scripts/product-images.mjs` redibuja con Poppins los datos personales: el nombre de usuario pasa a «Demo», el RNC a `000-0000000-0` y el correo a `demo@example.com`. También corrige la errata «stock_stock_minimo» desplazando los píxeles originales, sin volver a dibujar el texto. Los valores originales no quedan en el repo, ni siquiera en el script.
46. AVIF y WebP se generan con sharp instalado fuera del repo (`SHARP_DIR`). No es dependencia del proyecto: en runtime el sitio sirve archivos estáticos. Las imágenes salen sin EXIF (verificado). Las capturas reales miden 1024 px y se publican a 640 y 1024 px, sin ampliarlas a 1600. Las ilustraciones se publican a 640, 1024 y 1600 px.
47. No había captura real de Ventas (POS) ni de Facturación: la quinta imagen recibida era la landing. Se dibujaron con `scripts/showcase-mocks.mjs` usando los tokens y Poppins del sitio, con datos ficticios. En la página llevan «Demo ilustrativa» y su alt empieza por «Ilustración». Cuando haya capturas reales, se reemplazan sin tocar código (ver `MAINTENANCE.md`).
48. Se usa `<picture>` con `srcset` AVIF/WebP en lugar de `next/image`, porque los archivos ya vienen optimizados por ancho y así no hace falta el optimizador en runtime. Se mantienen `width`/`height`, `sizes` y un placeholder borroso (WebP de 16 px como `data:`, que `img-src` ya permite). La primera captura carga `eager` y el resto `lazy`; la pestaña siguiente se precarga.
49. La primera captura no lleva `fetchpriority="high"`: está bajo el pliegue y el LCP es el póster del hero, con el que competiría.
50. Archivos en kebab-case como el resto del repo: `product-showcase.tsx` y `showcase-tabs.tsx`, no `ProductShowcase.tsx`.
51. Las pestañas siguen el patrón WAI-ARIA Tabs: tabindex itinerante, flechas, Home/End y `aria-orientation` vertical desde 1024 px. Cada hotspot es un botón con `aria-expanded`/`aria-controls`. Se abre con hover, con foco de teclado o con toque; Esc lo cierra y devuelve el foco, y un clic afuera también lo cierra. Por debajo de 768 px los pines son solo decorativos y el detalle aparece en una lista numerada.
52. El recorrido automático (7 s por pestaña) solo corre sin reduced motion y en escritorio con puntero fino: en pantallas táctiles no hay hover para pausarlo mientras se lee. Se pausa con hover, con foco, fuera de pantalla o con la pestaña del navegador oculta. Tiene botón «Detener recorrido» (WCAG 2.2.2) y cualquier interacción lo detiene del todo. La barra de progreso es CSS (`scaleX`) y avanza con `animationend`, sin timers.
53. e-CF y los formatos 606/607/608 solo aparecen en el bloque «próximamente». Un test unitario falla si aparecen en los puntos de una pestaña o si se usa la palabra «certificado».
54. La bandera RD es `<FlagDO />`: SVG inline con `aria-hidden` y `focusable="false"`, y borde de 1 px con `box-shadow` para no mover el layout. Reemplaza el pin en el badge del hero y en «Hecho en República Dominicana» de la barra de confianza. Los pines de `/contacto` y `/nosotros` marcan una dirección y se quedan.
55. Auditoría del marquee. Problemas encontrados:
    - cada copia medía unos 1.000 px, así que a 2560 px quedaba un hueco antes de reiniciar;
    - el `gap` del track no contaba al final de la copia, lo que producía un salto en la unión;
    - la duración fija de 36 s hacía que la velocidad dependiera del contenido;
    - seguía animando fuera de pantalla.

    Corrección:
    - cada copia repite los 6 módulos 3 veces (más de 2.560 px);
    - la separación es `padding-right` en cada ítem;
    - la duración es el ancho de una copia ÷ 40 px/s (`MARQUEE_PX_PER_S`), medida con `ResizeObserver`;
    - se pausa fuera de pantalla (`IntersectionObserver`), con hover y con foco;
    - `will-change: transform` solo mientras está en pantalla;
    - la copia duplicada lleva `aria-hidden` e `inert`, y las repeticiones `aria-hidden`, así el lector de pantalla lee 6 módulos.

    Con reduced motion queda una sola copia de 6 en filas.
56. `pnpm audit` informa una vulnerabilidad alta en `braces`, que llega por `eslint-config-next` y solo se usa en lint. No hay versión parcheada publicada. `pnpm audit --prod` da 0. Se acepta hasta que Next actualice la cadena.

## Modelo de pago y recorrido continuo (rama `feat/product-showcase`, 11 oct 2026)

57. Modelo comercial confirmado por Logic Code Spot el 11 oct 2026, que reemplaza la decisión de precios «de referencia»:
    - el servicio es de pago; los planes son Pro (US$16/mes) y Business (US$39/mes), y se quitó el plan Gratis;
    - el primer mes es gratis en los dos planes;
    - el cliente elige el plan y nos escribe; el equipo le prepara el usuario según ese plan;
    - desde el segundo mes paga por transferencia bancaria, sin tarjeta y sin cobro automático.

    `PRICES_CONFIRMED = true` en `src/content/pricing.ts`, que es la única fuente de planes, pasos y FAQ.
58. El CTA principal pasa a ser «Prueba 1 mes gratis» y lleva a `/precios#planes` en el header, el menú móvil, el hero, el showcase, el cierre, el footer y `/features`. Los enlaces de registro a la app (`/login?tab=registro`) salen del sitio porque el usuario lo prepara el equipo. «Iniciar sesión» se queda para clientes activos.
59. «Elegir Pro» y «Elegir Business» abren `/contacto?motivo=ventas&plan=<id>`. El formulario suma el campo opcional «Plan de interés» (`sin-definir`, `pro`, `business`), validado con zod igual que los demás. El correo al equipo incluye el plan en el asunto y en el cuerpo. Con un plan en la URL, el mensaje viene prellenado; un plan inventado en la URL se ignora.
60. El JSON-LD de `SoftwareApplication` publica las dos ofertas en USD ahora que están confirmadas. Sigue sin `aggregateRating` porque no hay reseñas públicas.
61. Los términos de uso dicen que el servicio es de pago mensual, con el primer mes gratis y pago por transferencia. No se agregaron políticas que el negocio no definió (suspensión, reembolsos, cambio de plan); quedan para el asesor legal.
62. Las tarjetas de «Cómo funciona» siguen el flujo nuevo (elegir plan → usuario listo → vender → pagar por transferencia), con mini-vistas nuevas que usan las mismas clases.
63. El recorrido de «Facilito por dentro» sustituye la decisión 52:
    - recorre cada punto de cada pestaña cada 4,5 s y vuelve a empezar sin fin;
    - corre en todos los tamaños, también en celulares;
    - en escritorio abre el popover del punto actual; por debajo de 768 px muestra una leyenda sobre la imagen y marca el punto en la lista;
    - elegir una pestaña lleva el recorrido allí en lugar de terminarlo;
    - se pausa con hover del ratón, con foco de teclado, con un hotspot abierto por el visitante, fuera de pantalla y con la pestaña del navegador oculta;
    - el botón «Pausar recorrido / Reanudar recorrido» cumple WCAG 2.2.2;
    - con reduced motion no hay recorrido.
64. Todos los paneles del showcase comparten la misma celda del grid; los inactivos llevan `visibility: hidden` vía `hidden`. Así la sección mide siempre lo del panel más alto y el cambio automático de pestaña no mueve la página (CLS 0, con prueba e2e). En contrapartida, las 5 capturas se descargan cuando la sección se acerca a la pantalla, aunque siguen siendo `lazy` respecto a la carga inicial.