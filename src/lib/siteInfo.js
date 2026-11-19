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
 * @param {string} url
 * @returns {string} The host, without scheme or trailing slash.
 */
export function getSiteHost(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
