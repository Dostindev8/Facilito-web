// Full-page screenshots of the public routes at the QA breakpoints.
// Usage: node scripts/capture.mjs <label> [baseURL]   (server must already be running)
// Optional env: WIDTHS=375,414  ROUTES=/,/precios  REDUCED=1 (prefers-reduced-motion: reduce)
// Preset `showcase`: only the "Facilito por dentro" section, full responsive matrix + 667×375 landscape.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const label = process.argv[2] ?? 'snapshot';
const baseURL = process.argv[3] ?? 'http://127.0.0.1:3100';
const PRESETS = {
  showcase: { selector: '#por-dentro', routes: ['/'], widths: [320, 360, 375, 390, 414, 768, 820, 1024, 1280, 1440, 1920, 2560], extra: [{ width: 667, height: 375 }] },
};
const preset = PRESETS[label] ?? {};
const list = (value) => value?.split(',').map((item) => item.trim()).filter(Boolean);
const widths = list(process.env.WIDTHS)?.map(Number) ?? preset.widths ?? [375, 768, 1024, 1440, 1920];
const routes = list(process.env.ROUTES) ?? preset.routes ?? ['/', '/features', '/precios', '/contacto', '/nosotros'];
const reducedMotion = process.env.REDUCED === '1' ? 'reduce' : 'no-preference';
const outDir = path.join('docs', 'captures', label);
const viewports = [...widths.map((width) => ({ width, height: width < 768 ? 812 : 900 })), ...(preset.extra ?? [])];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const report = [];

for (const { width, height } of viewports) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion, bypassCSP: true });
  await context.addInitScript(() => localStorage.setItem('facilito-consent', 'rejected'));
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(baseURL + route, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForFunction(() => window.scrollY === 0);
    // Full-page shots extend past the viewport, where content-visibility:auto skips rendering.
    await page.addStyleTag({ content: '* { content-visibility: visible !important; }' });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    report.push({ width, height, route, overflow });
    const base = route === '/' ? 'home' : route.slice(1).replace(/[/?&=]+/g, '-');
    const size = preset.extra?.some((v) => v.width === width && v.height === height) ? `${width}x${height}` : `${width}`;
    if (preset.selector) {
      const section = page.locator(preset.selector);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      // Fixed chrome would be stamped over a section taller than the viewport.
      await section.screenshot({
        path: path.join(outDir, `${label}-${size}.png`),
        style: '.mkt-header, .skip-link, .mkt-top { visibility: hidden !important; }',
      });
    } else {
      await page.screenshot({ path: path.join(outDir, `${base}-${size}.png`), fullPage: true });
    }
  }
  await context.close();
}

await browser.close();
console.table(report);
