// A stand-in for the MijnOverheid frame, after the delivered design ("koopwoningen - desktop"):
// the band that says it is a stand-in, the header with the hanging logo, the side menu with
// Wonen active, and the footer. Everything except Wonen is inert text. Not part of the
// delivery; content never imports from here.
import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router';

import { LinkNaar } from '../components/LinkNaar';
import { BuildLine } from './BuildLine';
import { Extern, KaderIconen, Persoon, Pijl, Uitloggen } from './kaderIconen';
import { ScenarioSwitch } from './ScenarioSwitch';
import styles from './StandInFrame.module.scss';

// The side menu in its groups, as in the design.
const MENU = [
  ['Home', 'Berichtenbox'],
  ['Lopende zaken'],
  ['Identiteit', 'Financiën', 'Werk', 'Gezondheid', 'Wonen', 'Vervoer', 'Onderwijs'],
  ['Instellingen'],
];

// Mock content for the stand-in, from the delivered design. All inert text.
const NAAM_BURGER = 'R. Janssen';
const VOETTEKST_KOLOMMEN: { kop: string; items: { tekst: string; extern?: boolean }[] }[] = [
  {
    kop: 'Over deze site',
    items: [
      { tekst: 'Wat is MijnOverheid' },
      { tekst: 'Toegankelijkheid' },
      { tekst: 'Sitemap' },
      { tekst: 'English' },
    ],
  },
  {
    kop: 'Gegevensverwerking',
    items: [
      { tekst: 'Veiligheid' },
      { tekst: 'Privacyverklaring' },
      { tekst: 'Wet- en regelgeving' },
    ],
  },
  {
    kop: 'Service',
    items: [
      { tekst: 'Mededelingen' },
      { tekst: 'Herken oplichting' },
      { tekst: 'Veelgestelde vragen' },
      { tekst: 'Contact' },
      { tekst: 'Klachtafhandeling' },
    ],
  },
  {
    kop: 'Partners',
    items: [
      { tekst: 'Aangesloten organisaties' },
      { tekst: 'Overheid.nl', extern: true },
      { tekst: 'Rijksoverheid.nl', extern: true },
      { tekst: 'Meldpunt Fouten in Overheidsregistraties', extern: true },
    ],
  },
];

// The scenario switch in the band. Set this to false to hide it; the walkthroughs set the
// scenario themselves.
export const TOON_SCENARIO_KEUZE = true;

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
        <div className={styles.kopInhoud}>
          <img src="/rijksoverheid-logo.png" alt="Rijksoverheid" className={styles.logo} />
          <span className={styles.merk}>MijnOverheid</span>
          <span className={styles.gebruiker}>
            <span className={styles.naam}>
              <Persoon />
              {NAAM_BURGER}
            </span>
            <span className={styles.uitloggen}>
              <Uitloggen />
              Uitloggen
            </span>
          </span>
        </div>
      </header>

      <div className={styles.midden}>
        <nav aria-label="Menu MijnOverheid" className={styles.menu}>
          {MENU.map((groep) => (
            <ul key={groep[0]} className={styles.menuGroep}>
              {groep.map((item) => {
                const Icoon = KaderIconen[item];
                const icoon = Icoon ? <Icoon className={styles.menuIcoon} /> : null;
                return (
                  <li key={item}>
                    {item === 'Wonen' ? (
                      <LinkNaar
                        naar="/nl/wonen"
                        aria-current="page"
                        className={styles.actief}
                        icon={icoon ?? undefined}
                        iconPosition="start"
                      >
                        Wonen
                      </LinkNaar>
                    ) : (
                      <span className={styles.menuItem}>
                        {icoon}
                        {item}
                        {item === 'Berichtenbox' && <span className={styles.badge}>1</span>}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
        </nav>
        <div className={styles.inhoud}>{children}</div>
      </div>

      <footer className={styles.voet}>
        <div className={styles.voetInhoud}>
          {VOETTEKST_KOLOMMEN.map(({ kop, items }) => (
            <div key={kop} className={styles.voetKolom}>
              <p className={styles.voetKop}>{kop}</p>
              <ul>
                {items.map(({ tekst, extern }) => (
                  <li key={tekst}>
                    {extern ? <Extern /> : <Pijl />}
                    <span>{tekst}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
