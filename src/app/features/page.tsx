import { BarChart3, ClipboardList, Package, Receipt, Truck, Users } from 'lucide-react';
import { comingSoon, features } from '@/content/features';
import { JsonLd } from '@/components/marketing/json-ld';
import { PageHero } from '@/components/marketing/page-hero';
import { StartCta } from '@/components/marketing/whatsapp-button';
import { copy } from '@/content/copy.es';
import { breadcrumbJsonLd, pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'Producto',
  description: 'Ventas, inventario, facturación, clientes, proveedores y reportes. Lo que Facilito hace hoy, sin promesas de más.',
  path: '/features',
});

const ICONS: Record<string, typeof Receipt> = {
  ventas: Receipt,
  inventario: Package,
  facturacion: ClipboardList,
  clientes: Users,
  proveedores: Truck,
  reportes: BarChart3,
};

export default function FeaturesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Producto', path: '/features' },
        ])}
      />
      <PageHero
        eyebrow="Producto"
        title="Producto"
        lead="Cada bloque es un módulo que ya está en el panel. Lo que no está, no se vende como si estuviera."
      />
      <section className="mkt-section mkt-section-tight" aria-label="Módulos">
        <div className="mkt-wrap">
          <div className="mkt-features">
            {features.map((feature, index) => {
              const Icon = ICONS[feature.id] ?? Receipt;
              return (
                <article key={feature.id} className="mkt-feature" id={feature.id} data-reveal style={{ ['--reveal-i' as string]: index % 2 }}>
                  <div className="mkt-icon">
                    <Icon size={22} aria-hidden />
                  </div>
                  <h2>{feature.title}</h2>
                  <p>
                    <strong>El problema. </strong>
                    {feature.problem}
                  </p>
                  <p>
                    <strong>Con Facilito. </strong>
                    {feature.solution}
                  </p>
                  <StartCta>{copy.start.label}</StartCta>
                </article>
              );
            })}
          </div>
          <div className="mkt-soon-box" data-reveal>
            <h2>Próximamente</h2>
            <ul>
              {comingSoon.map((item) => (
                <li key={item}>
                  <span className="mkt-soon">Próximamente</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
