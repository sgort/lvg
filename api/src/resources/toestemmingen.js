// POST /woningen/{id}/toestemmingen and GET /toestemmingen/{kenmerk}: a mocked consent,
// following DvTP pattern C. No data leaves the API. Consents live in memory only: they are
// kept for today and the previous day, and are gone when the process restarts. Numbering is
// per instance and per day, so two instances can hand out the same kenmerk (a mock property).
import { json, ProblemError } from '../core/http.js';
import * as registers from '../sources/registers.js';
import { DOEL, GEGEVENSSETS, TERMIJNEN } from './aannemers.js';
import {
  PLACEHOLDER_HREF,
  plusDagen,
  scenarioOf,
  vandaag,
  woningHref,
  woningMetDak,
  woningVerwijzing,
} from './shared.js';

const store = new Map();
const volgnummers = new Map();

// Drops consents and day counters older than the previous day, so the store stays small.
function ruimOp() {
  const vandaagDatum = vandaag();
  const bewaren = new Set([vandaagDatum, plusDagen(vandaagDatum, -1)]);
  for (const [kenmerk, entry] of store) if (!bewaren.has(entry.datum)) store.delete(kenmerk);
  for (const datum of volgnummers.keys()) if (!bewaren.has(datum)) volgnummers.delete(datum);
}

export function resetToestemmingenForTests() {
  store.clear();
  volgnummers.clear();
}

const ongeldig = (title, burgerActie) => new ProblemError(400, title, undefined, burgerActie);

const onleesbaar = () => ongeldig('Aanvraag niet leesbaar', 'Ga terug en probeer het opnieuw.');

const isGewoonObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Only a JSON object is a request: null, an array or a bare value is not.
function leesAanvraag(body) {
  let aanvraag = body;
  if (typeof body === 'string') {
    try {
      aanvraag = JSON.parse(body);
    } catch {
      throw onleesbaar();
    }
  }
  if (!isGewoonObject(aanvraag)) throw onleesbaar();
  return aanvraag;
}

// TS-YYYY-MMDD-NNNN, numbered per day.
function nieuwKenmerk(datum) {
  const nummer = (volgnummers.get(datum) ?? 0) + 1;
  volgnummers.set(datum, nummer);
  const [jaar, maand, dag] = datum.split('-');
  return `TS-${jaar}-${maand}${dag}-${String(nummer).padStart(4, '0')}`;
}

export async function createToestemming(request) {
  ruimOp();
  const scenario = scenarioOf(request);
  const { woningId } = request.params;
  const { bag } = await woningMetDak(scenario, woningId);
  const aanvraag = leesAanvraag(request.body);

  const aannemers = await registers.getAannemers(scenario, woningId);
  const aannemer = aannemers.find((a) => a.id === aanvraag.aannemerId);
  if (!aannemer) throw ongeldig('Geen aannemer gekozen', 'Kies een aannemer.');

  const gekozen = Array.isArray(aanvraag.gegevenssets) ? aanvraag.gegevenssets : [];
  if (gekozen.some((id) => !GEGEVENSSETS.some((set) => set.id === id))) {
    throw ongeldig('Onbekende gegevens', 'Ga terug en kies opnieuw welke gegevens u deelt.');
  }
  if (GEGEVENSSETS.some((set) => set.verplicht && !gekozen.includes(set.id))) {
    throw ongeldig(
      'Verplichte gegevens ontbreken',
      'De verplichte gegevens worden altijd gedeeld. Ga terug en probeer het opnieuw.'
    );
  }
  if (!TERMIJNEN.includes(aanvraag.termijnDagen)) {
    throw ongeldig(
      'Termijn niet beschikbaar',
      'Kies hoe lang het bedrijf de gegevens mag ophalen.'
    );
  }

  const datum = vandaag();
  const kenmerk = nieuwKenmerk(datum);
  const toestemming = {
    kenmerk,
    woning: await woningVerwijzing(scenario, bag),
    gedeeldMet: aannemer.naam,
    doel: DOEL,
    gegevenssets: GEGEVENSSETS.filter((set) => gekozen.includes(set.id)).map((set) => set.naam),
    geldigTot: plusDagen(datum, aanvraag.termijnDagen),
    termijnDagen: aanvraag.termijnDagen,
    acties: [
      { type: 'terug-naar-woning', href: woningHref(woningId), tekst: 'Terug naar uw woning' },
      // Managing consents is not in this iteration: the page shows "Nog niet beschikbaar".
      { type: 'beheer-gegevens', href: PLACEHOLDER_HREF, tekst: 'Beheer gegevens' },
    ],
  };
  store.set(kenmerk, { scenario, datum, toestemming });

  return json(201, toestemming, { Location: `/api/v1/toestemmingen/${kenmerk}` });
}

export async function getToestemming(request) {
  ruimOp();
  const entry = store.get(request.params.kenmerk);
  // A consent of another simulated citizen is treated as unknown.
  if (!entry || entry.scenario !== scenarioOf(request)) {
    throw new ProblemError(
      404,
      'Toestemming niet gevonden',
      'Deze toestemming bestaat niet (meer).',
      'Ga terug naar uw woning.'
    );
  }
  return json(200, structuredClone(entry.toestemming));
}
