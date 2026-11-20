// Label and value pairs: side by side on desktop, the label above the value on mobile. An info
// button sits at the end of its row. A row whose value the API did not send is left out.
import type { ReactNode } from 'react';

import styles from './DataList.module.scss';

export type DataItem = { label: string; waarde: ReactNode; info?: ReactNode };

export function DataList({ items }: { items: DataItem[] }) {
  return (
    <dl className={styles.lijst}>
      {items
        .filter((item) => item.waarde !== undefined && item.waarde !== null && item.waarde !== '')
        .map((item, index) => (
          <div key={`${index}-${item.label}`} className={styles.rij}>
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
