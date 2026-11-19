// Building blocks shared by the resources: the property reference, placeholders for copy
// and links that G&B has not delivered yet, and the scenario of a request.
import { resolveScenario } from '../core/scenario.js';

/** Where a link points while its real target is not known yet. */
export const PLACEHOLDER_HREF = '#nog-niet-beschikbaar';

export const scenarioOf = (request) => resolveScenario(request.headers, process.env);

/** Today's date in the Netherlands, as YYYY-MM-DD. */
export const vandaag = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(new Date());

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
export const veelgesteldeVragen = () => ({
  vragen: [1, 2, 3].map(() => ({ vraag: '{Label}', antwoord: '{antwoord}' })),
  meer: placeholderLink('Bekijk alle veelgestelde vragen'),
});
