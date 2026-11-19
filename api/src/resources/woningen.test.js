import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectValidResponse } from '../../test/contract.js';
import { handle } from '../core/router.js';
import * as registers from '../sources/registers.js';

vi.mock('../sources/registers.js', async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, getWoz: vi.fn(original.getWoz) };
});

const get = (path, scenario) =>
  handle({
    method: 'GET',
    path,
    headers: scenario ? { 'X-LVG-Scenario': scenario } : {},
  });

beforeEach(() => {
  vi.stubEnv('LVG_SCENARIOS', 'on');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('GET /woningen', () => {
  it('shows a list for several properties', async () => {
    const response = await get('/api/v1/woningen', 'drie-woningen');

    expect(response.status).toBe(200);
    expectValidResponse('listWoningen', response);
    expect(response.body.weergave).toBe('lijst');
    expect(response.body.woningen).toHaveLength(3);
    expect(response.body.woningen[1]).toEqual({
      id: 'w-2c91',
      adresKort: 'Straatnaam 23',
      adresMetPlaats: 'Straatnaam 23, Drechtstad',
      soort: 'Koopwoning',
      bouwjaar: 1994,
      energielabel: { klasse: 'A', naam: 'A' },
    });
    expect(response.body.acties).toEqual([]);
  });

  it('goes straight to the only property', async () => {
    const response = await get('/api/v1/woningen', 'een-woning');

    expectValidResponse('listWoningen', response);
    expect(response.body.weergave).toBe('direct');
    expect(response.body.woningen.map((w) => w.id)).toEqual(['w-7f3a']);
  });

  it('offers contact with the Kadaster when there is no property', async () => {
    const response = await get('/api/v1/woningen', 'geen-woning');

    expectValidResponse('listWoningen', response);
    expect(response.body.weergave).toBe('leeg');
    expect(response.body.woningen).toEqual([]);
    expect(response.body.acties).toEqual([
      expect.objectContaining({
        type: 'contact-kadaster',
        tekst: 'Klopt dit niet? Neem contact op met het Kadaster',
      }),
    ]);
  });

  it('ignores the scenario header unless LVG_SCENARIOS is on', async () => {
    vi.stubEnv('LVG_SCENARIOS', '');
    const response = await get('/api/v1/woningen', 'geen-woning');

    expect(response.body.weergave).toBe('lijst');
  });
});

describe('GET /woningen/{id}', () => {
  it('returns the four summary sections, each available', async () => {
    const response = await get('/api/v1/woningen/w-7f3a');

    expect(response.status).toBe(200);
    expectValidResponse('getWoning', response);
    const { woning, bag, kadaster, woz, energielabel } = response.body;
    expect(woning).toEqual({
      id: 'w-7f3a',
      adresKort: 'Lange Hilleweg 73 B',
      adres: 'Lange Hilleweg 73 B, 3073 BJ Rotterdam',
    });
    expect(bag).toEqual({
      status: 'beschikbaar',
      adres: 'Lange Hilleweg 73 B, Rotterdam',
      bouwjaar: 1990,
      gebruiksdoel: 'Woonfunctie',
      oppervlakteM2: 120,
      verblijfsobject: '0599010000183946',
    });
    expect(kadaster).toMatchObject({
      status: 'beschikbaar',
      aanduiding: 'Rotterdam G 3916',
      grootteM2: 158,
      actie: { type: 'bekijk-kadaster', href: '/api/v1/woningen/w-7f3a/kadaster' },
    });
    expect(woz).toMatchObject({
      status: 'beschikbaar',
      waarde: { bedragEur: 317000, uitleg: expect.any(String) },
      waardepeildatum: { datum: '2025-01-01', uitleg: expect.any(String) },
      actie: { type: 'bekijk-woz', href: '/api/v1/woningen/w-7f3a/woz' },
    });
    expect(energielabel).toMatchObject({
      status: 'beschikbaar',
      label: { klasse: 'C', naam: 'C' },
      opnamedatum: '2020-12-06',
      actie: { type: 'bekijk-energielabel', href: '/api/v1/woningen/w-7f3a/energielabel' },
    });
  });

  it('keeps the other sections when one source fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    registers.getWoz.mockRejectedValueOnce(new Error('LV WOZ niet bereikbaar'));

    const response = await get('/api/v1/woningen/w-7f3a');

    expect(response.status).toBe(200);
    expectValidResponse('getWoning', response);
    expect(response.body.woz).toEqual({ status: 'niet-beschikbaar' });
    expect(response.body.kadaster.status).toBe('beschikbaar');
    expect(response.body.energielabel.status).toBe('beschikbaar');
  });

  it('answers 404 for a property that is not the citizen’s', async () => {
    const response = await get('/api/v1/woningen/w-2c91', 'een-woning');

    expect(response.status).toBe(404);
    expectValidResponse('getWoning', response);
    expect(response.body.burgerActie).toBe('Ga terug naar uw koopwoningen.');
  });
});
