import { BarChart3, FileText, Package, Receipt, ShoppingCart, Users } from 'lucide-react';
import { MarqueeMotion } from './marquee-motion';
import { copy } from '@/content/copy.es';

const ICONS = [ShoppingCart, Package, Receipt, Users, FileText, BarChart3] as const;
/** Each copy repeats the modules so one copy is wider than a 2560px screen (6 items ≈ 1,000px). */
const REPEAT = 3;

function Track({ duplicate }: { duplicate?: boolean }) {
  const items = Array.from({ length: REPEAT }, (_, round) => copy.capabilities.map((label, index) => ({ label, index, round }))).flat();
  return (
    <ul className="mkt-marquee-track" aria-hidden={duplicate || undefined} inert={duplicate || undefined}>
      {items.map(({ label, index, round }) => {
        const Icon = ICONS[index] ?? Receipt;
        return (
          <li key={`${round}-${label}`} aria-hidden={round > 0 || undefined} data-repeat={round > 0 || undefined}>
            <span className="mkt-marquee-pill">
              <Icon size={18} aria-hidden />
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Capabilities band: two identical copies scroll by exactly one copy (-50%), so the loop has no seam.
 * Only the first six items are exposed to assistive tech; repeats and the second copy are decorative.
 */
export function CapabilityMarquee() {
  return (
    <MarqueeMotion label="Módulos de Facilito">
      <div className="mkt-marquee-inner">
        <Track />
        <Track duplicate />
      </div>
    </MarqueeMotion>
  );
}
