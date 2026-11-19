import { afterEach, describe, expect, it, vi } from 'vitest';

import { getPageTitle, getSiteHost, getSiteUrl } from './siteInfo';

describe('getPageTitle', () => {
  it('marks acceptance', () => {
    expect(getPageTitle('https://acc.lvg.open-regels.nl', 'Mijn Woning Overzicht')).toBe(
      'ACC · Mijn Woning Overzicht'
    );
  });

  it('marks a build without a site URL as local', () => {
    expect(getPageTitle(undefined, 'Mijn Woning Overzicht')).toBe('LOCAL · Mijn Woning Overzicht');
    expect(getPageTitle('  ', 'Mijn Woning Overzicht')).toBe('LOCAL · Mijn Woning Overzicht');
  });

  it('leaves the stable release unmarked', () => {
    expect(getPageTitle('https://lvg.open-regels.nl', 'Mijn Woning Overzicht')).toBe(
      'Mijn Woning Overzicht'
    );
  });
});

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
