// The site's own address, shown in the footer. Each deploy workflow sets
// VITE_SITE_URL, so acceptance shows its own host. The stable release is the
// fallback when nothing was injected, for example in a local build.
const FALLBACK_SITE_URL = 'https://lvg.open-regels.nl';

/**
 * Read inside the function, like getBuildInfo, so tests can stub it per case.
 *
 * @returns {string}
 */
export function getSiteUrl() {
  const url = (import.meta.env.VITE_SITE_URL ?? '').trim();
  return url || FALLBACK_SITE_URL;
}

/**
 * The browser tab title, marked per environment so acceptance and local builds
 * cannot be mistaken for the stable release. Takes the raw VITE_SITE_URL value,
 * because vite.config.js calls it at build time, outside import.meta.env.
 *
 * @param {string | undefined} rawSiteUrl
 * @param {string} baseTitle
 * @returns {string}
 */
export function getPageTitle(rawSiteUrl, baseTitle) {
  const url = (rawSiteUrl ?? '').trim();
  if (!url) return `LOCAL · ${baseTitle}`;
  if (getSiteHost(url).startsWith('acc.')) return `ACC · ${baseTitle}`;
  return baseTitle;
}

/**
 * @param {string} url
 * @returns {string} The host, without scheme or trailing slash.
 */
export function getSiteHost(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
