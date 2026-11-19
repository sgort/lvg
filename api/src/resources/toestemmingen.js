// POST /woningen/{id}/toestemmingen and GET /toestemmingen/{kenmerk}: a mocked consent,
// following DvTP pattern C. No data leaves the API. Consents live in memory only and are
// gone when the process restarts.
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

export function resetToestemmingenForTests() {
  store.clear();
  volgnummers.clear();
}

const ongeldig = (title, burgerActie) => new ProblemError(400, title, undefined, burgerActie);

function leesAanvraag(body) {
  if (typeof body !== 'string') return body ?? {};
  try {
    return JSON.parse(body);
  } catch {
    throw ongeldig('Aanvraag niet leesbaar', 'Ga terug en probeer het opnieuw.');
  }
}

// TS-YYYY-MMDD-NNNN, numbered per day.
function nieuwKenmerk(datum) {
  const nummer = (volgnummers.get(datum) ?? 0) + 1;
  volgnummers.set(datum, nummer);
  const [jaar, maand, dag] = datum.split('-');
  return `TS-${jaar}-${maand}${dag}-${String(nummer).padStart(4, '0')}`;
}

export async function createToestemming(request) {
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
    woning: woningVerwijzing(bag),
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
  store.set(kenmerk, { scenario, toestemming });

  return json(201, toestemming, { Location: `/api/v1/toestemmingen/${kenmerk}` });
}

export async function getToestemming(request) {
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
