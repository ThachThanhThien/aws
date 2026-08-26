/**
 * The course mark: the AWS "smile" — a swoosh that dips and sweeps up into an
 * arrowhead, the motif from the Amazon Web Services wordmark. Drawn monochrome
 * with `currentColor` so callers set the colour via a text utility (the navbar
 * and footer tint it `text-brand-500`, the AWS orange); that keeps the mark
 * legible in both light and dark themes. A custom mark is used because the
 * simple-icons AWS glyph is not bundled and remote assets are blocked at build
 * time — the shape follows AWS's own smile motif.
 */
export function AwsLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* The smile swoosh: dips through the middle, then sweeps up to the right. */}
      <path d="M2.6 12.4c3.9 5.1 11.4 6.3 16.9 0.7" />
      {/* Arrowhead at the right tip, pointing up and to the right. */}
      <path d="M15.7 15.4 19.5 13.1 19.9 17.4" />
    </svg>
  );
}
