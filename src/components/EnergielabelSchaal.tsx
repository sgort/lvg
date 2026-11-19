// The energy label scale: seven blocks, A to G, the active one larger with the label's name.
// The blocks are decoration; the visually hidden text says which label it is.
import styles from './EnergielabelSchaal.module.scss';

type Klasse = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
const KLASSEN: Klasse[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

type Props = { tekst: string; label: { klasse: Klasse; naam: string } };

export function EnergielabelSchaal({ tekst, label }: Props) {
  return (
    <div className={styles.schaal}>
      <div aria-hidden="true" className={styles.blokken}>
        {KLASSEN.map((klasse) => {
          const actief = klasse === label.klasse;
          return (
            <span
              key={klasse}
              className={[styles.blok, styles[`klasse${klasse}`], actief && styles.actief]
                .filter(Boolean)
                .join(' ')}
            >
              {actief ? label.naam : ''}
            </span>
          );
        })}
      </div>
      <span className={styles.tekst}>{`${tekst} ${label.naam}`}</span>
    </div>
  );
}
