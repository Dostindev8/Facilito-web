export const copy = {
  hero: {
    title: 'Tu negocio, más fácil cada día.',
    subtitle:
      'Controla tus ventas, inventario y facturación desde un solo lugar. Hecho en República Dominicana, para negocios dominicanos.',
    primary: 'Empezar gratis',
    secondary: 'Pedir demo',
    note: 'Crear la cuenta no pide tarjeta.',
    highlight: 'fácil',
    howLink: 'Ver cómo funciona',
  },
  heroTrust: [
    { title: 'Seguro', body: 'RNC y cédula cifrados' },
    { title: 'Rápido', body: 'Cobra en segundos' },
    { title: 'En la nube', body: 'Desde el celular o la caja' },
    { title: 'Hecho en RD', body: 'Soporte en Santo Domingo' },
  ],
  /** Illustrative numbers for the hero preview. Labelled on screen as an example, never as customer data. */
  heroPreview: {
    caption: 'Demo ilustrativa',
    sales: { label: 'Ventas hoy', value: 18450, delta: '+12% vs. ayer' },
    stock: {
      label: 'Inventario',
      note: '3 productos por agotarse',
      items: [
        { name: 'Arroz 5 lb', qty: 4, pct: 18 },
        { name: 'Aceite 1 L', qty: 6, pct: 30 },
        { name: 'Café 1 lb', qty: 9, pct: 45 },
      ],
    },
    invoice: { label: 'Facturación', number: 'Factura 0142', status: 'Pagada', total: 3275 },
  },
  pillarsIntro: {
    eyebrow: 'Producto',
    title: 'Lo que ya puedes hacer',
    emphasis: 'hacer',
    lead: 'Tres módulos que ya están en el panel, pensados para el ritmo de un negocio dominicano.',
    link: 'Ver todo el producto',
  },
  pillars: [
    {
      title: 'Ventas rápidas',
      body: 'Cobra en segundos, desde el celular o la caja.',
    },
    {
      title: 'Inventario al día',
      body: 'Sabe qué tienes y qué te falta, sin contar a mano.',
    },
    {
      title: 'Facturación sin enredos',
      body: 'Emite facturas, registra cobros y deja tus números en orden. La facturación electrónica ante la DGII (e-CF) va próximamente.',
    },
  ],
  how: {
    id: 'como-funciona',
    eyebrow: 'Paso a paso',
    title: 'Cómo funciona',
    emphasis: 'funciona',
    lead: 'Cuatro pasos. Sin manual de cien páginas.',
    steps: [
      { n: '01', title: 'Crea tu cuenta', body: 'Nombre, correo y los datos de tu negocio. Entras directo al panel.' },
      { n: '02', title: 'Configura tu negocio', body: 'Productos, clientes y, si facturas con valor fiscal, tus secuencias de comprobantes.' },
      { n: '03', title: 'Empieza a vender', body: 'Registra la venta, descuenta el inventario y emite la factura desde el mismo flujo.' },
      { n: '04', title: 'Mira tus reportes', body: 'Revisa ventas, stock y facturas sin armar el Excel del mes.' },
    ],
  },
  trust: [
    { title: 'Hecho en República Dominicana' },
    { title: 'Soporte desde Santo Domingo' },
    { title: 'RNC y cédula cifrados en reposo' },
    { title: 'Comprobantes en el panel', detail: 'e-CF ante la DGII: próximamente' },
  ],
  /** Module names already shown on /features and in the panel. */
  capabilities: ['Ventas', 'Inventario', 'Facturación', 'Clientes', 'Comprobantes', 'Reportes'],
  faq: {
    eyebrow: 'Preguntas frecuentes',
    title: 'Antes de abrir tu cuenta',
    emphasis: 'tu cuenta',
    lead: 'Respuestas sobre lo que Facilito hace hoy.',
    more: 'Tengo otra pregunta',
  },
  manifesto: 'No más cuadernos. No más Excel perdidos. Solo tu negocio, en orden.',
  final: {
    title: 'Más tiempo para lo importante.',
    body: 'Abre tu cuenta y prueba Facilito con tu propio negocio.',
    whatsapp: 'Escribir por WhatsApp',
  },
} as const;
