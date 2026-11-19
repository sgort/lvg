// GET /woningen/{id}/woz: the WOZ fields with their info-button texts, report and contact.
import { json } from '../core/http.js';
import * as registers from '../sources/registers.js';
import { placeholderLink, scenarioOf, veelgesteldeVragen, woningVerwijzing } from './shared.js';

export async function getWoz(request) {
  const scenario = scenarioOf(request);
  const { woningId } = request.params;
  const [bag, woz] = await Promise.all([
    registers.getWoning(scenario, woningId),
    registers.getWoz(scenario, woningId),
  ]);

  // The explanation texts are design placeholders until G&B delivers copy.
  return json(200, {
    woning: woningVerwijzing(bag),
    gegevens: {
      waarde: { bedragEur: woz.waardeEur, uitleg: '{uitleg WOZ-waarde}' },
      waardepeildatum: { datum: woz.waardepeildatum, uitleg: '{uitleg waardepeildatum}' },
      grondoppervlakteM2: { waarde: woz.grondoppervlakteM2, uitleg: '{uitleg grondoppervlakte}' },
      objectnummer: { tekst: woz.objectnummer, uitleg: '{uitleg WOZ-objectnummer}' },
      objecttype: { tekst: woz.objecttype, uitleg: '{uitleg WOZ-objecttype}' },
      taxatieverslag: {
        link: placeholderLink('Taxatieverslag (pdf)'),
        uitleg: '{uitleg taxatieverslag}',
      },
    },
    // The municipality values the property; its contact details are a placeholder.
    contact: {
      organisatie: `Gemeente ${bag.woonplaats}`,
      website: placeholderLink('{url}', true),
    },
    veelgesteldeVragen: veelgesteldeVragen(),
  });
}
