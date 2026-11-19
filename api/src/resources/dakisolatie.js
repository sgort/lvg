// GET /woningen/{id}/dakisolatie: the current roof and the advice, calculated by Operaton on
// every request. The API rounds the amounts and decides which actions the page may offer.
import { errorName, json } from '../core/http.js';
import { LVG_WEBSITE } from '../mock/teksten.js';
import { DAKISOLATIE } from '../mock/veelgesteldeVragen.js';
import { evaluateIsolatie } from '../operaton/client.js';
import {
  buildIsolatieParams,
  INSTALL_COST_PER_M2_PER_100MM,
  LAMBDA_W_MK,
  MATERIAAL_COST_PER_M3,
  operatonConfig,
  TARGET_R_VALUES,
} from '../operaton/parameters.js';
import {
  envOf,
  externeLink,
  placeholderLink,
  scenarioOf,
  vandaag,
  veelgesteldeVragen,
  woningHref,
  woningMetDak,
  woningVerwijzing,
} from './shared.js';

const ISDE_URL = 'https://www.rvo.nl/subsidies-financiering/isde';

const DAKTYPEN = { zadeldak: 'Zadeldak', platdak: 'Plat dak', schilddak: 'Schilddak' };
const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const euro = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const decimaal = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 3 });

const value = (result, name) => result?.[name]?.value;

// Final amounts for the page: whole euros, payback time to one decimal.
function optie(doelRWaarde, result, dakoppervlakteM2) {
  const kostenEur = Math.round(value(result, 'totale_kosten') ?? 0);
  const toelichting = value(result, 'aanbeveling');
  return {
    doelRWaarde,
    // Only the decision recommends. Without an aanbevolen output, nothing is recommended.
    aanbevolen: value(result, 'aanbevolen') === true,
    extraDikteMm: Math.round(value(result, 'extra_dikte_mm') ?? 0),
    kostenEur,
    kostenPerM2Eur: Math.round(kostenEur / dakoppervlakteM2),
    subsidieEur: Math.round(value(result, 'subsidie') ?? 0),
    nettoKostenEur: Math.round(value(result, 'netto_kosten') ?? 0),
    besparingPerJaarEur: Math.round(value(result, 'besparing_jaar') ?? 0),
    terugverdientijdJaar: Math.round((value(result, 'terugverdientijd') ?? 0) * 10) / 10,
    ...(toelichting ? { toelichting } : {}),
  };
}

const NIET_BESCHIKBAAR = {
  status: 'niet-beschikbaar',
  melding: {
    type: 'about:blank',
    title: 'Advies niet beschikbaar',
    status: 503,
    burgerActie: 'Wij kunnen het advies nu niet berekenen. Probeer het later opnieuw.',
  },
};

// A missing OPERATON_BASE_URL on Azure is a configuration error: said once, not per request.
let operatonWarned = false;

export function resetOperatonWarningForTests() {
  operatonWarned = false;
}

async function berekenAdvies(gebouwgegevens, request) {
  // Only a development host passes request.env; there the local engine is the default.
  const operaton = operatonConfig(envOf(request), { lokaalStandaard: request.env !== undefined });
  if (!operaton) {
    if (!operatonWarned) console.error('[lvg-api] OPERATON_BASE_URL is not set');
    operatonWarned = true;
    return structuredClone(NIET_BESCHIKBAAR);
  }
  const params = buildIsolatieParams(gebouwgegevens);
  const config = { ...operaton, fetch: globalThis.fetch };
  try {
    const results = await Promise.all(
      TARGET_R_VALUES.map((doel_r_waarde) => evaluateIsolatie({ ...params, doel_r_waarde }, config))
    );
    return {
      status: 'berekend',
      berekendOp: vandaag(),
      opties: results.map((result, i) =>
        optie(TARGET_R_VALUES[i], result, params.dak_oppervlakte_m2)
      ),
      uitgangspunten: [
        {
          label: 'Warmtegeleiding isolatiemateriaal',
          waarde: `${decimaal.format(LAMBDA_W_MK)} W/m·K`,
        },
        { label: 'Materiaalprijs', waarde: `${euro.format(MATERIAAL_COST_PER_M3)} per m³` },
        {
          label: 'Arbeidsprijs',
          waarde: `${euro.format(INSTALL_COST_PER_M2_PER_100MM)} per m² per 100 mm`,
        },
      ],
      toelichting: 'Dit is een indicatie. De echte kosten hoort u van een aannemer.',
    };
  } catch (error) {
    console.error('[lvg-api] Operaton unavailable:', errorName(error));
    return structuredClone(NIET_BESCHIKBAAR);
  }
}

export async function getDakisolatie(request) {
  const scenario = scenarioOf(request);
  const { woningId } = request.params;
  const { bag, gebouwgegevens } = await woningMetDak(scenario, woningId);

  const advies = await berekenAdvies(gebouwgegevens, request);
  const isolatie = gebouwgegevens.bestaande_isolatie;
  const acties = [
    ...(advies.status === 'berekend'
      ? [{ type: 'deel-met-aannemer', href: woningHref(woningId, 'aannemers') }]
      : []),
    {
      type: 'meer-over-subsidie',
      href: ISDE_URL,
      tekst: 'Meer over subsidie voor isolatie (ISDE)',
    },
  ];

  return json(200, {
    woning: await woningVerwijzing(scenario, bag),
    huidigDak: {
      isolatie: {
        soort: capitalise(isolatie.type),
        dikteMm: isolatie.dikte_mm,
        rWaarde: isolatie.R_waarde_m2K_per_W,
      },
      dakoppervlakteM2: gebouwgegevens.dak.oppervlakte_m2,
      daktype: DAKTYPEN[gebouwgegevens.dak.daktype] ?? capitalise(gebouwgegevens.dak.daktype),
      bronnen: ['Kadaster', 'BAG', 'LVG'],
      klopDitNiet: placeholderLink('Klopt dit niet?'),
    },
    advies,
    contact: { organisatie: 'LVG', website: externeLink(LVG_WEBSITE.tekst, LVG_WEBSITE.href) },
    veelgesteldeVragen: veelgesteldeVragen(DAKISOLATIE),
    acties,
  });
}
