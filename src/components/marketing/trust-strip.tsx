import { FileCheck2, Headset, LockKeyhole, MapPin } from 'lucide-react';
import { LogoMark } from '@/components/brand/logo';
import { copy } from '@/content/copy.es';

const ICONS = [MapPin, Headset, LockKeyhole, FileCheck2] as const;

export function TrustStrip() {
  return (
    <section className="mkt-trust" aria-label="Hechos del producto">
      <div className="mkt-wrap">
        <ul className="mkt-trust-list">
          {copy.trust.map((item, index) => {
            const Icon = ICONS[index] ?? MapPin;
            return (
              <li key={item} data-reveal style={{ ['--reveal-i' as string]: index }}>
                <span className="mkt-trust-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                {item}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function Manifesto() {
  return (
    <section className="mkt-manifesto" aria-label="Manifiesto">
      <div className="mkt-wrap mkt-manifesto-inner">
        <p data-reveal>{copy.manifesto}</p>
        <span className="mkt-manifesto-mark" aria-hidden="true">
          <LogoMark size={160} />
        </span>
      </div>
    </section>
  );
}
