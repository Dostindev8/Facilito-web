import Link from 'next/link';
import { ShowcaseTabs } from './showcase-tabs';
import { SectionHeading } from '@/components/ui/section-heading';
import { copy } from '@/content/copy.es';
import { showcaseTabs } from '@/content/showcase';
import { site } from '@/lib/site';

/** "Facilito por dentro": server-rendered section; only the tab switching runs on the client. */
export function ProductShowcase() {
  const tabs = showcaseTabs();
  const text = copy.showcase;
  return (
    <section className="mkt-section mkt-show mkt-anchor" id={text.id} data-nav-section="/features" aria-labelledby="por-dentro-title">
      <div className="mkt-wrap">
        <SectionHeading id="por-dentro-title" index={2} eyebrow={text.eyebrow} title={text.title} emphasis={text.emphasis} lead={text.lead} />
        {tabs.length > 0 ? (
          <ShowcaseTabs
            tabs={tabs}
            labels={{
              tabs: text.tabsLabel,
              captionCapture: text.captionCapture,
              captionIllustration: text.captionIllustration,
              details: text.detailsLabel,
              imageError: text.imageError,
              pauseTour: text.pauseTour,
              playTour: text.playTour,
            }}
          />
        ) : (
          <p className="mkt-show-empty">{text.empty}</p>
        )}
        <div className="mkt-show-cta" data-reveal>
          <Link className="btn btn-primary" href={site.startPath}>
            {text.cta}
          </Link>
          <span>{text.ctaNote}</span>
        </div>
      </div>
    </section>
  );
}
