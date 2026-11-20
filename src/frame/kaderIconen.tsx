// Icons for the stand-in frame only, after the delivered design. Decorative: hidden from screen
// readers, the text next to each carries the meaning.
import type { ReactElement } from 'react';

type Props = { className?: string };

const Icoon = ({ className, children }: Props & { children: ReactElement }) => (
  <svg
    className={className}
    aria-hidden="true"
    focusable="false"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    {children}
  </svg>
);

export const KaderIconen: Record<string, (props: Props) => ReactElement> = {
  Home: (p) => (
    <Icoon {...p}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    </Icoon>
  ),
  Berichtenbox: (p) => (
    <Icoon {...p}>
      <path d="M3 5h18v14H3V5Zm2 2.4V17h14V7.4l-7 5.1-7-5.1ZM6.6 7l5.4 4 5.4-4H6.6Z" />
    </Icoon>
  ),
  'Lopende zaken': (p) => (
    <Icoon {...p}>
      <path d="m12 2 10 5-10 5L2 7l10-5Zm-7.8 8.4L12 14.3l7.8-3.9L22 11.5l-10 5-10-5 2.2-1.1Zm0 4.5L12 18.8l7.8-3.9L22 16l-10 5-10-5 2.2-1.1Z" />
    </Icoon>
  ),
  Identiteit: (p) => (
    <Icoon {...p}>
      <path d="M10 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM3 20c0-4 3-6.5 7-6.5s7 2.5 7 6.5H3Zm15-9h4v2h-4v-2Zm0 4h4v2h-4v-2Z" />
    </Icoon>
  ),
  Financiën: (p) => (
    <Icoon {...p}>
      <path d="M15.5 4.5c1.4 0 2.6.4 3.6 1l-1 1.8a5 5 0 0 0-2.6-.8c-2 0-3.6 1.3-4.2 3.5H16v2h-5v1h5v2h-4.7c.6 2.2 2.2 3.5 4.2 3.5 1 0 1.9-.3 2.6-.8l1 1.8a7 7 0 0 1-3.6 1c-3.3 0-5.8-2.2-6.5-5.5H6v-2h2.6v-1H6v-2h3c.7-3.3 3.2-5.5 6.5-5.5Z" />
    </Icoon>
  ),
  Werk: (p) => (
    <Icoon {...p}>
      <path d="M9 4h6a1 1 0 0 1 1 1v2h5v5h-8v-1h-2v1H3V7h5V5a1 1 0 0 1 1-1Zm1 3h4V6h-4v1ZM3 13h8v2h2v-2h8v7H3v-7Z" />
    </Icoon>
  ),
  Gezondheid: (p) => (
    <Icoon {...p}>
      <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" />
    </Icoon>
  ),
  Wonen: (p) => (
    <Icoon {...p}>
      <path d="m12 3 9 8h-3v9h-4v-6h-4v6H6v-9H3l9-8Z" />
    </Icoon>
  ),
  Vervoer: (p) => (
    <Icoon {...p}>
      <path d="M6.5 5h11l2 6H21v6h-2v2h-3v-2H8v2H5v-2H3v-6h1.5l2-6Zm1.4 2-1.3 4h10.8l-1.3-4H7.9ZM6.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm11 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </Icoon>
  ),
  Onderwijs: (p) => (
    <Icoon {...p}>
      <path d="m12 4 11 5-11 5-8-3.6V15H2V9l10-5Zm-6 9.2 6 2.7 6-2.7V17c0 1.7-2.7 3-6 3s-6-1.3-6-3v-3.8Z" />
    </Icoon>
  ),
  Instellingen: (p) => (
    <Icoon {...p}>
      <path d="m10.3 2h3.4l.6 2.6 1.6.9 2.5-.9 1.7 3-2 1.7v1.4l2 1.7-1.7 3-2.5-.9-1.6.9-.6 2.6h-3.4l-.6-2.6-1.6-.9-2.5.9-1.7-3 2-1.7V9.3l-2-1.7 1.7-3 2.5.9 1.6-.9.6-2.6ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </Icoon>
  ),
};

export const Persoon = (p: Props) => (
  <Icoon {...p}>
    <path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7h-2c0-3.2-2.6-5-6-5s-6 1.8-6 5H4Z" />
  </Icoon>
);

export const Uitloggen = (p: Props) => (
  <Icoon {...p}>
    <path d="M4 4h8v2H6v12h6v2H4V4Zm11.6 3.6L20 12l-4.4 4.4-1.4-1.4 2-2H9v-2h7.2l-2-2 1.4-1.4Z" />
  </Icoon>
);

export const Pijl = (p: Props) => (
  <Icoon {...p}>
    <path d="m9.3 5.3 6.7 6.7-6.7 6.7-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z" />
  </Icoon>
);

export const Extern = (p: Props) => (
  <Icoon {...p}>
    <path d="M14 3h7v7h-2V6.4l-7.3 7.3-1.4-1.4L17.6 5H14V3ZM5 6h6v2H6v10h10v-5h2v7H4V6h1Z" />
  </Icoon>
);
