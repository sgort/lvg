// A white card with a light shadow. With a title it is a named region with a heading.
import type { ReactNode } from 'react';
import { useId } from 'react';

import styles from './ContentCard.module.scss';

type Props = { titel?: string; kopniveau?: 2 | 3; children: ReactNode };

export function ContentCard({ titel, kopniveau = 2, children }: Props) {
  const kopId = useId();
  const Kop = kopniveau === 2 ? 'h2' : 'h3';
  return (
    <section className={styles.kaart} aria-labelledby={titel ? kopId : undefined}>
      {titel && (
        <Kop id={kopId} className={`utrecht-heading-${kopniveau} ${styles.kop}`}>
          {titel}
        </Kop>
      )}
      {children}
    </section>
  );
}
