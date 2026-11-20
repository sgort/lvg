// A data table with a caption, column headers and a header cell per row.
import type { ReactNode } from 'react';

import styles from './Tabel.module.scss';

type Rij = { sleutel: string; kop: ReactNode; cellen: ReactNode[] };
type Props = { caption: string; kolommen: string[]; rijen: Rij[] };

export function Tabel({ caption, kolommen, rijen }: Props) {
  return (
    <div className={styles.omhulsel}>
      <table className={styles.tabel}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            {kolommen.map((kolom) => (
              <th key={kolom} scope="col">
                {kolom}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rijen.map((rij) => (
            <tr key={rij.sleutel}>
              <th scope="row">{rij.kop}</th>
              {rij.cellen.map((cel, index) => (
                <td key={index}>{cel}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
