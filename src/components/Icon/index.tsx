import type {ReactNode} from 'react';

// 24px box, 2px stroke, round joins: the brand's system-glyph rules.
export const ICONS: Record<string, ReactNode> = {
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.6 2.5L16 9.5" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l1.4 2.9 3.1.4-2.3 2.2.6 3.1L12 14.6l-2.8 1.5.6-3.1-2.3-2.2 3.1-.4z" />
    </>
  ),
  mark: (
    <>
      <path d="M5 5h3L5 8z" />
      <path d="M14 5h5v5L10 19H5v-5z" />
      <path d="M19 16v3h-3z" />
    </>
  ),
  heart: <path d="M12 19.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10z" />,
  users: (
    <>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 6.2a3.2 3.2 0 0 1 0 5.6M17.5 14.4c1.6.7 2.7 2.3 3 4.6" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9.5V13l2.2 1.6M9.5 3h5" />
    </>
  ),
  sunrise: (
    <>
      <path d="M6.5 17a5.5 5.5 0 0 1 11 0" />
      <path d="M3 20h18M12 4v3M4.6 9.6l2 1.6M19.4 9.6l-2 1.6" />
    </>
  ),
};

export default function Icon({name, className, size = 16}: {name: string; className?: string; size?: number}): ReactNode {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      {ICONS[name] ?? ICONS.check}
    </svg>
  );
}
