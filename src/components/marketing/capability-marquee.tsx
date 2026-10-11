import { BarChart3, FileText, Package, Receipt, ShoppingCart, Users } from 'lucide-react';
import { copy } from '@/content/copy.es';

const ICONS = [ShoppingCart, Package, Receipt, Users, FileText, BarChart3] as const;

function Track({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="mkt-marquee-track" aria-hidden={hidden || undefined}>
      {copy.capabilities.map((label, index) => {
        const Icon = ICONS[index] ?? Receipt;
        return (
          <li key={label}>
            <Icon size={18} aria-hidden />
            {label}
          </li>
        );
      })}
    </ul>
  );
}

/** Capabilities band. The second track only exists to make the loop seamless, so assistive tech skips it. */
export function CapabilityMarquee() {
  return (
    <section className="mkt-marquee" aria-label="Módulos de Facilito">
      <div className="mkt-marquee-inner">
        <Track />
        <Track hidden />
      </div>
    </section>
  );
}
