interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * The app's mark: a spreadsheet grid where one cell resolves to a check —
 * "work you can verify", which is what the whole product is about. Drawn as
 * an inline SVG so it stays crisp at every size and needs no network fetch.
 */
export function BrandMark({ size = 28, className = "" }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="Excel Academy"
    >
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#2E9E5B" />
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#brand-sheen)" />
      <path d="M9 10.5h14M9 16h14M9 21.5h14" stroke="#fff" strokeOpacity="0.32" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 6.5v19M21.5 6.5v19" stroke="#fff" strokeOpacity="0.32" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="16.6" y="16.2" width="10" height="10" rx="3" fill="#fff" />
      <path
        d="M19 21.2l1.7 1.7 3.3-3.6"
        stroke="#237E48"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="brand-sheen" x1="1" y1="1" x2="31" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
