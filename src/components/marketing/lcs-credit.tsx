import Image from 'next/image';

const LCS_URL = 'https://logic-codespot-com.vercel.app/';
/** Set by next.config.ts at build time when public/brand/logic-code-spot.png exists. */
const HAS_LOGO = process.env.NEXT_PUBLIC_LCS_LOGO === '1';

export function LcsCredit() {
  return (
    <a
      className="mkt-credit"
      href={LCS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Logic Code Spot, creadores de Facilito (se abre en otra pestaña)"
    >
      <span className="mkt-credit-label">Creado por</span>
      {HAS_LOGO && (
        <Image src="/brand/logic-code-spot.png" alt="" width={24} height={24} className="mkt-credit-logo" />
      )}
      <span className="mkt-credit-name">Logic Code Spot</span>
    </a>
  );
}
