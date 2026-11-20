// The small energy label tile in a list row: the label's name on its colour. The tile is
// decoration; the visually hidden text names the label.
import styles from './LabelTegel.module.scss';

type Props = {
  tekst: string;
  label: { klasse: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'; naam: string };
};

export function LabelTegel({ tekst, label }: Props) {
  return (
    <span className={styles.tegel}>
      <span aria-hidden="true" className={`${styles.kleur} ${styles[`klasse${label.klasse}`]}`}>
        {label.naam}
      </span>
      <span className={styles.tekst}>{`${tekst} ${label.naam}`}</span>
    </span>
  );
}
