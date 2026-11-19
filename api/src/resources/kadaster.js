// GET /woningen/{id}/kadaster: parcel data, map, photos, Kadaster products and contact.
import { json } from '../core/http.js';
import * as registers from '../sources/registers.js';
import {
  externeLink,
  placeholderLink,
  scenarioOf,
  veelgesteldeVragen,
  woningVerwijzing,
} from './shared.js';

const KADASTER_WEBSITE = 'https://www.kadaster.nl/';

// The rights and mortgage items link to (paid) Kadaster products; their targets are an
// open question in the spec, so the links are placeholders.
const PRODUCTEN = [
  ['Beperkte rechten', '{Link beperkte rechten}'],
  ['Hypotheekbedrag', '{Link hypotheekbedrag}'],
  ['Hypotheekgever', '{Link hypotheekgever}'],
  ['Hypotheeknemer', '{Link hypotheeknemer}'],
  ['Zakelijke rechten', '{Link zakelijke rechten}'],
];

export async function getKadaster(request) {
  const scenario = scenarioOf(request);
  const { woningId } = request.params;
  const [bag, kadaster] = await Promise.all([
    registers.getWoning(scenario, woningId),
    registers.getKadaster(scenario, woningId),
  ]);

  return json(200, {
    woning: woningVerwijzing(bag),
    kaart: {
      afbeelding: {
        src: kadaster.kaart,
        alt: `Kadastrale kaart met perceel ${kadaster.aanduiding}`,
      },
      download: placeholderLink('{Download link}'),
    },
    gegevens: {
      aanduiding: kadaster.aanduiding,
      grootteM2: kadaster.grootteM2,
      koopsomEur: kadaster.koopsomEur,
      publiekrechtelijkeBeperkingen: kadaster.publiekrechtelijkeBeperkingen,
      bebouwing: kadaster.bebouwing,
    },
    producten: PRODUCTEN.map(([label, tekst]) => ({ label, link: placeholderLink(tekst, true) })),
    eigenaarsinformatie: {
      tekst:
        'In Eigenaarsinformatie vindt u informatie over geregistreerde objecten die op uw naam staan in de Basisregistratie Kadaster. U bent van deze objecten de gerechtigde. Een uitgebreide toelichting op deze informatie vindt u op de webpagina van het Kadaster.',
      meerInformatie: externeLink('Kadaster', KADASTER_WEBSITE),
      download: placeholderLink('Download eigenaarsinformatie (pdf)'),
    },
    fotos: {
      luchtfotos: [{ src: kadaster.luchtfoto, alt: 'Luchtfoto van de omgeving van uw woning' }],
      panoramafotos: [{ src: kadaster.panoramafoto, alt: 'Panoramafoto van de straat' }],
    },
    contact: {
      organisatie: 'Kadaster',
      website: externeLink('www.kadaster.nl', KADASTER_WEBSITE),
    },
    veelgesteldeVragen: veelgesteldeVragen(),
  });
}
