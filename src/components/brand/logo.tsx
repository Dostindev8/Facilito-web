import Image from 'next/image';

const MARK_SRC = '/brand/facilito-mark.png';

export function LogoMark({ size = 40, priority = false, alt = '' }: { size?: number; priority?: boolean; alt?: string }) {
  return <Image src={MARK_SRC} alt={alt} width={size} height={size} priority={priority} className="logo-mark" />;
}

interface LogoProps {
  /** full: mark + wordmark. icon: mark only. */
  variant?: 'full' | 'icon';
  /** brand: green wordmark for light backgrounds. light: white wordmark for dark backgrounds. */
  tone?: 'brand' | 'light';
  size?: number;
  byline?: boolean;
  priority?: boolean;
  className?: string;
}

export function Logo({ variant = 'full', tone = 'brand', size = 40, byline = false, priority = false, className }: LogoProps) {
  if (variant === 'icon') return <LogoMark size={size} priority={priority} alt="Facilito" />;
  return (
    <span
      className={['logo', className].filter(Boolean).join(' ')}
      data-tone={tone}
      role="img"
      aria-label="Facilito"
      style={{ ['--logo-size' as string]: `${Math.round(size * 0.6)}px` }}
    >
      <LogoMark size={size} priority={priority} />
      <span className="logo-text" aria-hidden="true">
        <span className="logo-word">Facilito</span>
        {byline && <span className="logo-byline">by Logic Code Spot</span>}
      </span>
    </span>
  );
}
