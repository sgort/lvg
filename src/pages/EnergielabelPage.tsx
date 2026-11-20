// Energielabel: the label with its documents and dates, the ISDE information, the Verduurzamen
// card when the API offers the roof insulation advice, the contact and the FAQ.
import { LuxParagraph } from '@lux-design-system/components-react';
import { useLoaderData } from 'react-router';

import { routeVoorActie } from '../api/acties';
import type { Energielabel } from '../api/schemas';
import { ContentCard } from '../components/ContentCard';
import { DataList } from '../components/DataList';
import { EnergielabelSchaal } from '../components/EnergielabelSchaal';
import { InfoToggle } from '../components/InfoToggle';
import { Koppeling } from '../components/Koppeling';
import { Melding } from '../components/Melding';
import { PageTitle } from '../components/PageTitle';
import { Sectie } from '../features/woning/Sectie';
import { formatDatum } from '../lib/format';
import { KRUIMELPAD_LABEL, kruimelsWoning, woningPad } from './paginaKader';
import { ApiLink, Contactkaart, Vragenkaart } from './paginaOnderdelen';

const TITEL = 'Energielabel';

const ISDE_INFO =
  'In dit overzicht ziet u voor welke verduurzamingsmaatregelen in uw woning in het verleden de Investeringssubsidie duurzame energie en energiebesparing (ISDE) is verleend. Het gaat om afgeronde subsidieaanvragen. Deze informatie is alleen bedoeld om u te informeren. U kunt de gegevens niet aanpassen.';

export function EnergielabelPage() {
  const data = useLoaderData<Energielabel>();
  const { woning, label, objectAanduiding: object } = data;
  const advies = data.acties
    .filter((actie) => actie.type === 'bekijk-dakisolatie')
    .map((actie) => routeVoorActie(actie, { woningId: woning.id }))
    .find((doel) => doel !== null);

  return (
    <>
      <PageTitle
        titel={TITEL}
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: kruimelsWoning(woning, 'Energielabel') }}
        terug={{ tekst: woning.adresKort, naar: woningPad(woning.id) }}
      />
      <ContentCard titel={woning.adres}>
        <Sectie kop={`Energielabel van uw ${object}`} niveau={3}>
          <EnergielabelSchaal tekst="Energielabel" label={label} />
          <LuxParagraph>{`Uw ${object} heeft energielabel ${label.naam}`}</LuxParagraph>
          {data.labelDocument && (
            <LuxParagraph>
              <ApiLink link={data.labelDocument} download />
            </LuxParagraph>
          )}
        </Sectie>
        <Sectie kop={`Opnamegegevens van uw ${object}`} niveau={3}>
          <LuxParagraph>{`(Op basis van deze gegevens is het energielabel van uw ${object} bepaald)`}</LuxParagraph>
          {data.opnamegegevens && (
            <LuxParagraph>
              <ApiLink link={data.opnamegegevens} download />
            </LuxParagraph>
          )}
          <DataList
            items={[
              { label: 'Registratiedatum', waarde: formatDatum(data.registratiedatum) },
              { label: 'Opnamedatum', waarde: formatDatum(data.opnamedatum) },
              { label: 'Geldig tot', waarde: formatDatum(data.geldigTot) },
              ...(data.isde
                ? [
                    {
                      label: 'ISDE-gegevens',
                      waarde: <ApiLink link={data.isde.link} />,
                      info: data.isde.uitleg && (
                        <InfoToggle label="Uitleg over ISDE-gegevens" tekst={data.isde.uitleg} />
                      ),
                    },
                  ]
                : []),
            ]}
          />
          <Melding type="info">
            <LuxParagraph>{ISDE_INFO}</LuxParagraph>
          </Melding>
        </Sectie>
      </ContentCard>
      {advies && (
        <ContentCard titel="Uw woning verduurzamen">
          <LuxParagraph>
            Wij hebben voor uw woning berekend wat betere dakisolatie kost en oplevert. U ziet ook
            welke subsidie mogelijk is.
          </LuxParagraph>
          <LuxParagraph>
            <Koppeling doel={advies} pijl>
              Bekijk advies dakisolatie
            </Koppeling>
          </LuxParagraph>
        </ContentCard>
      )}
      <Contactkaart contact={data.contact} />
      <Vragenkaart vragen={data.veelgesteldeVragen} />
    </>
  );
}
