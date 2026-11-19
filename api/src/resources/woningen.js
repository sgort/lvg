// GET /woningen and GET /woningen/{id}: the list of koopwoningen and the summary of one.
import { errorName, json } from '../core/http.js';
import { WOZ_UITLEG } from '../mock/teksten.js';
import { KOOPWONINGEN, WONING } from '../mock/veelgesteldeVragen.js';
import * as registers from '../sources/registers.js';
import {
  adresKort,
  adresMetPlaats,
  scenarioOf,
  veelgesteldeVragen,
  woningHref,
  woningVerwijzing,
} from './shared.js';

const label = (klasse) => ({ klasse, naam: klasse });

// One property opens directly, several show as a list, none shows the empty message.
const weergave = (aantal) => (aantal === 0 ? 'leeg' : aantal === 1 ? 'direct' : 'lijst');

export async function listWoningen(request) {
  const woningen = await registers.listWoningen(scenarioOf(request));
  // Placeholder URL until the Kadaster's contact page for this case is known.
  const acties =
    woningen.length === 0
      ? [
          {
            type: 'contact-kadaster',
            href: 'https://www.kadaster.nl/contact',
            tekst: 'Klopt dit niet? Neem contact op met het Kadaster',
          },
        ]
      : [];

  return json(200, {
    weergave: weergave(woningen.length),
    woningen: woningen.map((bag) => ({
      id: bag.id,
      adresKort: adresKort(bag),
      adresMetPlaats: adresMetPlaats(bag),
      soort: bag.soort,
      bouwjaar: bag.bouwjaar,
      energielabel: label(bag.energielabelklasse),
    })),
    acties,
    veelgesteldeVragen: veelgesteldeVragen(KOOPWONINGEN),
  });
}

// A section whose source fails is reported on its own, so the others stay visible.
async function sectie(load, map) {
  try {
    return { status: 'beschikbaar', ...map(await load()) };
  } catch (error) {
    console.error('[lvg-api] source unavailable:', errorName(error));
    return { status: 'niet-beschikbaar' };
  }
}

export async function getWoning(request) {
  const scenario = scenarioOf(request);
  const { woningId } = request.params;
  // An unknown property is a 404 for the whole page, not a missing section.
  const bag = await registers.getWoning(scenario, woningId);

  const [kadaster, woz, energielabel] = await Promise.all([
    sectie(
      () => registers.getKadaster(scenario, woningId),
      (k) => ({
        aanduiding: k.aanduiding,
        grootteM2: k.grootteM2,
        actie: { type: 'bekijk-kadaster', href: woningHref(woningId, 'kadaster') },
      })
    ),
    sectie(
      () => registers.getWoz(scenario, woningId),
      (w) => ({
        waarde: { bedragEur: w.waardeEur, uitleg: WOZ_UITLEG.waarde },
        waardepeildatum: { datum: w.waardepeildatum, uitleg: WOZ_UITLEG.waardepeildatum },
        actie: { type: 'bekijk-woz', href: woningHref(woningId, 'woz') },
      })
    ),
    sectie(
      () => registers.getEnergielabel(scenario, woningId),
      (e) => ({
        label: label(e.klasse),
        opnamedatum: e.opnamedatum,
        actie: { type: 'bekijk-energielabel', href: woningHref(woningId, 'energielabel') },
      })
    ),
  ]);

  return json(200, {
    woning: woningVerwijzing(bag),
    bag: {
      status: 'beschikbaar',
      adres: adresMetPlaats(bag),
      bouwjaar: bag.bouwjaar,
      gebruiksdoel: bag.gebruiksdoel,
      oppervlakteM2: bag.oppervlakteM2,
      verblijfsobject: bag.verblijfsobject,
    },
    kadaster,
    woz,
    energielabel,
    veelgesteldeVragen: veelgesteldeVragen(WONING),
  });
}
