// Label and value pairs: side by side on desktop, the label above the value on mobile. An info
// button sits at the end of its row.
import type { ReactNode } from 'react';

import styles from './DataList.module.scss';

export type DataItem = { label: string; waarde: ReactNode; info?: ReactNode };

export function DataList({ items }: { items: DataItem[] }) {
  return (
    <dl className={styles.lijst}>
      {items.map((item) => (
        <div key={item.label} className={styles.rij}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.waarde}>
            <span>{item.waarde}</span>
            {item.info}
          </dd>
        </div>
      ))}
    </dl>
  );
}
