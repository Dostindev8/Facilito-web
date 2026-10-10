// Full-page screenshots of the public routes at the QA breakpoints.
// Usage: node scripts/capture.mjs <label> [baseURL]   (server must already be running)
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const label = process.argv[2] ?? 'snapshot';
const baseURL = process.argv[3] ?? 'http://127.0.0.1:3100';
const widths = [375, 768, 1024, 1440, 1920];
const routes = ['/', '/features', '/precios', '/contacto', '/nosotros'];
const outDir = path.join('docs', 'captures', label);

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const report = [];

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 900 }, deviceScaleFactor: 1 });
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
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    report.push({ width, route, overflow });
    const name = `${route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')}-${width}.png`;
    await page.screenshot({ path: path.join(outDir, name), fullPage: true });
  }
  await context.close();
}

await browser.close();
console.table(report);
