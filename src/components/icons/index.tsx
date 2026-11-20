// Local SVG icons. Decorative only: hidden from screen readers, the text next to them carries
// the meaning.
import type { ReactElement } from 'react';

type IconProps = { className?: string };

const Svg = ({ className, children }: IconProps & { children: ReactElement }) => (
  <svg
    className={className}
    aria-hidden="true"
    focusable="false"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const ChevronRechts = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const ChevronLinks = (props: IconProps) => (
  <Svg {...props}>
    <path d="m15 6-6 6 6 6" />
  </Svg>
);

export const Info = (props: IconProps) => (
  <Svg {...props}>
    <g>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 11v6M12 7h.01" />
    </g>
  </Svg>
);

/** The design's info button: an "i" in a square. */
export const InfoVierkant = (props: IconProps) => (
  <Svg {...props}>
    <g>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 11v6M12 7h.01" />
    </g>
  </Svg>
);

export const Download = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />
  </Svg>
);

export const Extern = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Svg>
);
