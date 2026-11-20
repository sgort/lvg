// The citizen's properties, one full-width link per property: the address on the first line,
// the label tile and the kind and year on the second, a chevron at the end. A plain router
// link with its own styling: LUX's link is made for inline text, not for a two-line row.
import { Link } from 'react-router';

import { ChevronRechts } from '../../components/icons';
import { LabelTegel } from '../../components/LabelTegel';
import styles from './WoningLijst.module.scss';

export type WoningRij = {
  id: string;
  naar: string;
  adres: string;
  omschrijving: string;
  label?: { klasse: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'; naam: string };
};

type Props = { kop: string; labelTekst: string; woningen: WoningRij[] };

export function WoningLijst({ kop, labelTekst, woningen }: Props) {
  return (
    <>
      <h2 id="uw-gebouwen" className={styles.kop}>
        {kop}
      </h2>
      <ul aria-labelledby="uw-gebouwen" className={styles.lijst}>
        {woningen.map((woning) => (
          <li key={woning.id}>
            <Link to={woning.naar} className={styles.rij}>
              <span className={styles.regels}>
                <span className={styles.adres}>{woning.adres}</span>
                <span className={styles.details}>
                  {woning.label && <LabelTegel tekst={labelTekst} label={woning.label} />}
                  <span>{woning.omschrijving}</span>
                </span>
              </span>
              <ChevronRechts className={styles.pijl} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
