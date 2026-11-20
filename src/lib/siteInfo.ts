// The site's own address, shown in the build line. Each deploy workflow sets
// VITE_SITE_URL, so acceptance shows its own host. The stable release is the
// fallback when nothing was injected, for example in a local build.
export const FALLBACK_SITE_URL = 'https://lvg.open-regels.nl';

/** Read inside the function, like getBuildInfo, so tests can stub it per case. */
export function getSiteUrl(): string {
  const url = (import.meta.env.VITE_SITE_URL ?? '').trim();
  return url || FALLBACK_SITE_URL;
}

/**
 * The browser tab title, marked per environment so acceptance and local builds
 * cannot be mistaken for the stable release. Takes the raw VITE_SITE_URL value,
 * because vite.config.js calls it at build time, outside import.meta.env.
 */
export function getPageTitle(rawSiteUrl: string | undefined, baseTitle: string): string {
  const url = (rawSiteUrl ?? '').trim();
  if (!url) return `LOCAL · ${baseTitle}`;
  if (getSiteHost(url).startsWith('acc.')) return `ACC · ${baseTitle}`;
  return baseTitle;
}

/**
 * A page's document title, `[Paginatitel] - MijnOverheid` as the spec has it, with the same
 * environment marker as the tab title in index.html. Read at call time, so tests can stub it.
 */
export function getDocumentTitle(paginatitel: string): string {
  return getPageTitle(import.meta.env.VITE_SITE_URL, `${paginatitel} - MijnOverheid`);
}

/** The host, without scheme or trailing slash. */
export function getSiteHost(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
