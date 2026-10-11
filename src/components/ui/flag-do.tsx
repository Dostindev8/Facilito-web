/**
 * Dominican Republic flag. Decorative: the surrounding text always names the country.
 * `size` is accepted so it can sit in the same icon slots as lucide icons; the flag keeps its 3:2 box.
 */
export function FlagDO({ className }: { className?: string; size?: number }) {
  return (
    <svg
      className={className ? `ui-flag-do ${className}` : 'ui-flag-do'}
      viewBox="0 0 24 16"
      width="22"
      height="15"
      aria-hidden="true"
      focusable="false"
      data-flag="do"
    >
      <rect width="24" height="16" fill="#fff" />
      <rect width="10" height="6.5" fill="#002D62" />
      <rect x="14" width="10" height="6.5" fill="#CE1126" />
      <rect y="9.5" width="10" height="6.5" fill="#CE1126" />
      <rect x="14" y="9.5" width="10" height="6.5" fill="#002D62" />
    </svg>
  );
}
