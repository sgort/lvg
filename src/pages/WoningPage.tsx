// The property summary: four sections, each with its own status from the API, and the FAQ.
import { useLoaderData } from 'react-router';

import type { Woning } from '../api/schemas';
import { ContentCard } from '../components/ContentCard';
import { DataList } from '../components/DataList';
import { EnergielabelSchaal } from '../components/EnergielabelSchaal';
import { InfoToggle } from '../components/InfoToggle';
import { PageTitle } from '../components/PageTitle';
import { Sectie } from '../features/woning/Sectie';
import { formatDatum, formatEuro } from '../lib/format';
import { KRUIMELPAD_LABEL, kruimelsWoning, terugVanWoning } from './paginaKader';
import { MeerLink, NIET_BESCHIKBAAR, Vragenkaart, vierkanteMeters } from './paginaOnderdelen';

const beschikbaar = (status: string) => (status === 'beschikbaar' ? undefined : NIET_BESCHIKBAAR);

export function WoningPage() {
  const { woning, bag, kadaster, woz, energielabel, veelgesteldeVragen } = useLoaderData<Woning>();

  return (
    <>
      <PageTitle
        titel={woning.adresKort}
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: kruimelsWoning(woning) }}
        terug={terugVanWoning(woning)}
      />
      <ContentCard>
        <Sectie
          kop="Basisregistratie Adressen en Gebouwen (BAG)"
          nietBeschikbaar={beschikbaar(bag.status)}
        >
          <DataList
            items={[
              { label: 'Adres', waarde: bag.adres },
              { label: 'Bouwjaar', waarde: bag.bouwjaar },
              { label: 'Gebruiksdoel', waarde: bag.gebruiksdoel },
              {
                label: 'Oppervlakte',
                waarde:
                  bag.oppervlakteM2 === undefined ? undefined : vierkanteMeters(bag.oppervlakteM2),
              },
              { label: 'Verblijfsobject', waarde: bag.verblijfsobject },
            ]}
          />
        </Sectie>
        <Sectie kop="Kadastrale gegevens" nietBeschikbaar={beschikbaar(kadaster.status)}>
          <DataList
            items={[
              { label: 'Kadastrale aanduiding', waarde: kadaster.aanduiding },
              {
                label: 'Kadastrale grootte',
                waarde:
                  kadaster.grootteM2 === undefined
                    ? undefined
                    : vierkanteMeters(kadaster.grootteM2),
              },
            ]}
          />
          <MeerLink
            actie={kadaster.actie}
            woningId={woning.id}
            tekst="Bekijk kadastrale gegevens"
          />
        </Sectie>
        <Sectie kop="WOZ-gegevens" nietBeschikbaar={beschikbaar(woz.status)}>
          <DataList
            items={[
              {
                label: 'WOZ-waarde',
                waarde: woz.waarde && formatEuro(woz.waarde.bedragEur),
                info: woz.waarde?.uitleg && (
                  <InfoToggle label="Uitleg over WOZ-waarde" tekst={woz.waarde.uitleg} />
                ),
              },
              {
                label: 'Waardepeildatum',
                waarde: woz.waardepeildatum && formatDatum(woz.waardepeildatum.datum),
                info: woz.waardepeildatum?.uitleg && (
                  <InfoToggle
                    label="Uitleg over waardepeildatum"
                    tekst={woz.waardepeildatum.uitleg}
                  />
                ),
              },
            ]}
          />
          <MeerLink actie={woz.actie} woningId={woning.id} tekst="Bekijk WOZ-gegevens" />
        </Sectie>
        <Sectie kop="Energielabel" nietBeschikbaar={beschikbaar(energielabel.status)}>
          <DataList
            items={[
              {
                label: 'Energielabel',
                waarde: energielabel.label && (
                  <EnergielabelSchaal tekst="Energielabel" label={energielabel.label} />
                ),
              },
              {
                label: 'Opnamedatum',
                waarde: energielabel.opnamedatum && formatDatum(energielabel.opnamedatum),
              },
            ]}
          />
          <MeerLink actie={energielabel.actie} woningId={woning.id} tekst="Bekijk energielabel" />
        </Sectie>
      </ContentCard>
      <Vragenkaart vragen={veelgesteldeVragen} />
    </>
  );
}
