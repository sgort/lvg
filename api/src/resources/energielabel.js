// GET /woningen/{id}/energielabel: the label, its validity as a status, the documents and
// the actions the page may offer. The page never compares dates itself.
import { json } from '../core/http.js';
import * as registers from '../sources/registers.js';
import {
  externeLink,
  placeholderLink,
  scenarioOf,
  vandaag,
  veelgesteldeVragen,
  woningHref,
  woningVerwijzing,
} from './shared.js';

// A label is valid up to and including its end date.
const geldigheid = (geldigTot) => (vandaag() <= geldigTot ? 'geldig' : 'verlopen');

export async function getEnergielabel(request) {
  const scenario = scenarioOf(request);
  const { woningId } = request.params;
  const [bag, label, dak] = await Promise.all([
    registers.getWoning(scenario, woningId),
    registers.getEnergielabel(scenario, woningId),
    registers.getDak(scenario, woningId),
  ]);

  const acties = dak
    ? [{ type: 'bekijk-dakisolatie', href: woningHref(woningId, 'dakisolatie') }]
    : [];

  return json(200, {
    woning: woningVerwijzing(bag),
    label: { klasse: label.klasse, naam: label.klasseNaam },
    objectAanduiding: label.gebouwklasse === 'woning' ? 'woning' : 'gebouw',
    registratiedatum: label.registratiedatum,
    opnamedatum: label.opnamedatum,
    geldigTot: label.geldigTot,
    geldigheid: geldigheid(label.geldigTot),
    labelDocument: placeholderLink(
      `Energielabel ${label.klasse} ${bag.postcode.replace(/\s/g, '')} ${bag.huisnummer} (pdf)`
    ),
    opnamegegevens: placeholderLink('Opnamegegevens (pdf)'),
    isde: {
      link: externeLink('{ISDE-gegevens}', 'https://www.rvo.nl/subsidies-financiering/isde'),
      uitleg: '{uitleg ISDE-gegevens}',
    },
    contact: {
      organisatie: 'Rijksdienst voor Ondernemend Nederland (RVO)',
      website: externeLink('www.rvo.nl', 'https://www.rvo.nl/'),
    },
    veelgesteldeVragen: veelgesteldeVragen(),
    acties,
  });
}
