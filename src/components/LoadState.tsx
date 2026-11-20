// The loading state of a card: says so in text, and marks itself busy.
import styles from './LoadState.module.scss';

export function LoadState({ tekst }: { tekst: string }) {
  return (
    <div role="status" aria-busy="true" className={styles.laden}>
      {tekst}
    </div>
  );
}
