// The blue "i" at the end of a row: a button that shows a short explanation. Button and
// explanation are siblings, so inside a data list the explanation can span the whole value.
import { useId, useState } from 'react';

import { InfoVierkant } from './icons';
import styles from './InfoToggle.module.scss';

type Props = { label: string; tekst: string };

export function InfoToggle({ label, tekst }: Props) {
  const [open, setOpen] = useState(false);
  const paneelId = useId();
  return (
    <>
      <button
        type="button"
        className={styles.knop}
        aria-expanded={open}
        aria-controls={paneelId}
        aria-label={label}
        onClick={() => setOpen((huidig) => !huidig)}
      >
        <InfoVierkant />
      </button>
      <span id={paneelId} hidden={!open} className={styles.uitleg}>
        <InfoVierkant className={styles.uitlegIcoon} />
        <span>{tekst}</span>
      </span>
    </>
  );
}
