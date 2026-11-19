// A stand-in for the MijnOverheid frame, only far enough to read the content in context: the
// band that says so, the header, the side menu with Wonen active, and the footer. Everything
// except Wonen is inert text. Not part of the delivery; content never imports from here.
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router';

import { LinkNaar } from '../components/LinkNaar';
import { BuildLine } from './BuildLine';
import { ScenarioSwitch } from './ScenarioSwitch';
import styles from './StandInFrame.module.scss';

const MENU = [
  'Home',
  'Berichtenbox',
  'Lopende zaken',
  'Identiteit',
  'Financiën',
  'Werk',
  'Gezondheid',
  'Wonen',
  'Vervoer',
  'Onderwijs',
  'Instellingen',
];

// Mock content for the stand-in (owner, plan Task 22): a fictional citizen, and footer columns
// shaped like MijnOverheid's. All inert text.
const NAAM_BURGER = 'J. de Vries';
const VOETTEKST_KOLOMMEN = [
  { kop: 'Over MijnOverheid', items: ['Wat is MijnOverheid', 'Aangesloten organisaties'] },
  { kop: 'Hulp en contact', items: ['Veelgestelde vragen', 'Contact'] },
  { kop: 'Privacy en veiligheid', items: ['Privacy', 'Cookies', 'Veilig internetten'] },
  { kop: 'Over deze website', items: ['Toegankelijkheid', 'Kwetsbaarheid melden'] },
];

// The scenario switch is hidden while the pages are built on one fixed path (plan Task 21).
// Set this to true to show it again; the walkthroughs set the scenario themselves.
export const TOON_SCENARIO_KEUZE = false;

type Props = { scenario: string; scenarioKeuze?: boolean; children: ReactNode };

export function StandInFrame({ scenario, scenarioKeuze = TOON_SCENARIO_KEUZE, children }: Props) {
  const [zoek] = useSearchParams();
  if (zoek.get('kader') === 'uit') return <>{children}</>;

  return (
    <div className={styles.kader}>
      <aside aria-label="Testomgeving" className={styles.band}>
        <p className={styles.bandTekst}>
          Nagebootst MijnOverheid-kader. Geen onderdeel van de oplevering.
        </p>
        {scenarioKeuze && <ScenarioSwitch scenario={scenario} />}
        <BuildLine />
      </aside>
      <header className={styles.kop}>
        <img src="/rijksoverheid-logo.png" alt="Rijksoverheid" className={styles.logo} />
        <span className={styles.merk}>MijnOverheid</span>
        <span className={styles.kopRechts}>
          <span>English</span>
          <span>{NAAM_BURGER}</span>
          <span>Uitloggen</span>
        </span>
      </header>
      <div className={styles.midden}>
        <nav aria-label="Menu MijnOverheid" className={styles.menu}>
          <ul>
            {MENU.map((item) => (
              <li key={item}>
                {item === 'Wonen' ? (
                  <LinkNaar naar="/nl/wonen" aria-current="page">
                    Wonen
                  </LinkNaar>
                ) : (
                  <span className={styles.inert}>
                    {item}
                    {item === 'Berichtenbox' && <span className={styles.badge}>3</span>}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.inhoud}>{children}</div>
      </div>
      <footer className={styles.voet}>
        {VOETTEKST_KOLOMMEN.map(({ kop, items }) => (
          <div key={kop} className={styles.voetKolom}>
            <p className={styles.voetKop}>{kop}</p>
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
    </div>
  );
}
