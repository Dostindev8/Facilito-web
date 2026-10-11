import { FileCheck2, Headset, LockKeyhole } from 'lucide-react';
import { FlagDO } from '@/components/ui/flag-do';
import { copy } from '@/content/copy.es';

const ICONS = [FlagDO, Headset, LockKeyhole, FileCheck2] as const;

export function TrustStrip() {
  return (
    <section className="mkt-trust" aria-label="Hechos del producto">
      <div className="mkt-wrap">
        <ul className="mkt-trust-list">
          {copy.trust.map((item, index) => {
            const Icon = ICONS[index] ?? FileCheck2;
            return (
              <li key={item.title} data-reveal style={{ ['--reveal-i' as string]: index }}>
                <span className="mkt-trust-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span className="mkt-trust-text">
                  <strong>{item.title}</strong>
                  {'detail' in item && (
                    <>
                      <span className="sr-only"> · </span>
                      <span className="mkt-trust-detail">{item.detail}</span>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
