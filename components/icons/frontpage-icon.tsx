export function FrontpageIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Headline bar — full width */}
      <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sub-headline — medium */}
      <line x1="4" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Body — short */}
      <line x1="4" y1="18" x2="11" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
