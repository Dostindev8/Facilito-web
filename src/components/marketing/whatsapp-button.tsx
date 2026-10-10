import { MessageCircle } from 'lucide-react';
import { site, whatsappHref, WHATSAPP_DEMO_TEXT } from '@/lib/site';

export function WhatsAppButton() {
  const href = whatsappHref(WHATSAPP_DEMO_TEXT);
  if (!href) return null;
  return (
    <a className="mkt-wa" href={href} target="_blank" rel="noopener noreferrer">
      <MessageCircle size={20} aria-hidden />
      WhatsApp
    </a>
  );
}

export function RegisterCta({ children }: { children: string }) {
  return (
    <a className="btn btn-outline btn-sm" href={site.registerPath}>
      {children}
    </a>
  );
}
