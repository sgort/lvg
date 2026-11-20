// WOZ-gegevens: every WOZ field with the explanation behind its info button, the report, the
// municipality as contact, and the FAQ.
import { useLoaderData } from 'react-router';

import type { Woz } from '../api/schemas';
import { ContentCard } from '../components/ContentCard';
import { type DataItem, DataList } from '../components/DataList';
import { InfoToggle } from '../components/InfoToggle';
import { PageTitle } from '../components/PageTitle';
import { Sectie } from '../features/woning/Sectie';
import { formatDatum, formatEuro } from '../lib/format';
import { KRUIMELPAD_LABEL, kruimelsWoning, woningPad } from './paginaKader';
import { ApiLink, Contactkaart, Vragenkaart, vierkanteMeters } from './paginaOnderdelen';

const TITEL = 'WOZ-gegevens';

const rij = (label: string, waarde: DataItem['waarde'], uitleg?: string): DataItem => ({
  label,
  waarde,
  info: uitleg ? <InfoToggle label={`Uitleg over ${label}`} tekst={uitleg} /> : undefined,
});

export function WozPage() {
  const { woning, gegevens, contact, veelgesteldeVragen } = useLoaderData<Woz>();

  const items: DataItem[] = [
    rij('WOZ-waarde', formatEuro(gegevens.waarde.bedragEur), gegevens.waarde.uitleg),
    rij(
      'Waardepeildatum',
      formatDatum(gegevens.waardepeildatum.datum),
      gegevens.waardepeildatum.uitleg
    ),
    ...(gegevens.grondoppervlakteM2
      ? [
          rij(
            'Grondoppervlakte',
            vierkanteMeters(gegevens.grondoppervlakteM2.waarde),
            gegevens.grondoppervlakteM2.uitleg
          ),
        ]
      : []),
    ...(gegevens.objectnummer
      ? [rij('WOZ-objectnummer', gegevens.objectnummer.tekst, gegevens.objectnummer.uitleg)]
      : []),
    ...(gegevens.objecttype
      ? [rij('WOZ-objecttype', gegevens.objecttype.tekst, gegevens.objecttype.uitleg)]
      : []),
    ...(gegevens.taxatieverslag
      ? [
          rij(
            'Taxatieverslag',
            <ApiLink link={gegevens.taxatieverslag.link} download />,
            gegevens.taxatieverslag.uitleg
          ),
        ]
      : []),
  ];

  return (
    <>
      <PageTitle
        titel={TITEL}
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: kruimelsWoning(woning, 'WOZ') }}
        terug={{ tekst: woning.adresKort, naar: woningPad(woning.id) }}
      />
      <ContentCard titel={woning.adres}>
        <Sectie kop="WOZ-gegevens" niveau={3}>
          <DataList items={items} />
        </Sectie>
      </ContentCard>
      <Contactkaart contact={contact} />
      <Vragenkaart vragen={veelgesteldeVragen} />
    </>
  );
}
