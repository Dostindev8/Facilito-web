import Link from 'next/link';
import { ArrowRight, ClipboardList, Package, Receipt } from 'lucide-react';
import { MiniInvoice, MiniSale, MiniStock } from './mini-views';
import { SectionHeading } from '@/components/ui/section-heading';
import { copy } from '@/content/copy.es';

const ICONS = [Receipt, Package, ClipboardList] as const;
const VIEWS = [MiniSale, MiniStock, MiniInvoice] as const;

export function Pillars() {
  return (
    <section className="mkt-section mkt-after-hero" id="producto" data-nav-section="/features" aria-labelledby="pilares">
      <div className="mkt-wrap">
        <SectionHeading
          id="pilares"
          index={1}
          eyebrow={copy.pillarsIntro.eyebrow}
          title={copy.pillarsIntro.title}
          emphasis={copy.pillarsIntro.emphasis}
          lead={copy.pillarsIntro.lead}
        />
        <div className="mkt-bento">
          {copy.pillars.map((pillar, index) => {
            const Icon = ICONS[index] ?? Receipt;
            const View = VIEWS[index] ?? MiniSale;
            return (
              <article key={pillar.title} className="mkt-card mkt-bento-card" data-reveal style={{ ['--reveal-i' as string]: index }}>
                <div className="mkt-icon">
                  <Icon size={22} aria-hidden />
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
                <View />
              </article>
            );
          })}
        </div>
        <p className="mkt-more" data-reveal>
          <Link href="/features">
            {copy.pillarsIntro.link}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
