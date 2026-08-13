export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="GeoAnomaly Pro"
    >
      <circle cx="16" cy="16" r="13" stroke="var(--color-primary)" strokeWidth="1.2" />
      <ellipse
        cx="16"
        cy="16"
        rx="13"
        ry="5.5"
        stroke="var(--color-accent)"
        strokeWidth="0.9"
        opacity="0.75"
        transform="rotate(-28 16 16)"
      />
      <path
        d="M4 19c3-2.2 5.4 1.6 8.4-.4 3-2 4.8 2.4 7.8.6 2-1.2 3.6.4 5.6-.4"
        stroke="var(--color-geological)"
        strokeWidth="1"
        opacity="0.8"
        strokeLinecap="round"
      />
      <path d="M16 6.5v5M16 20.5v5M6.5 16h5M20.5 16h5" stroke="var(--color-accent)" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.6" stroke="var(--color-target)" strokeWidth="1.3" />
      <circle cx="16" cy="16" r="0.9" fill="var(--color-target)" />
    </svg>
  );
}
