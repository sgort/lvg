// The breadcrumb, shown from 768 px. The last step is the current page and is not a link.
import { ChevronRechts } from './icons';
import { LinkNaar } from './LinkNaar';
import styles from './Breadcrumb.module.scss';

export type Kruimel = { tekst: string; naar?: string };

type Props = { label: string; items: Kruimel[]; className?: string };

export function Breadcrumb({ label, items, className }: Props) {
  return (
    <nav aria-label={label} className={[styles.kruimelpad, className].filter(Boolean).join(' ')}>
      <ol className={styles.lijst}>
        {items.map((item, index) => {
          const laatste = index === items.length - 1;
          return (
            <li key={`${item.tekst}-${index}`} className={styles.stap}>
              {index > 0 && <ChevronRechts className={styles.scheiding} />}
              {item.naar && !laatste ? (
                <LinkNaar naar={item.naar}>{item.tekst}</LinkNaar>
              ) : (
                <span aria-current={laatste ? 'page' : undefined}>{item.tekst}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
