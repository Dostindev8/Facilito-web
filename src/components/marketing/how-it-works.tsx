import { MiniAccount, MiniCheckout, MiniReport, MiniSetup } from './mini-views';
import { SectionHeading } from '@/components/ui/section-heading';
import { copy } from '@/content/copy.es';

const VIEWS = [MiniAccount, MiniSetup, MiniCheckout, MiniReport] as const;

export function HowItWorks() {
  return (
    <section
      className="mkt-section mkt-section-soft mkt-anchor"
      id={copy.how.id}
      data-nav-section={`/#${copy.how.id}`}
      aria-labelledby="como"
    >
      <div className="mkt-wrap">
        <SectionHeading
          id="como"
          index={2}
          eyebrow={copy.how.eyebrow}
          title={copy.how.title}
          emphasis={copy.how.emphasis}
          lead={copy.how.lead}
        />
        {/* The list reveals as one block: the connector line draws, then the steps follow in order. */}
        <ol className="mkt-steps" data-reveal>
          {copy.how.steps.map((step, index) => {
            const View = VIEWS[index] ?? MiniAccount;
            return (
              <li key={step.n} className="mkt-step" style={{ ['--step-i' as string]: index }}>
                <span className="mkt-step-n" aria-hidden="true">
                  {step.n}
                </span>
                <div className="mkt-step-card">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  <View />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
