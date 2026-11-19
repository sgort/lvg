// The blue "i" next to a value: a button that shows a short explanation.
import { useId, useState } from 'react';

import { Info } from './icons';
import styles from './InfoToggle.module.scss';

type Props = { label: string; tekst: string };

export function InfoToggle({ label, tekst }: Props) {
  const [open, setOpen] = useState(false);
  const paneelId = useId();
  return (
    <span className={styles.toggle}>
      <button
        type="button"
        className={styles.knop}
        aria-expanded={open}
        aria-controls={paneelId}
        aria-label={label}
        onClick={() => setOpen((huidig) => !huidig)}
      >
        <Info />
      </button>
      <span id={paneelId} hidden={!open} className={styles.uitleg}>
        {tekst}
      </span>
    </span>
  );
}
