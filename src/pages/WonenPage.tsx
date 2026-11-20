// Wonen, the landing page: the cards the API delivers, each with its button.
import { useLoaderData } from 'react-router';

import { routeVoorActie } from '../api/acties';
import type { Wonen } from '../api/schemas';
import { haalWonen } from '../api/wonen';
import { PageTitle } from '../components/PageTitle';
import { type WonenKaart, WonenKaarten } from '../features/wonen/WonenKaarten';
import { HOME, KRUIMELPAD_LABEL } from './paginaKader';

export const wonenLoader = () => haalWonen();

export function WonenPage() {
  const { kaarten } = useLoaderData<Wonen>();

  const resolved: WonenKaart[] = kaarten.map((kaart) => {
    const doel = routeVoorActie(kaart.actie);
    return {
      id: kaart.id,
      titel: kaart.titel,
      bron: `Bron: ${kaart.bron}`,
      tekst: kaart.tekst,
      // A button needs its text from the API; without one the card shows none.
      knop: doel && kaart.actie.tekst ? { tekst: kaart.actie.tekst, doel } : undefined,
    };
  });

  return (
    <>
      <PageTitle
        titel="Wonen"
        kruimelpad={{ label: KRUIMELPAD_LABEL, items: [HOME, { tekst: 'Wonen' }] }}
        terug={{ tekst: 'Home', naar: HOME.naar ?? '/nl/wonen' }}
      />
      <WonenKaarten kaarten={resolved} />
    </>
  );
}
