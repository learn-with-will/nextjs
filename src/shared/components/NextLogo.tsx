/**
 * The Next.js mark — an "N" inside a circle — drawn in the current text colour
 * so it inherits the theme (black on light, white on dark, gradient where a
 * parent sets the colour). Monochrome, single-path stroke; no brand colours
 * baked in, matching Next.js's black-and-white identity.
 */
export function NextLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10.5" />
      <path d="M8.5 16.5V7.5l7 9V7.5" />
    </svg>
  );
}
