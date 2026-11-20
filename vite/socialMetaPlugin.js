// Vite plugin: writes the link-preview tags (Open Graph and Twitter) into the head of
// index.html at build time, so crawlers, which run no JavaScript, see them on every route.
// Each site gets its own card: acceptance is marked, so a shared test link cannot be taken for
// the stable release. Image URLs are absolute, because link previews do not resolve relative
// paths. Only meta tags: no script and no style attribute, so the strict CSP is untouched.
import { FALLBACK_SITE_URL, getPageTitle, getSiteHost } from '../src/lib/siteInfo.ts';

// The same as the <title> in index.html (tested), so the tab and the link preview agree.
const TITEL = 'Mijn woning – Wonen in MijnOverheid (prototype)';
const BESCHRIJVING =
  'Alles over uw woning op één plek: Kadaster, WOZ-waarde en energielabel. Met een berekend advies voor dakisolatie. Een prototype met voorbeeldgegevens.';
const AFBEELDING_ALT =
  'Mijn woning: alles over uw woning op één plek. Prototype van Wonen in MijnOverheid.';

/** @param {string | undefined} rawSiteUrl VITE_SITE_URL as the deploy workflow set it. */
export function socialMetaPlugin(rawSiteUrl) {
  const site = (rawSiteUrl ?? '').trim().replace(/\/+$/, '') || FALLBACK_SITE_URL;
  const kaart = getSiteHost(site).startsWith('acc.') ? 'og-image-acc.png' : 'og-image-prod.png';
  const titel = getPageTitle(rawSiteUrl, TITEL);
  const afbeelding = `${site}/${kaart}`;

  const eigenschappen = {
    'og:type': 'website',
    'og:locale': 'nl_NL',
    'og:site_name': 'Mijn woning',
    'og:title': titel,
    'og:description': BESCHRIJVING,
    'og:url': `${site}/`,
    'og:image': afbeelding,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:type': 'image/png',
    'og:image:alt': AFBEELDING_ALT,
  };
  const namen = {
    description: BESCHRIJVING,
    'theme-color': '#154273',
    'twitter:card': 'summary_large_image',
    'twitter:title': titel,
    'twitter:description': BESCHRIJVING,
    'twitter:image': afbeelding,
    'twitter:image:alt': AFBEELDING_ALT,
  };

  const tags = [
    ...Object.entries(namen).map(([name, content]) => ({ name, content })),
    ...Object.entries(eigenschappen).map(([property, content]) => ({ property, content })),
  ].map((attrs) => ({ tag: 'meta', attrs, injectTo: 'head' }));

  return {
    name: 'social-meta',
    transformIndexHtml: (html) => ({ html, tags }),
  };
}
