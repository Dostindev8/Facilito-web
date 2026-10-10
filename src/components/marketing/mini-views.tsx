import { BarChart3, Check, Plus, Search } from 'lucide-react';
import { formatRd } from '@/lib/format';

/**
 * Small, static HTML renderings of real panel screens. Decorative: every view is aria-hidden
 * and the numbers are examples, so the section copy carries the meaning.
 */

export function MiniSale() {
  const lines = [
    { name: 'Arroz 5 lb', qty: 2, price: 250 },
    { name: 'Aceite 1 L', qty: 1, price: 325 },
    { name: 'Refresco 2 L', qty: 3, price: 120 },
  ];
  const total = lines.reduce((sum, line) => sum + line.qty * line.price, 0);
  return (
    <div className="mkt-mini" aria-hidden="true">
      <div className="mkt-mini-search">
        <Search size={14} />
        Buscar producto
      </div>
      <ul className="mkt-mini-lines">
        {lines.map((line) => (
          <li key={line.name}>
            <span>
              {line.qty} × {line.name}
            </span>
            <span>{formatRd(line.qty * line.price)}</span>
          </li>
        ))}
      </ul>
      <div className="mkt-mini-pay">
        <span className="mkt-mini-chip is-on">Efectivo</span>
        <span className="mkt-mini-chip">Tarjeta</span>
        <span className="mkt-mini-chip">Transferencia</span>
      </div>
      <div className="mkt-mini-total">
        <span>Total</span>
        <strong>{formatRd(total)}</strong>
      </div>
      <span className="mkt-mini-btn">Cobrar</span>
    </div>
  );
}

export function MiniStock() {
  const rows = [
    { name: 'Arroz 5 lb', qty: 4, pct: 16, low: true },
    { name: 'Habichuelas', qty: 22, pct: 64, low: false },
    { name: 'Azúcar 2 lb', qty: 31, pct: 82, low: false },
  ];
  return (
    <div className="mkt-mini" aria-hidden="true">
      <ul className="mkt-mini-stock">
        {rows.map((row) => (
          <li key={row.name}>
            <span className="mkt-mini-stock-name">
              {row.name}
              {row.low && <span className="mkt-mini-badge">Bajo</span>}
            </span>
            <span className="mkt-mini-stock-qty">{row.qty} u.</span>
            <span className="mkt-bar" data-low={row.low || undefined}>
              <span style={{ width: `${row.pct}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MiniInvoice() {
  return (
    <div className="mkt-mini mkt-mini-invoice" aria-hidden="true">
      <div className="mkt-mini-row">
        <strong>Factura 0142</strong>
        <span className="mkt-mini-status">
          <Check size={12} />
          Pagada
        </span>
      </div>
      <div className="mkt-mini-row mkt-mini-muted">
        <span>Cliente: Colmado La Esquina</span>
      </div>
      <div className="mkt-mini-row">
        <span>Total</span>
        <strong>{formatRd(3275)}</strong>
      </div>
      <span className="mkt-mini-soon">e-CF ante la DGII: próximamente</span>
    </div>
  );
}

export function MiniAccount() {
  return (
    <div className="mkt-mini" aria-hidden="true">
      <div className="mkt-mini-field">
        <span>Tu nombre</span>
        <strong>Ana Núñez</strong>
      </div>
      <div className="mkt-mini-field">
        <span>Negocio</span>
        <strong>Colmado Ana</strong>
      </div>
      <span className="mkt-mini-btn">Crear cuenta</span>
    </div>
  );
}

export function MiniSetup() {
  return (
    <div className="mkt-mini" aria-hidden="true">
      <div className="mkt-mini-pay">
        <span className="mkt-mini-chip is-on">Productos</span>
        <span className="mkt-mini-chip">Clientes</span>
        <span className="mkt-mini-chip">Comprobantes</span>
      </div>
      <div className="mkt-mini-row">
        <span>Café 1 lb</span>
        <strong>{formatRd(285)}</strong>
      </div>
      <span className="mkt-mini-add">
        <Plus size={14} />
        Agregar producto
      </span>
    </div>
  );
}

export function MiniCheckout() {
  return (
    <div className="mkt-mini" aria-hidden="true">
      <div className="mkt-mini-total mkt-mini-total-lg">
        <span>Total</span>
        <strong>{formatRd(1250)}</strong>
      </div>
      <div className="mkt-mini-toast">
        <Check size={14} />
        Venta cobrada · stock actualizado
      </div>
    </div>
  );
}

export function MiniReport() {
  const bars = [38, 52, 44, 66, 58, 84, 72];
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  return (
    <div className="mkt-mini" aria-hidden="true">
      <div className="mkt-mini-row mkt-mini-muted">
        <span>
          <BarChart3 size={14} /> Ventas de la semana
        </span>
      </div>
      <div className="mkt-mini-chart">
        {bars.map((height, i) => (
          <span key={i} className="mkt-mini-col">
            <span className="mkt-mini-colbar" style={{ height: `${height}%` }} data-peak={height === 84 || undefined} />
            <span className="mkt-mini-day">{days[i]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
