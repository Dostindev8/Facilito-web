import { z } from 'zod';
import media from './showcase-media.json';

/**
 * "Facilito por dentro": one tab per panel module. Images come from scripts/product-images.mjs
 * (manifest in showcase-media.json). `capture` = real panel screen with demo data;
 * `illustration` = screen drawn by scripts/showcase-mocks.mjs, labelled "Demo ilustrativa" on the page.
 * Anything not live yet (e-CF, DGII 606/607/608) goes in `soon`, never in `points`.
 */

const mediaSchema = z.record(
  z.string(),
  z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    widths: z.array(z.number().int().positive()).min(1),
    blur: z.string().startsWith('data:image/webp;base64,'),
  }),
);

export const hotspotSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  title: z.string().min(1),
  body: z.string().min(1),
});

export const showcaseTabSchema = z.object({
  id: z.string().regex(/^[a-z][a-z-]*$/),
  label: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1).max(90),
  points: z.array(z.string().min(1)).min(1).max(4),
  soon: z.string().min(1).optional(),
  image: z.object({
    name: z.string().regex(/^[a-z0-9-]+$/),
    kind: z.enum(['capture', 'illustration']),
    alt: z.string().min(20),
  }),
  hotspots: z.array(hotspotSchema).min(2).max(3),
});

export const showcaseSchema = z.array(showcaseTabSchema).max(6);

export type ShowcaseTabData = z.infer<typeof showcaseTabSchema>;
export type ShowcaseMedia = z.infer<typeof mediaSchema>[string];

export const showcaseTabsData: ShowcaseTabData[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    title: 'Tu negocio de un vistazo',
    summary: 'Ventas, facturas y clientes del día en una sola pantalla.',
    points: [
      'Ventas del día, productos vendidos, facturas emitidas y clientes atendidos.',
      'Resumen de ventas de los últimos 7, 14 o 30 días.',
      'Acciones rápidas: nueva venta, agregar producto, emitir factura y ver inventario.',
    ],
    image: {
      name: 'dashboard',
      kind: 'capture',
      alt: 'Panel de inicio de Facilito con ventas del día, productos vendidos, facturas emitidas, clientes atendidos, resumen de ventas de 7 días y acciones rápidas. Datos de demostración.',
    },
    hotspots: [
      { x: 37.5, y: 22.7, title: 'Indicadores del día', body: 'Ventas, productos vendidos, facturas emitidas y clientes atendidos de hoy.' },
      { x: 51, y: 46.5, title: 'Resumen por período', body: 'Cambia entre 7, 14 y 30 días.' },
      { x: 87.5, y: 45, title: 'Acciones rápidas', body: 'Nueva venta, agregar producto, emitir factura o ver inventario en un toque.' },
    ],
  },
  {
    id: 'ventas',
    label: 'Ventas (POS)',
    title: 'Cobra en segundos',
    summary: 'Busca, agrega al carrito y cobra.',
    points: [
      'Buscador de productos para armar la venta rápido.',
      'Carrito con cantidades y total al momento.',
      'Cobro en efectivo, tarjeta o transferencia con el botón Cobrar.',
    ],
    image: {
      name: 'ventas-pos',
      kind: 'illustration',
      alt: 'Ilustración de la pantalla de ventas: buscador de productos, carrito con tres productos, métodos de pago efectivo, tarjeta y transferencia, y botón Cobrar.',
    },
    hotspots: [
      { x: 66.4, y: 27.2, title: 'Buscador', body: 'Encuentra el producto y súmalo al carrito.' },
      { x: 71, y: 60.8, title: 'Método de pago', body: 'Efectivo, tarjeta o transferencia.' },
      { x: 94.2, y: 68.9, title: 'Cobrar', body: 'Cierra la venta en un toque.' },
    ],
  },
  {
    id: 'inventario',
    label: 'Inventario',
    title: 'Control sin hojas de Excel',
    summary: 'Alertas de stock bajo e importación desde CSV.',
    points: [
      'Alertas de productos con stock bajo o agotados.',
      'Importa hasta 2,000 productos desde un CSV compatible con Excel; solo nombre y precio_venta son obligatorios.',
      'Plantilla descargable y exportación de tu inventario.',
    ],
    image: {
      name: 'inventario-importar-csv',
      kind: 'capture',
      alt: 'Ventana de Facilito para importar productos desde un archivo CSV compatible con Excel, hasta 2,000 filas, con nombre y precio_venta obligatorios y botón para descargar la plantilla.',
    },
    hotspots: [
      { x: 57, y: 36.4, title: 'Columnas del CSV', body: 'Obligatorias: nombre y precio_venta. Hasta 2,000 filas.' },
      { x: 39.3, y: 42.4, title: 'Plantilla descargable', body: 'Bájala, complétala en Excel y guárdala como CSV.' },
      { x: 67.4, y: 15, title: 'Exportar', body: 'Descarga tu inventario cuando lo necesites.' },
    ],
  },
  {
    id: 'facturacion',
    label: 'Facturación',
    title: 'Facturación sin enredos',
    summary: 'Emite facturas y registra cobros.',
    points: ['Emite facturas desde el panel.', 'Registra los cobros y ten tus facturas en orden, en un solo lugar.'],
    soon: 'e-CF ante la DGII: próximamente',
    image: {
      name: 'facturacion',
      kind: 'illustration',
      alt: 'Ilustración de la pantalla de facturación: lista de facturas pagadas y pendientes, botón Nueva factura y aviso de que el e-CF ante la DGII llega próximamente.',
    },
    hotspots: [
      { x: 86.5, y: 13.7, title: 'Nueva factura', body: 'Emite una factura en pocos pasos.' },
      { x: 83.6, y: 58.6, title: 'Registrar cobro', body: 'Marca lo cobrado y mantén tus cuentas claras.' },
      { x: 70, y: 83.5, title: 'e-CF: próximamente', body: 'La facturación electrónica ante la DGII todavía no está disponible.' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    title: 'Tus números en orden',
    summary: 'Resumen por período, exportable a Excel (CSV) y PDF.',
    points: ['Resumen de facturación por período, con filtro por estado.', 'Exporta a Excel (CSV) y PDF.'],
    soon: 'Formatos DGII 606, 607 y 608: próximamente, tras validar la estructura oficial.',
    image: {
      name: 'reportes',
      kind: 'capture',
      alt: 'Pantalla de reportes de Facilito con filtros de fecha y estado, totales del período y exportación a Excel (CSV) y PDF. Un aviso indica que los formatos DGII 606, 607 y 608 se habilitarán tras validar su estructura oficial. Datos de demostración.',
    },
    hotspots: [
      { x: 16.8, y: 22.6, title: 'Elige el período', body: 'Desde, hasta y estado de las facturas.' },
      { x: 86.4, y: 11, title: 'Exporta', body: 'Excel (CSV) y PDF con un clic.' },
      { x: 80.5, y: 89.5, title: 'Formatos 606, 607 y 608', body: 'Próximamente, tras validar la estructura oficial.' },
    ],
  },
];

export const showcaseMedia = mediaSchema.parse(media);

export type ShowcaseTab = ShowcaseTabData & {
  media: { width: number; height: number; src: string; avif: string; webp: string; blur: string } | null;
};

/** Validated tabs with their image sources resolved; a tab whose image is missing keeps `media: null`. */
export function showcaseTabs(): ShowcaseTab[] {
  return showcaseSchema.parse(showcaseTabsData).map((tab) => {
    const entry = showcaseMedia[tab.image.name];
    if (!entry) return { ...tab, media: null };
    const srcset = (ext: string) => entry.widths.map((w) => `/product/${tab.image.name}-${w}.${ext} ${w}w`).join(', ');
    const fallback = entry.widths.find((w) => w >= 1024) ?? entry.widths[entry.widths.length - 1];
    return {
      ...tab,
      media: {
        width: entry.width,
        height: entry.height,
        src: `/product/${tab.image.name}-${fallback}.webp`,
        avif: srcset('avif'),
        webp: srcset('webp'),
        blur: entry.blur,
      },
    };
  });
}
