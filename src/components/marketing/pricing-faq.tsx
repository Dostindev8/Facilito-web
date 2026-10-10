import { pricingFaqs } from '@/content/pricing';

export function PricingFaq() {
  return (
    <dl className="mkt-faq">
      {pricingFaqs.map((faq) => (
        <div key={faq.question} data-reveal>
          <dt>{faq.question}</dt>
          <dd>{faq.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
