// Page-layer helpers the property pages share: they resolve the API's actions and links into
// targets, and fill the shared cards with their copy. UI components stay free of both.
import { LuxParagraph } from '@lux-design-system/components-react';

import { bestemmingVoorLink, routeVoorActie } from '../api/acties';
import type { Actie, Contact, Link, VeelgesteldeVragen } from '../api/schemas';
import { ContactCard } from '../components/ContactCard';
import { FaqCard } from '../components/FaqCard';
import { Download } from '../components/icons';
import { Koppeling } from '../components/Koppeling';
import { formatGetal } from '../lib/format';
import styles from './paginaOnderdelen.module.scss';

export const NIET_BESCHIKBAAR = 'Deze gegevens zijn nu niet beschikbaar.';

export const vierkanteMeters = (waarde: number) => `${formatGetal(waarde)} m²`;

/** A bold "Bekijk … ›" link, shown only when the API offers the action. */
export function MeerLink({
  actie,
  woningId,
  tekst,
}: {
  actie?: Actie;
  woningId: string;
  tekst: string;
}) {
  const doel = actie ? routeVoorActie(actie, { woningId }) : null;
  if (!doel) return null;
  return (
    <LuxParagraph className={styles.meer}>
      <Koppeling doel={doel} pijl>
        {tekst}
      </Koppeling>
    </LuxParagraph>
  );
}

/** A link the API sends: external, a download, or a placeholder for "Nog niet beschikbaar". */
export function ApiLink({ link, download = false }: { link: Link; download?: boolean }) {
  return (
    <Koppeling doel={bestemmingVoorLink(link)} icon={download ? <Download /> : undefined}>
      {link.tekst}
    </Koppeling>
  );
}

export function Contactkaart({ contact }: { contact?: Contact }) {
  if (!contact) return null;
  return (
    <ContactCard
      titel="Contactinformatie"
      organisatie={contact.organisatie}
      website={
        contact.website && {
          tekst: contact.website.tekst,
          doel: bestemmingVoorLink(contact.website),
        }
      }
      email={contact.email}
    />
  );
}

export function Vragenkaart({ vragen }: { vragen?: VeelgesteldeVragen }) {
  if (!vragen) return null;
  return (
    <FaqCard
      titel="Veelgestelde vragen"
      vragen={vragen.vragen}
      meer={vragen.meer && { tekst: vragen.meer.tekst, doel: bestemmingVoorLink(vragen.meer) }}
    />
  );
}
