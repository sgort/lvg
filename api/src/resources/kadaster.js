// GET /woningen/{id}/kadaster: parcel data, map, photos, Kadaster products and contact.
import { json } from '../core/http.js';
import { KADASTER } from '../mock/veelgesteldeVragen.js';
import { KADASTER_PRODUCT_LINK, KADASTER_PRODUCTEN } from '../mock/teksten.js';
import * as registers from '../sources/registers.js';
import {
  externeLink,
  placeholderLink,
  scenarioOf,
  veelgesteldeVragen,
  woningVerwijzing,
} from './shared.js';

const KADASTER_WEBSITE = 'https://www.kadaster.nl/';

// The rights and mortgage items are (paid) Kadaster products. Their exact targets are an open
// question in the spec, so each links to the Kadaster's website (mock).

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
      download: { tekst: 'Download kadastrale kaart (png)', href: kadaster.kaart },
    },
    gegevens: {
      aanduiding: kadaster.aanduiding,
      grootteM2: kadaster.grootteM2,
      koopsomEur: kadaster.koopsomEur,
      publiekrechtelijkeBeperkingen: kadaster.publiekrechtelijkeBeperkingen,
      bebouwing: kadaster.bebouwing,
    },
    producten: KADASTER_PRODUCTEN.map((label) => ({
      label,
      link: externeLink(KADASTER_PRODUCT_LINK, KADASTER_WEBSITE),
    })),
    eigenaarsinformatie: {
      tekst:
        'In Eigenaarsinformatie vindt u informatie over geregistreerde objecten die op uw naam staan in de Basisregistratie Kadaster. U bent van deze objecten de gerechtigde. Een uitgebreide toelichting op deze informatie vindt u op de webpagina van het Kadaster.',
      meerInformatie: externeLink('Kadaster', KADASTER_WEBSITE),
      download: placeholderLink('Download eigenaarsinformatie (pdf)'),
    },
    fotos: {
      // Drawn examples, not photos of the property: the sandbox has no real images.
      luchtfotos: [
        { src: kadaster.luchtfoto, alt: 'Voorbeeld van een luchtfoto: woningen langs een straat' },
      ],
      panoramafotos: [
        {
          src: kadaster.panoramafoto,
          alt: 'Voorbeeld van een panoramafoto: een rij woningen gezien vanaf de straat',
        },
      ],
    },
    contact: {
      organisatie: 'Kadaster',
      website: externeLink('www.kadaster.nl', KADASTER_WEBSITE),
    },
    veelgesteldeVragen: veelgesteldeVragen(KADASTER),
  });
}
