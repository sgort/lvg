// The top of every page: breadcrumb (desktop) or back link (mobile), and the H1. Sets the
// document title and moves focus to the H1, so a screen reader announces the new page.
// The H1 is a native element with LUX's heading class: LuxHeading does not forward the ref
// that focusing needs.
import { useEffect, useRef } from 'react';

import { Breadcrumb, type Kruimel } from './Breadcrumb';
import { ChevronLinks } from './icons';
import { LinkNaar } from './LinkNaar';
import styles from './PageTitle.module.scss';

type Props = {
  titel: string;
  kruimelpad: { label: string; items: Kruimel[] };
  terug: { tekst: string; naar: string };
};

export function PageTitle({ titel, kruimelpad, terug }: Props) {
  const kop = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = `${titel} - MijnOverheid`;
    kop.current?.focus();
  }, [titel]);

  return (
    <header className={styles.titel}>
      <Breadcrumb label={kruimelpad.label} items={kruimelpad.items} className={styles.desktop} />
      <LinkNaar
        naar={terug.naar}
        className={styles.mobiel}
        icon={<ChevronLinks />}
        iconPosition="start"
      >
        {terug.tekst}
      </LinkNaar>
      <h1 ref={kop} tabIndex={-1} className={`utrecht-heading-1 ${styles.kop}`}>
        {titel}
      </h1>
    </header>
  );
}
