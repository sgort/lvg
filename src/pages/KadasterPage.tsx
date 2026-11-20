// Kadastrale gegevens: the map, the parcel data with the paid Kadaster products, the owner
// information, the photos, the contact and the FAQ.
import { LuxAccordionProvider, LuxParagraph } from '@lux-design-system/components-react';
import { useLoaderData } from 'react-router';

import { bestemmingVoorLink } from '../api/acties';
import type { Kadaster } from '../api/schemas';
import { ContentCard } from '../components/ContentCard';
import { DataList } from '../components/DataList';
import { Koppeling } from '../components/Koppeling';
import { PageTitle } from '../components/PageTitle';
import { Sectie } from '../features/woning/Sectie';
import { formatEuro } from '../lib/format';
import styles from './KadasterPage.module.scss';
import { KRUIMELPAD_LABEL, kruimelsWoning, woningPad } from './paginaKader';
import { ApiLink, Contactkaart, Vragenkaart, vierkanteMeters } from './paginaOnderdelen';

const TITEL = 'Kadastrale gegevens';

// The owner information ends with a link on the word the API names (its meerInformatie).
function MetLink({
  tekst,
  link,
}: {
  tekst: string;
  link: Kadaster['eigenaarsinformatie']['meerInformatie'];
}) {
  const plek = tekst.lastIndexOf(link.tekst);
  if (plek < 0) {
    return (
      <LuxParagraph>
        {tekst} <Koppeling doel={bestemmingVoorLink(link)}>{link.tekst}</Koppeling>
      </LuxParagraph>
    );
  }
  return (
    <LuxParagraph>
      {tekst.slice(0, plek)}
      <Koppeling doel={bestemmingVoorLink(link)}>{link.tekst}</Koppeling>
      {tekst.slice(plek + link.tekst.length)}
    </LuxParagraph>
  );
}

export function KadasterPage() {
  const {
    woning,
    kaart,
    gegevens,
    producten,
    eigenaarsinformatie,
    fotos,
    contact,
    veelgesteldeVragen,
  } = useLoaderData<Kadaster>();

  const fotoSecties = [
    { label: "Luchtfoto's", afbeeldingen: fotos.luchtfotos },
    { label: "Panoramafoto's", afbeeldingen: fotos.panoramafotos },
  ].map(({ label, afbeeldingen }) => ({
    label,
    expanded: true,
    body: (
      <div className={styles.fotos}>
        {afbeeldingen.map((afbeelding) => (
          <img
            key={afbeelding.src}
            src={afbeelding.src}
            alt={afbeelding.alt}
            className={styles.foto}
          />
        ))}
      </div>
    ),
  }));

  return (
    <>
      <PageTitle
        titel={TITEL}
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: kruimelsWoning(woning, 'Kadaster') }}
        terug={{ tekst: woning.adresKort, naar: woningPad(woning.id) }}
      />
      <ContentCard titel={woning.adres}>
        <Sectie kop="Kadastrale kaart" niveau={3}>
          <img src={kaart.afbeelding.src} alt={kaart.afbeelding.alt} className={styles.kaart} />
          {kaart.download && (
            <LuxParagraph>
              <ApiLink link={kaart.download} download />
            </LuxParagraph>
          )}
        </Sectie>
        <Sectie kop="Kadastrale gegevens" niveau={3}>
          <DataList
            items={[
              { label: 'Kadastrale aanduiding', waarde: gegevens.aanduiding },
              { label: 'Kadastrale grootte', waarde: vierkanteMeters(gegevens.grootteM2) },
              {
                label: 'Koopsom',
                waarde:
                  gegevens.koopsomEur === undefined ? undefined : formatEuro(gegevens.koopsomEur),
              },
              {
                label: 'Publiekrechtelijke beperkingen',
                waarde: gegevens.publiekrechtelijkeBeperkingen,
              },
              { label: 'Bebouwing', waarde: gegevens.bebouwing },
              ...producten.map((product) => ({
                label: product.label,
                waarde: <ApiLink link={product.link} />,
              })),
            ]}
          />
        </Sectie>
        <Sectie kop="Eigenaarsinformatie" niveau={3}>
          <MetLink tekst={eigenaarsinformatie.tekst} link={eigenaarsinformatie.meerInformatie} />
          {eigenaarsinformatie.download && (
            <LuxParagraph>
              <ApiLink link={eigenaarsinformatie.download} download />
            </LuxParagraph>
          )}
        </Sectie>
        {/* LUX's provider keeps its first sections; a key per content renders new ones afresh. */}
        <LuxAccordionProvider
          key={[...fotos.luchtfotos, ...fotos.panoramafotos].map(({ src }) => src).join('|')}
          headingLevel={3}
          sections={fotoSecties}
        />
      </ContentCard>
      <Contactkaart contact={contact} />
      <Vragenkaart vragen={veelgesteldeVragen} />
    </>
  );
}
