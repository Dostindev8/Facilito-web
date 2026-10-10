import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const publicRoutes = ['/', '/features', '/precios', '/contacto', '/nosotros', '/legal/privacidad', '/legal/terminos', '/legal/cookies'];
const matrix = [375, 390, 430, 768, 820, 1024, 1280, 1440, 1920, 2560];
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

test('CTA de registro e inicio de sesión apuntan a la app', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Empezar gratis' }).first()).toHaveAttribute('href', /\/login\?tab=registro$/);
  await expect(page.getByRole('link', { name: 'Iniciar sesión' }).first()).toHaveAttribute('href', /\/login$/);
  await expect(page.getByRole('link', { name: 'Pedir demo' }).first()).toHaveAttribute('href', '/contacto?motivo=demo');
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
    const kicker = await box('.mkt-kicker');
    const trust = await box('.mkt-hero-trust');
    expect(kicker.width, `ancho ${width}`).toBeGreaterThan(0);
    expect(Math.abs(logo.x - kicker.x), `ancho ${width}`).toBeLessThanOrEqual(1);
    expect(Math.abs(trust.x - kicker.x), `ancho ${width}`).toBeLessThanOrEqual(1);
  }
});

test('precios: mismos planes y montos, tarjetas de igual altura', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/precios');
  const cards = page.locator('.mkt-price');
  await expect(cards).toHaveCount(3);
  await expect(cards.locator('.mkt-price-amount strong')).toHaveText(['US$0', 'US$16', 'US$39']);
  const heights = await cards.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
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
  await page.setViewportSize({ width: 812, height: 375 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
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
