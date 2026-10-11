import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { SectionHeading } from '@/components/ui/section-heading';
import { copy } from '@/content/copy.es';
import { pricingFaqs } from '@/content/pricing';

/** Already-published answers that hold for the product as it is today; pricing-only ones stay on /precios. */
const HOME_QUESTIONS = new Set<string>([
  '¿Necesito tarjeta para crear la cuenta?',
  '¿Facilito ya envía comprobantes electrónicos a la DGII?',
  '¿Dónde quedan mis datos?',
  '¿Puedo entrar con Google?',
]);

export function HomeFaq() {
  const faqs = pricingFaqs.filter((faq) => HOME_QUESTIONS.has(faq.question));
  return (
    <section className="mkt-section mkt-anchor" id="preguntas" aria-labelledby="preguntas-title">
      <div className="mkt-wrap mkt-faq-home">
        <SectionHeading
          id="preguntas-title"
          index={3}
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
