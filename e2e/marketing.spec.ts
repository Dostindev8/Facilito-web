import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const publicRoutes = ['/', '/features', '/precios', '/contacto', '/nosotros', '/legal/privacidad', '/legal/terminos', '/legal/cookies'];
const matrix = [320, 360, 375, 390, 414, 430, 768, 820, 1024, 1280, 1440, 1920, 2560];
const HERO_TITLE = 'Tu negocio, más fácil cada día.';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    if (!sessionStorage.getItem('keep-consent')) localStorage.setItem('facilito-consent', 'rejected');
  });
});

/** Every space between words must render with real width, except where a line wraps. */
async function visualSpacing(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const widths: number[] = [];
    const tops = new Set<number>();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.textContent ?? '';
      for (let i = 0; i < text.length; i += 1) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rect = range.getBoundingClientRect();
        if (text[i] === ' ') widths.push(rect.width);
        else if (rect.width > 0) tops.add(Math.round(rect.top / 4));
      }
    }
    return { widths, lines: tops.size, display: getComputedStyle(el).display };
  });
}

test('H1 exacto, con espacios visibles y "fácil" resaltado', async ({ page }) => {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    expect((await h1.textContent())?.replace(/\s+/g, ' ').trim()).toBe(HERO_TITLE);
    await expect(h1.locator('.mkt-hl')).toHaveText('fácil');
    const { widths, lines, display } = await visualSpacing(page, 'h1');
    expect(display).not.toBe('flex');
    const visible = widths.filter((w) => w > 2).length;
    expect(widths.length).toBe(5);
    expect(visible, `ancho ${width}: espacios ${JSON.stringify(widths)} en ${lines} líneas`).toBeGreaterThanOrEqual(widths.length - (lines - 1));
  }
});

test('CTA "Prueba 1 mes gratis" lleva a los planes; iniciar sesión sigue en la app', async ({ page }) => {
  await page.goto('/');
  const starts = page.getByRole('link', { name: 'Prueba 1 mes gratis' });
  expect(await starts.count()).toBeGreaterThanOrEqual(3);
  for (const link of await starts.all()) await expect(link).toHaveAttribute('href', '/precios#planes');
  await expect(page.getByRole('link', { name: /Empezar gratis/ })).toHaveCount(0);
  await expect(page.locator('a[href*="tab=registro"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Iniciar sesión' }).first()).toHaveAttribute('href', /\/login$/);
  await expect(page.getByRole('link', { name: 'Pedir demo' }).first()).toHaveAttribute('href', '/contacto?motivo=demo');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.locator('.mkt-header').getByRole('link', { name: 'Prueba 1 mes gratis' }).click();
  await expect(page).toHaveURL(/\/precios#planes$/);
  await expect(page.locator('#planes')).toBeInViewport();
});

test('ningún texto público dice que el servicio es gratis o que el registro no cobra', async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    const text = (await page.locator('body').textContent()) ?? '';
    expect(text, route).not.toMatch(/Empezar gratis|Plan Gratis|no pide tarjeta|Precios de referencia|registro actual no/i);
  }
});

test('"Cómo funciona": sin doble numeración y tarjetas de igual altura', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const list = page.locator('ol.mkt-steps');
  expect(await list.evaluate((el) => getComputedStyle(el).listStyleType)).toBe('none');
  await list.scrollIntoViewIfNeeded();
  const heights = await page.locator('.mkt-step-card').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
  expect(heights).toHaveLength(4);
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
  await expect(page.locator('.mkt-mock')).toHaveCount(0);
});

test('header y contenido comparten el mismo contenedor', async ({ page }) => {
  for (const width of [375, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.mkt-hero-trust')).toBeVisible();
    const box = (selector: string) =>
      page.locator(selector).evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { x: rect.x, width: rect.width };
      });
    const logo = await box('.mkt-header-logo');
    const title = await box('.mkt-hero-title');
    const trust = await box('.mkt-hero-trust');
    expect(title.width, `ancho ${width}`).toBeGreaterThan(0);
    expect(Math.abs(logo.x - title.x), `ancho ${width}`).toBeLessThanOrEqual(1);
    expect(Math.abs(trust.x - title.x), `ancho ${width}`).toBeLessThanOrEqual(1);
  }
});

test('la píldora "FACILITO · LOGIC CODE SPOT" no aparece en ninguna ruta', async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page.locator('.mkt-kicker')).toHaveCount(0);
    expect(await page.locator('body').innerText()).not.toMatch(/FACILITO\s*·\s*LOGIC CODE SPOT/i);
  }
});

test('marquee: la copia duplicada está oculta a lectores de pantalla', async ({ page }) => {
  await page.goto('/');
  const tracks = page.locator('.mkt-marquee-track');
  await expect(tracks).toHaveCount(2);
  await expect(tracks.nth(0)).not.toHaveAttribute('aria-hidden', /.*/);
  await expect(tracks.nth(1)).toHaveAttribute('aria-hidden', 'true');
  await expect(tracks.nth(1)).toHaveAttribute('inert', '');
  // Assistive tech hears each module once, even though every copy repeats them to fill wide screens.
  const names = await page.getByRole('region', { name: 'Módulos de Facilito' }).getByRole('listitem').allTextContents();
  expect(names.map((name) => name.trim())).toEqual(['Ventas', 'Inventario', 'Facturación', 'Clientes', 'Comprobantes', 'Reportes']);
});

test('marquee: cada copia cubre 2560px y el ciclo cierra sin salto a velocidad constante', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 900 });
  await page.goto('/');
  const marquee = page.locator('.mkt-marquee');
  await marquee.scrollIntoViewIfNeeded();
  await expect(marquee).toHaveAttribute('data-inview', '');
  const loop = await page.evaluate(() => {
    const inner = document.querySelector<HTMLElement>('.mkt-marquee-inner')!;
    const [first, second] = [...document.querySelectorAll<HTMLElement>('.mkt-marquee-track')];
    const animation = inner.getAnimations()[0]!;
    animation.pause();
    const duration = Number(animation.effect!.getComputedTiming().duration);
    animation.currentTime = 0;
    const start = first!.getBoundingClientRect().left;
    animation.currentTime = duration - 0.01;
    const end = second!.getBoundingClientRect().left;
    return {
      first: first!.getBoundingClientRect().width,
      second: second!.getBoundingClientRect().width,
      seam: Math.abs(end - start),
      duration,
      willChange: getComputedStyle(inner).willChange,
    };
  });
  expect(loop.first).toBeGreaterThan(2560);
  expect(Math.abs(loop.first - loop.second)).toBeLessThan(0.5);
  expect(loop.seam).toBeLessThan(1);
  expect(loop.duration / 1000).toBeCloseTo(loop.first / 40, 0);
  expect(loop.willChange).toBe('transform');
});

test('marquee: en pausa y sin will-change fuera de pantalla', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const marquee = page.locator('.mkt-marquee');
  await expect(marquee).not.toHaveAttribute('data-inview', /.*/);
  const state = await page.locator('.mkt-marquee-inner').evaluate((el) => ({
    play: getComputedStyle(el).animationPlayState,
    willChange: getComputedStyle(el).willChange,
  }));
  expect(state).toEqual({ play: 'paused', willChange: 'auto' });
});

test('marquee con reduced motion: estático, una sola copia y sin recortes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 375, height: 800 } });
  const page = await context.newPage();
  await page.goto('/');
  const state = await page.evaluate(() => {
    const marquee = document.querySelector('.mkt-marquee')!;
    return {
      animation: getComputedStyle(document.querySelector('.mkt-marquee-inner')!).animationName,
      duplicate: getComputedStyle(document.querySelectorAll('.mkt-marquee-track')[1]!).display,
      clipped: marquee.scrollWidth > marquee.clientWidth,
      visible: [...marquee.querySelectorAll('li')].filter((li) => getComputedStyle(li).display !== 'none' && li.getClientRects().length > 0).length,
    };
  });
  expect(state).toEqual({ animation: 'none', duplicate: 'none', clipped: false, visible: 6 });
  await context.close();
});

test('FAQ de la home se abre y cierra con teclado', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('.mkt-acc').first();
  const summary = first.locator('summary');
  await summary.scrollIntoViewIfNeeded();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(first).not.toHaveAttribute('open', /.*/);
});

test('crédito de Logic Code Spot en el footer', async ({ page }) => {
  await page.goto('/');
  const credit = page.getByRole('link', { name: /Logic Code Spot, creadores de Facilito/ });
  await expect(credit).toHaveAttribute('href', 'https://logic-codespot-com.vercel.app/');
  await expect(credit).toHaveAttribute('target', '_blank');
  await expect(credit).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('.mkt-footer-watermark')).toHaveAttribute('aria-hidden', 'true');
});

test('el botón flotante "volver arriba" no tapa enlaces del footer', async ({ page }) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await expect(page.locator('.mkt-top')).not.toHaveAttribute('data-visible', /.*/);
    const overlaps = await page.evaluate(() => {
      const wa = document.querySelector('.mkt-wa')?.getBoundingClientRect();
      if (!wa) return [];
      return [...document.querySelectorAll('.mkt-footer a')]
        .filter((el) => !el.closest('.mkt-wa'))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.left < wa.right && r.right > wa.left && r.top < wa.bottom && r.bottom > wa.top)
        .map((r) => `${Math.round(r.left)},${Math.round(r.top)}`);
    });
    expect(overlaps, `ancho ${width}`).toEqual([]);
  }
});

test('enlace "Cómo funciona" del menú lleva a la sección', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/precios');
  await page.getByRole('navigation', { name: /principal/i }).getByRole('link', { name: 'Cómo funciona' }).click();
  await expect(page).toHaveURL(/\/#como-funciona$/);
  await expect(page.getByRole('heading', { name: 'Cómo funciona' })).toBeInViewport();
});

test('precios: Pro y Business con mes gratis, tarjetas de igual altura y pasos para empezar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/precios');
  await expect(page.locator('.mkt-trial-banner')).toContainText('Primer mes gratis en cualquier plan');
  const cards = page.locator('.mkt-price');
  await expect(cards).toHaveCount(2);
  await expect(cards.locator('.mkt-price-amount strong')).toHaveText(['US$16', 'US$39']);
  await expect(cards.locator('.mkt-price-trial')).toHaveText(['1 mes gratis, luego US$16 al mes', '1 mes gratis, luego US$39 al mes']);
  await expect(page.getByRole('link', { name: 'Elegir Pro' })).toHaveAttribute('href', '/contacto?motivo=ventas&plan=pro');
  await expect(page.getByRole('link', { name: 'Elegir Business' })).toHaveAttribute('href', '/contacto?motivo=ventas&plan=business');
  const heights = await cards.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { name: 'Cómo empiezas' })).toBeVisible();
  await expect(page.locator('.mkt-start li')).toHaveCount(4);
});

test('elegir un plan abre contacto con el plan y el mensaje ya puestos', async ({ page }) => {
  await page.goto('/precios');
  await page.getByRole('link', { name: 'Elegir Business' }).click();
  await expect(page).toHaveURL(/\/contacto\?motivo=ventas&plan=business$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contacto');
  await expect(page.getByText('te preparamos el usuario del plan Business')).toBeVisible();
  await expect(page.getByLabel('Plan de interés')).toHaveValue('business');
  await expect(page.getByLabel('Motivo')).toHaveValue('ventas');
  await expect(page.getByLabel('Mensaje')).toHaveValue('Quiero el plan Business con el primer mes gratis.');
  await page.goto('/contacto?plan=inventado');
  await expect(page.getByLabel('Plan de interés')).toHaveValue('sin-definir');
  await expect(page.getByLabel('Mensaje')).toHaveValue('');
});

test('el enlace "Ver cómo funciona" lleva a la sección', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver cómo funciona' }).click();
  await expect(page.getByRole('heading', { name: 'Cómo funciona' })).toBeInViewport();
});

for (const width of matrix) {
  test(`sin scroll horizontal a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/features', '/precios', '/contacto', '/nosotros']) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${route} a ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

test('móvil horizontal (landscape) sin overflow', async ({ page }) => {
  for (const viewport of [
    { width: 812, height: 375 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${viewport.width}×${viewport.height}`).toBeLessThanOrEqual(0);
  }
});

test('menú móvil: teclado, Esc, clic afuera y bloqueo de scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const burger = page.getByRole('button', { name: 'Abrir menú' });
  await burger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Menú' });
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  await expect(dialog.getByRole('link', { name: 'Producto' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(burger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');

  await burger.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(187, 760);
  await expect(dialog).toHaveCount(0);

  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await dialog.getByRole('link', { name: 'Precios' }).click();
  await expect(page).toHaveURL(/\/precios$/);
  await expect(dialog).toHaveCount(0);
});

test('aviso de cookies se puede rechazar con teclado', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('keep-consent', '1');
    localStorage.removeItem('facilito-consent');
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Configurar' }).click();
  await page.getByRole('button', { name: 'Rechazar' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: /Cookies/ })).toHaveCount(0);
});

test('contacto: validación en cliente, honeypot, éxito y límite', async ({ page }) => {
  await page.goto('/contacto?motivo=demo');
  await expect(page.getByLabel('Motivo')).toHaveValue('demo');
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  await expect(page.getByRole('status')).toContainText('Revisa los campos');
  await expect(page.getByLabel('Nombre')).toBeFocused();
  await expect(page.getByText('Escribe tu nombre.')).toBeVisible();

  await page.getByLabel('Nombre').fill('Ana Núñez');
  await page.getByLabel('WhatsApp o celular').fill('8095550101');
  await page.getByLabel('Correo').fill('ana@ejemplo.test');
  const message = page.getByLabel('Mensaje');
  await message.fill('Quiero una demo para mi colmado esta semana.');
  await page.locator('input[name="company_website"]').fill('https://spam.test', { force: true });
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  await expect(page.getByRole('status')).toContainText('No pudimos enviar');

  await page.locator('input[name="company_website"]').fill('', { force: true });
  for (let i = 0; i < 5; i += 1) {
    await message.fill(`Quiero una demo para mi colmado, intento ${i + 1}.`);
    await page.getByRole('button', { name: 'Enviar mensaje' }).click();
    await expect(page.getByRole('status')).toContainText('Listo');
    await expect(message).toHaveValue('');
  }
  await message.fill('Un intento más para probar el límite.');
  await page.getByRole('button', { name: 'Enviar mensaje' }).click();
  await expect(page.getByRole('status')).toContainText('Demasiados envíos');
});

test('sin violaciones de CSP ni errores de consola', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(msg.text());
  });
  page.on('pageerror', (err) => problems.push(err.message));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => console.error(`CSP: ${event.violatedDirective} ${event.blockedURI}`));
  });
  for (const route of ['/', '/contacto', '/precios']) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    if (route === '/contacto') {
      await page.getByLabel('Nombre').fill('A');
      await page.getByLabel('Correo').focus();
    }
  }
  expect(problems).toEqual([]);
});

test('robots y sitemap de producción', async ({ request, page }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toMatch(/Allow: \//);
  expect(robots).toMatch(/Sitemap: /);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/precios');
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index/);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  const types = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? '{}')['@type']));
  expect(types).toEqual(expect.arrayContaining(['WebSite', 'Organization', 'SoftwareApplication']));
});

test('reduced motion no monta el video ni anima el fondo', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.locator('.mkt-hero')).toHaveAttribute('data-motion', 'off');
  await context.close();
});

test('saveData no pide el video', async ({ page }) => {
  const videoRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/media/') && request.url().includes('loop')) videoRequests.push(request.url());
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '4g' },
    });
  });
  await page.goto('/');
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.locator('.mkt-hero')).toHaveAttribute('data-motion', 'off');
  expect(videoRequests).toEqual([]);
});

test('404 propia con enlaces útiles', async ({ page }) => {
  const response = await page.goto('/esta-ruta-no-existe');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Esta página no está');
  await expect(page.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/');
});

test('badge "Hecho en RD": bandera SVG decorativa en lugar del pin', async ({ page }) => {
  await page.goto('/');
  const badge = page.locator('.mkt-hero-trust li', { hasText: 'Hecho en RD' });
  await expect(badge).toContainText('Soporte en Santo Domingo');
  const flag = badge.locator('svg[data-flag="do"]');
  await expect(flag).toHaveCount(1);
  await expect(flag).toHaveAttribute('aria-hidden', 'true');
  await expect(flag).toHaveAttribute('focusable', 'false');
  await expect(badge.locator('.lucide-map-pin')).toHaveCount(0);
  await expect(page.locator('.mkt-trust li', { hasText: 'Hecho en República Dominicana' }).locator('svg[data-flag="do"]')).toHaveCount(1);
});

test('"Facilito por dentro": pestañas con teclado (flechas, Home, End) y roving tabindex', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const tabs = page.getByRole('tablist', { name: 'Módulos del panel' }).getByRole('tab');
  await expect(tabs).toHaveCount(5);
  await expect(page.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  await tabs.first().focus();
  const expectActive = async (name: string, panelTitle: string) => {
    const tab = page.getByRole('tab', { name: new RegExp(`^${name}`) });
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tab).toBeFocused();
    await expect(tab).toHaveAttribute('tabindex', '0');
    await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await expect(page.getByRole('tabpanel').getByRole('heading', { level: 3 })).toHaveText(panelTitle);
  };
  await page.keyboard.press('ArrowDown');
  await expectActive('Ventas', 'Cobra en segundos');
  await page.keyboard.press('End');
  await expectActive('Reportes', 'Tus números en orden');
  await page.keyboard.press('ArrowRight');
  await expectActive('Inicio', 'Tu negocio de un vistazo');
  await page.keyboard.press('ArrowLeft');
  await expectActive('Reportes', 'Tus números en orden');
  await page.keyboard.press('Home');
  await expectActive('Inicio', 'Tu negocio de un vistazo');
  // Choosing a tab moves the tour there; it does not end it.
  await expect(page.locator('.mkt-show-tour')).toHaveCount(1);
});

test('"Facilito por dentro": hotspots abren con foco, hover y toque; Esc cierra', async ({ browser }) => {
  // Reduced motion: no tour, so only the visitor opens popovers.
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  const panel = page.getByRole('tabpanel');
  await panel.scrollIntoViewIfNeeded();
  const pin = panel.getByRole('button', { name: '1. Indicadores del día' });
  const pop = panel.locator('#show-inicio-1');
  await expect(pop).toBeHidden();
  await pin.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(pin).toBeFocused();
  await expect(pin).toHaveAttribute('aria-expanded', 'true');
  await expect(pop).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(pop).toBeHidden();
  await expect(pin).toBeFocused();
  await pin.blur();
  await pin.hover();
  await expect(pop).toBeVisible();
  await page.mouse.move(5, 5);
  await expect(pop).toBeHidden();
  await pin.click();
  await expect(pop).toBeVisible();
  await page.locator('#por-dentro-title').click();
  await expect(pop).toBeHidden();
  await context.close();
});

test('"Facilito por dentro" en móvil: chips con scroll propio, lista de detalles y sin overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  const list = page.getByRole('tablist', { name: 'Módulos del panel' });
  await list.scrollIntoViewIfNeeded();
  await expect(list).toHaveAttribute('aria-orientation', 'horizontal');
  await expect(page.getByRole('tabpanel').locator('.mkt-show-pin').first()).toBeHidden();
  await expect(page.getByRole('tabpanel').locator('.mkt-show-details li')).toHaveCount(3);
  await page.getByRole('tab', { name: /^Reportes/ }).click();
  await expect(page.getByRole('tabpanel').getByText('Formatos DGII 606, 607 y 608: próximamente')).toBeVisible();
  const sizes = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    tabs: [...document.querySelectorAll<HTMLElement>('[role="tab"]')].map((tab) => tab.getBoundingClientRect().height),
  }));
  expect(sizes.page).toBeLessThanOrEqual(0);
  for (const height of sizes.tabs) expect(height).toBeGreaterThanOrEqual(44);
  // The tour also runs on phones: caption over the screen and the current item marked in the list.
  await expect(page.locator('.mkt-show-tour')).toHaveCount(1);
  await expect(page.getByRole('tabpanel').locator('.mkt-show-caption')).toBeVisible();
  await expect(page.getByRole('tabpanel').locator('.mkt-show-details li[data-current]')).toHaveCount(1);
  await expect(page.getByRole('tabpanel').locator('.mkt-show-pop:visible')).toHaveCount(0);
});

test('"Facilito por dentro": imágenes del mismo origen, con dimensiones y alt; ilustraciones rotuladas', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const images = page.locator('#por-dentro img');
  await expect(images).toHaveCount(5);
  for (const img of await images.all()) {
    expect(await img.getAttribute('src')).toMatch(/^\/product\/[a-z0-9-]+-\d+\.webp$/);
    expect(Number(await img.getAttribute('width'))).toBeGreaterThan(0);
    expect(Number(await img.getAttribute('height'))).toBeGreaterThan(0);
    expect((await img.getAttribute('alt'))?.length ?? 0).toBeGreaterThan(20);
  }
  // First capture loads with the page; the next tab is warmed after hydration; the rest stay lazy.
  await expect(images.first()).toHaveAttribute('loading', 'eager');
  await expect(images.nth(3)).toHaveAttribute('loading', 'lazy');
  await expect(images.nth(4)).toHaveAttribute('loading', 'lazy');
  await page.getByRole('tab', { name: /^Ventas/ }).click();
  await expect(page.getByRole('tabpanel').getByText('Demo ilustrativa')).toBeVisible();
  const avif = await page.request.get('/product/dashboard-640.avif');
  expect(avif.status()).toBe(200);
  expect(avif.headers()['content-type']).toBe('image/avif');
  expect(avif.headers()['x-content-type-options']).toBe('nosniff');
});

test('"Facilito por dentro": sin recorrido automático con reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('#por-dentro').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(page.locator('.mkt-show-tour')).toHaveCount(0);
  await expect(page.getByRole('tab', { name: /^Inicio/ })).toHaveAttribute('aria-selected', 'true');
  await context.close();
});

test('"Facilito por dentro": el recorrido avanza punto por punto y se puede pausar y reanudar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.locator('#por-dentro').scrollIntoViewIfNeeded();
  await page.mouse.move(2, 2);
  const panel = page.getByRole('tabpanel');
  await expect(panel.locator('#show-inicio-1')).toBeVisible();
  await expect(panel.locator('#show-inicio-2')).toBeVisible({ timeout: 8000 });
  await expect(panel.locator('#show-inicio-1')).toBeHidden();
  const toggle = page.locator('.mkt-show-stop');
  await expect(toggle).toHaveText('Pausar recorrido');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveText('Reanudar recorrido');
  await toggle.blur();
  await page.waitForTimeout(5500);
  await expect(panel.locator('#show-inicio-2')).toBeVisible();
  await toggle.focus();
  await page.keyboard.press('Enter');
  await toggle.blur();
  await expect(toggle).toHaveText('Pausar recorrido');
  await expect(panel.locator('#show-inicio-3')).toBeVisible({ timeout: 8000 });
});

test('"Facilito por dentro" en móvil: el recorrido pasa a la siguiente pestaña sin mover la página', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('.mkt-show-grid').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80));
  const ctaTop = () => page.locator('.mkt-show-cta').evaluate((el) => Math.round(el.getBoundingClientRect().top + window.scrollY));
  const before = await ctaTop();
  await expect(page.getByRole('tab', { name: /^Ventas/ })).toHaveAttribute('aria-selected', 'true', { timeout: 20_000 });
  await expect(page.getByRole('tabpanel').locator('.mkt-show-caption')).toContainText('1.');
  expect(await ctaTop()).toBe(before);
  await page.getByRole('tab', { name: /^Reportes/ }).click();
  expect(await ctaTop()).toBe(before);
});

test('headers de seguridad y CSP con nonce en cada ruta', async ({ request }) => {
  for (const route of publicRoutes) {
    const response = await request.get(route);
    const headers = response.headers();
    const csp = headers['content-security-policy'] ?? '';
    const directive = (name: string) => csp.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name} `)) ?? '';
    expect(directive('script-src'), route).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
    expect(directive('script-src'), route).toContain("'strict-dynamic'");
    expect(directive('script-src'), route).not.toContain("'unsafe-inline'");
    expect(directive('img-src'), route).toBe("img-src 'self' blob: data:");
    expect(directive('connect-src'), route).toBe("connect-src 'self'");
    expect(csp, route).toContain("frame-ancestors 'none'");
    expect(csp, route).toContain("object-src 'none'");
    expect(headers['x-frame-options'], route).toBe('DENY');
    expect(headers['x-content-type-options'], route).toBe('nosniff');
    expect(headers['referrer-policy'], route).toBe('strict-origin-when-cross-origin');
    expect(headers['cross-origin-opener-policy'], route).toBe('same-origin');
    expect(headers['permissions-policy'], route).toContain('camera=()');
    expect(headers['x-powered-by'], route).toBeUndefined();
  }
});

test('enlaces externos abren con rel="noopener noreferrer"', async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    const rels = await page.locator('a[target="_blank"]').evaluateAll((links) => links.map((a) => a.getAttribute('rel') ?? ''));
    for (const rel of rels) {
      expect(rel, route).toContain('noopener');
      expect(rel, route).toContain('noreferrer');
    }
  }
});

for (const route of publicRoutes) {
  test(`axe sin violaciones serias en ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
    });
    await page.waitForTimeout(900);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}
