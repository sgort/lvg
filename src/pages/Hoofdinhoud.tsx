// The content column every page renders in. The stand-in frame (Task 18) goes around it.
import { Outlet } from 'react-router';

import styles from './Hoofdinhoud.module.scss';

export function Hoofdinhoud() {
  return (
    <main className={styles.inhoud}>
      <Outlet />
    </main>
  );
}
