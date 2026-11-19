import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSiteHost, getSiteUrl } from './siteInfo';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getSiteUrl', () => {
  it('uses VITE_SITE_URL when set', () => {
    vi.stubEnv('VITE_SITE_URL', 'https://acc.lvg.open-regels.nl');
    expect(getSiteUrl()).toBe('https://acc.lvg.open-regels.nl');
  });

  it('falls back to the stable release when unset or blank', () => {
    vi.stubEnv('VITE_SITE_URL', '  ');
    expect(getSiteUrl()).toBe('https://lvg.open-regels.nl');
    vi.stubEnv('VITE_SITE_URL', undefined);
    expect(getSiteUrl()).toBe('https://lvg.open-regels.nl');
  });
});

describe('getSiteHost', () => {
  it('reduces a URL to its host', () => {
    expect(getSiteHost('https://acc.lvg.open-regels.nl/')).toBe('acc.lvg.open-regels.nl');
    expect(getSiteHost('https://lvg.open-regels.nl')).toBe('lvg.open-regels.nl');
  });
});
