// A section inside a card: a bold subheading and its content, or the short line that its
// source is not available now (the API reports each section with its own status).
import { LuxParagraph } from '@lux-design-system/components-react';
import { type ReactNode, useId } from 'react';

import styles from './Sectie.module.scss';

type Props = {
  kop: string;
  niveau?: 2 | 3;
  nietBeschikbaar?: string;
  children?: ReactNode;
};

export function Sectie({ kop, niveau = 2, nietBeschikbaar, children }: Props) {
  const id = useId();
  const Kop = niveau === 2 ? 'h2' : 'h3';
  return (
    <section aria-labelledby={id} className={styles.sectie}>
      <Kop id={id} className={styles.kop}>
        {kop}
      </Kop>
      {nietBeschikbaar ? <LuxParagraph>{nietBeschikbaar}</LuxParagraph> : children}
    </section>
  );
}
