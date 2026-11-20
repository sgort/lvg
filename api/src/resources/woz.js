// GET /woningen/{id}/woz: the WOZ fields with their info-button texts, report and contact.
import { json } from '../core/http.js';
import { GEMEENTE_WEBSITES, WOZ_UITLEG } from '../mock/teksten.js';
import { WOZ } from '../mock/veelgesteldeVragen.js';
import * as registers from '../sources/registers.js';
import {
  externeLink,
  placeholderLink,
  scenarioOf,
  veelgesteldeVragen,
  woningVerwijzing,
} from './shared.js';

export async function getWoz(request) {
  const scenario = scenarioOf(request);
  const { woningId } = request.params;
  const [bag, woz] = await Promise.all([
    registers.getWoning(scenario, woningId),
    registers.getWoz(scenario, woningId),
  ]);

  // The explanation texts are mock copy until G&B delivers the real texts.
  const website = GEMEENTE_WEBSITES[bag.woonplaats];
  return json(200, {
    woning: await woningVerwijzing(scenario, bag),
    gegevens: {
      waarde: { bedragEur: woz.waardeEur, uitleg: WOZ_UITLEG.waarde },
      waardepeildatum: { datum: woz.waardepeildatum, uitleg: WOZ_UITLEG.waardepeildatum },
      grondoppervlakteM2: { waarde: woz.grondoppervlakteM2, uitleg: WOZ_UITLEG.grondoppervlakte },
      objectnummer: { tekst: woz.objectnummer, uitleg: WOZ_UITLEG.objectnummer },
      objecttype: { tekst: woz.objecttype, uitleg: WOZ_UITLEG.objecttype },
      taxatieverslag: {
        link: placeholderLink('Taxatieverslag (pdf)'),
        uitleg: WOZ_UITLEG.taxatieverslag,
      },
    },
    // The municipality values the property; the fictional towns have no website.
    contact: {
      organisatie: `Gemeente ${bag.woonplaats}`,
      ...(website ? { website: externeLink(website.tekst, website.href) } : {}),
    },
    veelgesteldeVragen: veelgesteldeVragen(WOZ),
  });
}
