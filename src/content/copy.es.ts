export const copy = {
  hero: {
    title: 'Tu negocio, más fácil cada día.',
    subtitle:
      'Controla tus ventas, inventario y facturación desde un solo lugar. Hecho en República Dominicana, para negocios dominicanos.',
    primary: 'Prueba 1 mes gratis',
    secondary: 'Pedir demo',
    note: 'Eliges tu plan y te preparamos el usuario. Pagas desde el segundo mes.',
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
    lead: 'Cuatro pasos y tu negocio queda en el panel. El primer mes va por nuestra cuenta.',
    steps: [
      { n: '01', title: 'Elige tu plan', body: 'Pro o Business, según tu negocio. En cualquiera de los dos, el primer mes es gratis.' },
      { n: '02', title: 'Te preparamos el usuario', body: 'Nos escribes y activamos tu cuenta según el plan, con los datos de tu negocio.' },
      { n: '03', title: 'Empieza a vender', body: 'Registra ventas, descuenta inventario, emite facturas y mira tus reportes.' },
      { n: '04', title: 'Paga desde el segundo mes', body: 'Por transferencia bancaria, mes a mes. Sin tarjeta y sin cobros automáticos.' },
    ],
  },
  trust: [
    { title: 'Hecho en República Dominicana' },
    { title: 'Soporte desde Santo Domingo' },
    { title: 'RNC y cédula cifrados en reposo' },
    { title: 'Comprobantes en el panel', detail: 'e-CF ante la DGII: próximamente' },
  ],
  showcase: {
    id: 'por-dentro',
    eyebrow: 'El panel',
    title: 'Facilito por dentro',
    emphasis: 'por dentro',
    lead: 'Así se ve el panel donde llevas ventas, inventario, facturas y reportes. Sin instalar nada.',
    tabsLabel: 'Módulos del panel',
    captionCapture: 'Captura del panel · datos de demostración',
    captionIllustration: 'Demo ilustrativa',
    detailsLabel: 'Qué ves en la pantalla',
    imageError: 'No pudimos cargar la imagen. Abajo tienes lo que muestra esta pantalla.',
    empty: 'Muy pronto verás aquí cómo es el panel por dentro.',
    pauseTour: 'Pausar recorrido',
    playTour: 'Reanudar recorrido',
    cta: 'Prueba 1 mes gratis',
    ctaNote: 'Elige tu plan y te preparamos el usuario.',
  },
  /** Primary call to action across the site: pick a plan, the team sets up the account. */
  start: {
    label: 'Prueba 1 mes gratis',
    short: '1 mes gratis',
  },
  /** Module names already shown on /features and in the panel. */
  capabilities: ['Ventas', 'Inventario', 'Facturación', 'Clientes', 'Comprobantes', 'Reportes'],
  faq: {
    eyebrow: 'Preguntas frecuentes',
    title: 'Antes de abrir tu cuenta',
    emphasis: 'tu cuenta',
    lead: 'Planes, pagos y lo que Facilito hace hoy.',
    more: 'Tengo otra pregunta',
  },
  manifesto: 'No más cuadernos. No más Excel perdidos. Solo tu negocio, en orden.',
  final: {
    title: 'Más tiempo para lo importante.',
    body: 'Elige tu plan, te preparamos el usuario y usas Facilito un mes gratis con tu propio negocio.',
    whatsapp: 'Escribir por WhatsApp',
  },
} as const;
