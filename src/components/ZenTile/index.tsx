import type {ReactNode} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

/** The app-icon tile; its mark turns Z → E → N, the brand's one motion for moments like this. */
export default function ZenTile({className}: {className?: string}): ReactNode {
  return (
    <svg className={clsx(styles.zenTile, className)} viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id="zen-tile-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#079A0A" />
          <stop offset="0.55" stopColor="#058C07" />
          <stop offset="1" stopColor="#003D00" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#zen-tile-bg)" />
      <g className={styles.zenTileMark}>
        <g transform="translate(106 106) scale(3)" fill="#fff" stroke="#fff" strokeWidth="16" strokeLinejoin="round">
          <polygon points="8,8 18.7,8 8,18.7" />
          <polygon points="67.3,8 92,8 92,34.7 34.7,92 8,92 8,67.3" />
          <polygon points="92,81.3 92,92 81.3,92" />
        </g>
        <circle cx="256" cy="256" r="22" fill="#079A0A" />
      </g>
    </svg>
  );
}
