// Koopwoningen: the citizen's properties as a list, or the message that there are none. When
// the API answers `direct`, the loader redirects to the only property, so the list never
// enters the history and Back does not loop.
import { LuxParagraph } from '@lux-design-system/components-react';
import { redirect, useLoaderData } from 'react-router';

import { bestemmingVoorLink, routeVoorActie } from '../api/acties';
import type { WoningenOverzicht } from '../api/schemas';
import { haalWoningen } from '../api/wonen';
import { ContentCard } from '../components/ContentCard';
import { FaqCard } from '../components/FaqCard';
import { ChevronRechts } from '../components/icons';
import { Koppeling } from '../components/Koppeling';
import { PageTitle } from '../components/PageTitle';
import { WoningLijst } from '../features/koopwoningen/WoningLijst';
import { HOME, KRUIMELPAD_LABEL, WONEN, WONEN_PAD, woningPad } from './paginaKader';

export async function koopwoningenLoader(
  haal: () => Promise<WoningenOverzicht> = haalWoningen
): Promise<WoningenOverzicht | Response> {
  const overzicht = await haal();
  const enige = overzicht.woningen[0];
  if (overzicht.weergave === 'direct' && enige) return redirect(woningPad(enige.id));
  return overzicht;
}

export function KoopwoningenPage() {
  const { weergave, woningen, acties, veelgesteldeVragen } = useLoaderData<WoningenOverzicht>();
  const knoppen = acties.flatMap((actie) => {
    const doel = routeVoorActie(actie);
    return doel ? [{ type: actie.type, tekst: actie.tekst ?? actie.type, doel }] : [];
  });

  return (
    <>
      <PageTitle
        titel="Koopwoningen"
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: [HOME, WONEN, { tekst: 'Koopwoningen' }] }}
        terug={{ tekst: 'Wonen', naar: WONEN_PAD }}
      />
      <ContentCard>
        {weergave === 'leeg' ? (
          <LuxParagraph>U heeft geen koopwoning op uw naam staan.</LuxParagraph>
        ) : (
          <>
            <LuxParagraph>
              Hier ziet u de woningen die op uw naam staan in de Basisregistratie Kadaster. Kies een
              woning om de gegevens te bekijken.
            </LuxParagraph>
            <WoningLijst
              kop="Uw gebouwen:"
              labelTekst="Energielabel"
              woningen={woningen.map((woning) => ({
                id: woning.id,
                naar: woningPad(woning.id),
                adres: woning.adresMetPlaats,
                omschrijving: `${woning.soort}, ${woning.bouwjaar}`,
                label: woning.energielabel,
              }))}
            />
          </>
        )}
        {knoppen.map((knop) => (
          <LuxParagraph key={knop.type}>
            <Koppeling doel={knop.doel} icon={<ChevronRechts />}>
              {knop.tekst}
            </Koppeling>
          </LuxParagraph>
        ))}
      </ContentCard>
      {veelgesteldeVragen && (
        <FaqCard
          titel="Veelgestelde vragen"
          vragen={veelgesteldeVragen.vragen}
          meer={
            veelgesteldeVragen.meer && {
              tekst: veelgesteldeVragen.meer.tekst,
              doel: bestemmingVoorLink(veelgesteldeVragen.meer),
            }
          }
        />
      )}
    </>
  );
}
