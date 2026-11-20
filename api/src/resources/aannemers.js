// GET /woningen/{id}/aannemers: the contractors a citizen may choose for a roof insulation
// quote, with what the consent may cover. The government does not rate companies, so no
// ratings are given.
import { json } from '../core/http.js';
import * as registers from '../sources/registers.js';
import { plusDagen, scenarioOf, vandaag, woningMetDak, woningVerwijzing } from './shared.js';

export const DOEL = 'Offerte voor dakisolatie maken';

/** The data sets a consent may cover, first pass from the design (screen 2b). */
export const GEGEVENSSETS = [
  {
    id: 'woning-en-dak',
    naam: 'Woning en dak',
    bron: 'LVG (Kadaster, BAG)',
    elementen: ['adres', 'bouwjaar', 'dakoppervlakte', 'daktype'],
    verplicht: true,
    standaardAan: true,
  },
  {
    id: 'huidige-isolatie',
    naam: 'Huidige isolatie',
    bron: 'LVG',
    elementen: ['soort', 'dikte', 'R-waarde'],
    verplicht: true,
    standaardAan: true,
  },
  {
    id: 'energiegegevens',
    naam: 'Energiegegevens',
    bron: 'RVO (EP-online)',
    elementen: ['energielabel', 'eerder toegekende verduurzamingssubsidies'],
    verplicht: false,
    standaardAan: true,
  },
  {
    id: 'advies-dakisolatie',
    naam: 'Advies dakisolatie',
    bron: 'LVG',
    elementen: ['het advies van de vorige pagina'],
    verplicht: false,
    standaardAan: false,
  },
];

export const TERMIJNEN = [7, 14, 30];
export const STANDAARD_TERMIJN = 14;

/** The durations on offer, each with the date it would end. */
export const termijnen = () =>
  TERMIJNEN.map((dagen) => ({
    dagen,
    verlooptOp: plusDagen(vandaag(), dagen),
    standaard: dagen === STANDAARD_TERMIJN,
  }));

export async function getAannemers(request) {
  const scenario = scenarioOf(request);
  const { woningId } = request.params;
  const { bag } = await woningMetDak(scenario, woningId);
  const aannemers = await registers.getAannemers(scenario, woningId);
  const aanbod = termijnen();

  return json(200, {
    woning: await woningVerwijzing(scenario, bag),
    doel: DOEL,
    aannemers: aannemers.map((aannemer) => ({
      id: aannemer.id,
      naam: aannemer.naam,
      specialisme: aannemer.specialisme,
      gegevenssets: structuredClone(GEGEVENSSETS),
      termijnen: aanbod,
    })),
  });
}
