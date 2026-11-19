// Building blocks shared by the resources: the property reference, placeholders for copy
// and links that G&B has not delivered yet, and the scenario of a request.
import { ProblemError } from '../core/http.js';
import { resolveScenario } from '../core/scenario.js';
import * as registers from '../sources/registers.js';

/** Where a link points while its real target is not known yet. */
export const PLACEHOLDER_HREF = '#nog-niet-beschikbaar';

/**
 * Settings for a request: what the host passes as `request.env` (the Vite dev server), or
 * the process environment (Azure Functions app settings).
 */
export const envOf = (request) => request.env ?? process.env;

export const scenarioOf = (request) => resolveScenario(request.headers, envOf(request));

/** Today's date in the Netherlands, as YYYY-MM-DD. */
export const vandaag = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date());

/** A YYYY-MM-DD date plus a number of days, as YYYY-MM-DD. */
export const plusDagen = (datum, dagen) => {
  const date = new Date(`${datum}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dagen);
  return date.toISOString().slice(0, 10);
};

/**
 * The property and its building data, for the roof insulation flow. A property without
 * building data has no advice, so its Dakisolatie, contractor and consent pages are 404.
 */
export async function woningMetDak(scenario, woningId) {
  const [bag, gebouwgegevens] = await Promise.all([
    registers.getWoning(scenario, woningId),
    registers.getDak(scenario, woningId),
  ]);
  if (!gebouwgegevens) {
    throw new ProblemError(
      404,
      'Geen advies voor deze woning',
      'Voor deze woning zijn geen gegevens over het dak bekend.',
      'Ga terug naar het energielabel van uw woning.'
    );
  }
  return { bag, gebouwgegevens };
}

export const woningHref = (id, ...segments) => ['/api/v1/woningen', id, ...segments].join('/');

export const adresKort = (bag) => `${bag.straat} ${bag.huisnummer}`;

export const adresMetPlaats = (bag) => `${adresKort(bag)}, ${bag.woonplaats}`;

/** The property a page is about: short address for title and breadcrumb, full address. */
export const woningVerwijzing = (bag) => ({
  id: bag.id,
  adresKort: adresKort(bag),
  adres: `${adresKort(bag)}, ${bag.postcode} ${bag.woonplaats}`,
});

export const placeholderLink = (tekst, extern = false) => ({
  tekst,
  href: PLACEHOLDER_HREF,
  extern,
});

export const externeLink = (tekst, href) => ({ tekst, href, extern: true });

/** The FAQ card. Its questions are a design placeholder until G&B delivers copy. */
/** Frequently asked questions: the given ones, or three placeholders until G&B delivers. */
export const veelgesteldeVragen = (
  vragen = [1, 2, 3].map(() => ({ vraag: '{Label}', antwoord: '{antwoord}' }))
) => ({
  vragen,
  meer: placeholderLink('Bekijk alle veelgestelde vragen'),
});
