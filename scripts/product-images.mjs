// Builds the "Facilito por dentro" captures from public/product/_raw/*.png (git-ignored).
// 1) Redacts personal data and fixes known UI typos by repainting text on a canvas with the
//    site's own Poppins (needs the site running: `pnpm build && pnpm start --port 3100`).
// 2) Encodes AVIF + WebP per width (never upscaled), metadata stripped, plus a tiny blur
//    placeholder, and writes the manifest to src/content/showcase-media.json.
// Usage: SHARP_DIR=<folder containing node_modules/sharp> node scripts/product-images.mjs [baseURL]
// sharp is a local tool here, not a project dependency (docs/DECISIONS.md).
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const baseURL = process.argv[2] ?? 'http://127.0.0.1:3100';
const sharpDir = process.env.SHARP_DIR;
if (!sharpDir) throw new Error('Set SHARP_DIR to a folder where `npm i sharp` was run (outside this repo).');
const sharp = (await import(pathToFileURL(path.join(sharpDir, 'node_modules', 'sharp', 'lib', 'index.js')).href)).default;

const RAW = path.join('public', 'product', '_raw');
const OUT = path.join('public', 'product');
const WIDTHS = [640, 1024, 1600];

/**
 * Text replacements per capture. Font sizes were calibrated once against the width of the text
 * being replaced, which is deliberately not stored here (it is the personal data being removed).
 * `bg` is a pixel sampled for the fill; `remove` cuts a substring whose width is derived from
 * `ref`/`refWidth`. Coordinates are in source pixels.
 */
const EDITS = {
  dashboard: [
    { rect: [941, 8, 48, 16], bg: [992, 10], x: 943, baseline: 19.5, weight: 600, size: 10.08, text: 'Demo' },
    { rect: [916, 14, 12, 15], bg: [912, 21], x: 922, baseline: 25, weight: 500, size: 11, align: 'center', color: '#ffffff', text: 'D' },
    { rect: [233, 59, 92, 22], bg: [330, 62], x: 236, baseline: 75.5, weight: 700, size: 19.2, text: 'Demo!' },
    { rect: [748, 441, 100, 13], bg: [870, 446], x: 750, baseline: 450.5, weight: 400, size: 8.91, text: 'RNC: 000-0000000-0' },
    { rect: [748, 479, 100, 14], bg: [870, 485], x: 750, baseline: 488.5, weight: 400, size: 8.74, text: 'demo@example.com' },
  ],
  'inventario-importar-csv': [
    { rect: [935, 9, 48, 15], bg: [986, 6], x: 937.5, baseline: 20, weight: 600, size: 10.2, text: 'Demo' },
    { rect: [911, 16, 11, 14], bg: [906, 22], x: 916, baseline: 26, weight: 500, size: 11.5, align: 'center', color: '#ffffff', text: 'D' },
    // Removes the duplicated "stock_" by shifting the original pixels left (keeps the app's own font).
    { rect: [625, 153, 112, 17], bg: [750, 160], weight: 500, ref: 'stock_stock_minimo,', refWidth: 108, remove: 'stock_' },
  ],
  reportes: [
    { rect: [939, 10, 44, 13], bg: [985, 6], x: 941, baseline: 18.8, weight: 600, size: 8.99, text: 'Demo' },
    { rect: [918, 14, 10, 12], bg: [914, 20], x: 923, baseline: 23, weight: 500, size: 9.5, align: 'center', color: '#ffffff', text: 'D' },
  ],
};

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(baseURL, { waitUntil: 'networkidle' });

const names = (await readdir(RAW)).filter((file) => file.endsWith('.png')).map((file) => file.slice(0, -4));
const manifest = {};
for (const name of names.sort()) {
  const edits = EDITS[name] ?? [];
  const source = await readFile(path.join(RAW, `${name}.png`));
  const dataUrl = await page.evaluate(
    async ({ src, edits }) => {
      const family = getComputedStyle(document.body).fontFamily;
      await Promise.all([400, 500, 600, 700].map((w) => document.fonts.load(`${w} 16px ${family}`)));
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const rgb = (d) => `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
      for (const edit of edits) {
        const [rx, ry, rw, rh] = edit.rect;
        const background = rgb(ctx.getImageData(edit.bg[0], edit.bg[1], 1, 1).data);
        if (edit.remove) {
          ctx.font = `${edit.weight} 100px ${family}`;
          const cut = Math.round((edit.refWidth * ctx.measureText(edit.remove).width) / ctx.measureText(edit.ref).width);
          const kept = ctx.getImageData(rx + cut, ry, rw - cut, rh);
          ctx.fillStyle = background;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.putImageData(kept, rx, ry);
          continue;
        }
        let color = edit.color;
        if (!color) {
          const pixels = ctx.getImageData(rx, ry, rw, rh).data;
          let best = 765;
          for (let i = 0; i < pixels.length; i += 4) {
            const sum = pixels[i] + pixels[i + 1] + pixels[i + 2];
            if (sum < best) {
              best = sum;
              color = rgb(pixels.slice(i, i + 3));
            }
          }
        }
        ctx.fillStyle = background;
        ctx.fillRect(rx, ry, rw, rh);
        let size = edit.size ?? 12;
        if (edit.ref) {
          ctx.font = `${edit.weight} 100px ${family}`;
          size = (100 * edit.refWidth) / ctx.measureText(edit.ref).width;
        }
        ctx.font = `${edit.weight} ${size}px ${family}`;
        ctx.textAlign = edit.align ?? 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = color;
        ctx.fillText(edit.text, edit.x, edit.baseline);
      }
      return canvas.toDataURL('image/png');
    },
    { src: `data:image/png;base64,${source.toString('base64')}`, edits },
  );
  const redacted = Buffer.from(dataUrl.split(',')[1], 'base64');
  const { width, height } = await sharp(redacted).metadata();
  const widths = WIDTHS.filter((w) => w < width).concat(width);
  const files = [];
  for (const w of [...new Set(widths)]) {
    const resized = sharp(redacted).resize({ width: w });
    await resized.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.avif`));
    await resized.clone().webp({ quality: 82 }).toFile(path.join(OUT, `${name}-${w}.webp`));
    files.push(w);
  }
  const blur = await sharp(redacted).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  manifest[name] = { width, height, widths: files, blur: `data:image/webp;base64,${blur.toString('base64')}` };
  if (process.env.KEEP_PREVIEW === '1') {
    await mkdir(path.join(RAW, 'preview'), { recursive: true });
    await writeFile(path.join(RAW, 'preview', `${name}.png`), redacted);
  }
}

await browser.close();
await writeFile(path.join('src', 'content', 'showcase-media.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.table(Object.entries(manifest).map(([name, m]) => ({ name, size: `${m.width}x${m.height}`, widths: m.widths.join(',') })));
