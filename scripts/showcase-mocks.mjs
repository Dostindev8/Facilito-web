// Renders the illustrative "Ventas (POS)" and "Facturación" screens for the showcase into
// public/product/_raw/ (git-ignored), at 1024×490 CSS px and 1600px wide output, using the site's
// own tokens and Poppins. Every number and name is fictitious; the section labels them "Demo ilustrativa".
// Prints each [data-spot] centre as % so hotspots in src/content/showcase.ts can be kept in sync.
// Usage: node scripts/showcase-mocks.mjs [baseURL]   (site must be running), then product-images.mjs.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = process.argv[2] ?? 'http://127.0.0.1:3100';
const RAW = path.join('public', 'product', '_raw');
const W = 1024;
const H = 490;

const CSS = `
  * { box-sizing: border-box; margin: 0; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; background: #f4f7f5; font-family: Poppins, sans-serif; color: var(--ink, #0f172a); }
  .m-app { display: grid; grid-template-columns: 156px 1fr; height: ${H}px; }
  aside { background: #fff; border-right: 1px solid var(--line); padding: 14px 10px; display: flex; flex-direction: column; gap: 4px; }
  .m-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; color: var(--green-700); padding: 0 6px 14px; }
  .m-logo img { width: 26px; height: 26px; object-fit: contain; }
  .m-nav { display: flex; align-items: center; gap: 9px; height: 30px; padding: 0 10px; border-radius: 9px; font-size: 11.5px; font-weight: 500; color: #334155; }
  .m-nav i { width: 14px; height: 14px; border: 1.6px solid currentColor; border-radius: 4px; opacity: .8; }
  .m-nav.m-on { background: var(--green-50); color: var(--green-800); font-weight: 600; }
  main { display: flex; flex-direction: column; min-width: 0; }
  header { height: 46px; display: flex; align-items: center; gap: 14px; padding: 0 20px; background: #fff; border-bottom: 1px solid var(--line); }
  .m-search { flex: 0 1 330px; height: 28px; border-radius: 8px; background: #f1f5f4; display: flex; align-items: center; padding: 0 10px; font-size: 10.5px; color: #64748b; }
  .m-user { margin-left: auto; display: flex; align-items: center; gap: 8px; font-size: 11px; }
  .m-bell { width: 16px; height: 16px; border: 1.6px solid #334155; border-radius: 6px 6px 3px 3px; }
  .m-av { width: 26px; height: 26px; border-radius: 50%; background: var(--green-700); color: #fff; display: grid; place-items: center; font-weight: 600; font-size: 11px; }
  .m-user b { display: block; font-weight: 600; } .m-user small { color: #64748b; font-size: 9.5px; }
  .m-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; min-height: 0; flex: 1; }
  h1 { font-size: 20px; font-weight: 700; line-height: 1.1; } .m-sub { font-size: 11px; color: #64748b; margin-top: 3px; }
  .m-card { background: #fff; border: 1px solid var(--line); border-radius: 14px; }
  .m-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 32px; padding: 0 14px; border-radius: 9px; font-size: 11px; font-weight: 600; background: var(--green-700); color: #fff; }
  .m-btn.m-ghost { background: #fff; color: #0f172a; border: 1px solid var(--line); }
  .m-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .m-chip { height: 26px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); font-size: 10.5px; font-weight: 500; display: inline-flex; align-items: center; }
  .m-chip.m-on { background: var(--green-50); border-color: var(--green-100); color: var(--green-800); font-weight: 600; }
  .m-muted { color: #64748b; } .m-money { font-variant-numeric: tabular-nums; }
  /* POS */
  .m-pos { display: grid; grid-template-columns: 1fr 292px; gap: 14px; flex: 1; min-height: 0; }
  .m-field { height: 34px; border-radius: 10px; background: #fff; border: 1px solid var(--line); display: flex; align-items: center; padding: 0 12px; font-size: 11px; color: #64748b; }
  .m-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
  .m-prod { padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; font-size: 11px; }
  .m-prod .m-thumb { height: 38px; border-radius: 9px; background: var(--green-50); }
  .m-prod .m-row b { font-weight: 600; } .m-plus { width: 22px; height: 22px; border-radius: 7px; background: var(--green-700); color: #fff; display: grid; place-items: center; font-weight: 700; }
  .m-cart { padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; font-size: 11px; }
  .m-cart h2 { font-size: 13px; font-weight: 700; } .m-line { display: flex; justify-content: space-between; }
  .m-total { display: flex; justify-content: space-between; align-items: baseline; border-top: 1px dashed var(--line); padding-top: 8px; }
  .m-total strong { font-size: 19px; font-weight: 700; }
  .m-pay { display: flex; gap: 6px; flex-wrap: wrap; }
  .m-cobrar { height: 38px; font-size: 13px; width: 100%; }
  /* Invoices */
  .m-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .m-kpi { padding: 12px 14px; font-size: 10.5px; } .m-kpi strong { display: block; font-size: 17px; font-weight: 700; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  th { text-align: left; font-weight: 600; color: #64748b; padding: 8px 14px; border-bottom: 1px solid var(--line); }
  td { padding: 8px 14px; border-bottom: 1px solid var(--line); }
  tr:last-child td { border-bottom: 0; }
  .m-st { display: inline-flex; height: 20px; padding: 0 8px; border-radius: 999px; align-items: center; font-weight: 600; font-size: 9.5px; }
  .m-st.m-ok { background: var(--green-50); color: var(--green-800); } .m-st.m-wait { background: #fff4e5; color: #9a5b00; }
  .m-link { color: var(--green-700); font-weight: 600; }
  .m-soon { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 10px; background: #eef4ff; color: #1e3a8a; font-size: 10.5px; }
  .m-soon b { font-weight: 600; }
`;

const NAV = ['Inicio', 'Ventas', 'Inventario', 'Facturación', 'Clientes', 'Proveedores', 'Reportes', 'Configuración'];
const shell = (active, content) => `
  <div class="m-app">
    <aside>
      <div class="m-logo"><img src="/brand/facilito-icon.png" alt="">Facilito</div>
      ${NAV.map((n) => `<div class="m-nav${n === active ? ' m-on' : ''}"><i></i>${n}</div>`).join('')}
    </aside>
    <main>
      <header>
        <div class="m-search">Buscar productos, clientes, ventas…</div>
        <div class="m-user"><span class="m-bell"></span><span class="m-av">D</span><span><b>Demo</b><small>Dueño</small></span></div>
      </header>
      <div class="m-body">${content}</div>
    </main>
  </div>`;

const money = (n) => `RD$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const products = [
  ['Arroz 5 lb', 250], ['Aceite 1 L', 325], ['Refresco 2 L', 120],
  ['Café 1 lb', 285], ['Azúcar 2 lb', 95], ['Habichuelas', 110],
];
const lines = [[2, 'Arroz 5 lb', 250], [1, 'Aceite 1 L', 325], [3, 'Refresco 2 L', 120]];
const total = lines.reduce((s, [q, , p]) => s + q * p, 0);

const POS = shell('Ventas', `
  <div><h1>Nueva venta</h1><p class="m-sub">Busca, agrega al carrito y cobra.</p></div>
  <div class="m-pos">
    <div>
      <div class="m-field" data-spot="search">Buscar producto</div>
      <div class="m-grid">
        ${products.map(([n, p]) => `<div class="m-card m-prod"><div class="m-thumb"></div><b>${n}</b><div class="m-row"><span class="m-money m-muted">${money(p)}</span><span class="m-plus">+</span></div></div>`).join('')}
      </div>
    </div>
    <div class="m-card m-cart">
      <div class="m-row"><h2>Carrito</h2><span class="m-muted">${lines.length} productos</span></div>
      <div data-spot="cart">${lines.map(([q, n, p]) => `<div class="m-line"><span>${q} × ${n}</span><span class="m-money">${money(q * p)}</span></div>`).join('')}</div>
      <div class="m-total"><span>Total</span><strong class="m-money">${money(total)}</strong></div>
      <span class="m-muted">Método de pago</span>
      <div class="m-pay" data-spot="pay"><span class="m-chip m-on">Efectivo</span><span class="m-chip">Tarjeta</span><span class="m-chip">Transferencia</span></div>
      <span class="m-btn m-cobrar" data-spot="cobrar">Cobrar ${money(total)}</span>
    </div>
  </div>`);

const invoices = [
  ['0142', 'Colmado La Esquina', '08/10/2026', 3275, 'Pagada'],
  ['0141', 'Negocio Demo', '08/10/2026', 1850, 'Pendiente'],
  ['0140', 'Cliente de contado', '07/10/2026', 640, 'Pagada'],
  ['0139', 'Ferretería Demo', '07/10/2026', 4120, 'Pagada'],
];

const INVOICES = shell('Facturación', `
  <div class="m-row"><div><h1>Facturación</h1><p class="m-sub">Emite facturas y registra cobros.</p></div><span class="m-btn" data-spot="new">+ Nueva factura</span></div>
  <div class="m-kpis">
    <div class="m-card m-kpi"><span class="m-muted">Facturas del mes</span><strong>24</strong></div>
    <div class="m-card m-kpi"><span class="m-muted">Cobrado</span><strong class="m-money">${money(48350)}</strong></div>
    <div class="m-card m-kpi"><span class="m-muted">Por cobrar</span><strong class="m-money">${money(6200)}</strong></div>
  </div>
  <div class="m-card">
    <table>
      <thead><tr><th>Factura</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th></tr></thead>
      <tbody>${invoices.map(([n, c, d, t, s]) => `<tr><td>Factura ${n}</td><td>${c}</td><td>${d}</td><td class="m-money">${money(t)}</td><td><span class="m-st ${s === 'Pagada' ? 'm-ok' : 'm-wait'}">${s}</span></td><td>${s === 'Pagada' ? '<span class="m-muted">Ver</span>' : '<span class="m-link" data-spot="cobro">Registrar cobro</span>'}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="m-soon" data-spot="ecf"><b>e-CF ante la DGII:</b> próximamente. Hoy emites facturas y registras cobros desde el panel.</div>`);

await mkdir(RAW, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1600 / W });
// The site uses font-display: optional, so Poppins only applies once it is cached: warm it up first.
await page.goto(baseURL, { waitUntil: 'networkidle' });
await page.evaluate(() => Promise.all([400, 500, 600, 700].map((w) => document.fonts.load(`${w} 16px Poppins`))));
for (const [name, html] of [['ventas-pos', POS], ['facturacion', INVOICES]]) {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await page.evaluate(
    async ({ css, html }) => {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.append(style);
      document.body.className = '';
      document.body.innerHTML = html;
      await Promise.all([400, 500, 600, 700].map((w) => document.fonts.load(`${w} 16px Poppins`)));
      if (!document.fonts.check('600 16px Poppins')) throw new Error('Poppins did not load');
      await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    },
    { css: CSS, html },
  );
  await page.screenshot({ path: path.join(RAW, `${name}.png`), clip: { x: 0, y: 0, width: W, height: H } });
  const spots = await page.evaluate(
    ({ W, H }) =>
      [...document.querySelectorAll('[data-spot]')].map((el) => {
        const r = el.getBoundingClientRect();
        return { spot: el.getAttribute('data-spot'), x: +(((r.left + r.width / 2) / W) * 100).toFixed(1), y: +(((r.top + r.height / 2) / H) * 100).toFixed(1) };
      }),
    { W, H },
  );
  console.log(name, JSON.stringify(spots));
}
await browser.close();
