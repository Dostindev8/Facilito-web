import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { copy } from '@/content/copy.es';
import { pricingFaqs } from '@/content/pricing';

/** Same answers as /precios (single source); the rest stay there. */
const HOME_QUESTIONS = new Set<string>([
  '¿Cuánto cuesta Facilito?',
  '¿Cómo funciona el mes gratis?',
  '¿Cómo se paga?',
  '¿Facilito ya envía comprobantes electrónicos a la DGII?',
  '¿Dónde quedan mis datos?',
]);

export function HomeFaq() {
  const faqs = pricingFaqs.filter((faq) => HOME_QUESTIONS.has(faq.question));
  return (
    <section className="mkt-section mkt-anchor" id="preguntas" aria-labelledby="preguntas-title">
      <div className="mkt-wrap mkt-faq-home">
        <SectionHeading
          id="preguntas-title"
          index={4}
          eyebrow={copy.faq.eyebrow}
          title={copy.faq.title}
          emphasis={copy.faq.emphasis}
          lead={copy.faq.lead}
        >
          <p className="mkt-more">
            <Link href="/contacto">
              {copy.faq.more}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </p>
        </SectionHeading>
        <div className="mkt-accordion">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="mkt-acc" data-reveal style={{ ['--reveal-i' as string]: index }}>
              <summary>
                <span>{faq.question}</span>
                <ChevronDown size={20} aria-hidden className="mkt-acc-icon" />
              </summary>
              <div className="mkt-acc-body">
                <p>{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
