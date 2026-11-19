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

  it.each(['drie-woningen', 'een-woning', 'geen-woning'])(
    'answers frequently asked questions about koopwoningen (%s)',
    async (scenario) => {
      const response = await get('/api/v1/woningen', scenario);

      expectValidResponse('listWoningen', response);
      const { vragen, meer } = response.body.veelgesteldeVragen;
      expect(vragen).toHaveLength(3);
      expect(vragen[0].vraag).toBe('Waarom staat mijn woning hier niet?');
      expect(vragen.every((v) => v.antwoord.length > 0)).toBe(true);
      expect(meer).toEqual({
        tekst: 'Bekijk alle veelgestelde vragen',
        href: '#nog-niet-beschikbaar',
        extern: false,
      });
    }
  );

  it('ignores the scenario header unless LVG_SCENARIOS is on', async () => {
    vi.stubEnv('LVG_SCENARIOS', '');
    const response = await get('/api/v1/woningen', 'geen-woning');

    // The default scenario, een-woning, goes straight to the only property.
    expect(response.body.weergave).toBe('direct');
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
      adresKort: 'Voorbeeldlaan 73 B',
      adres: 'Voorbeeldlaan 73 B, 3000 SS Rotterdam',
      // The default scenario has one property, so its list goes straight here.
      overzicht: 'direct',
    });
    expect(bag).toEqual({
      status: 'beschikbaar',
      adres: 'Voorbeeldlaan 73 B, Rotterdam',
      bouwjaar: 1990,
      gebruiksdoel: 'Woonfunctie',
      oppervlakteM2: 120,
      verblijfsobject: '0599019999999999',
    });
    expect(kadaster).toMatchObject({
      status: 'beschikbaar',
      aanduiding: 'Rotterdam Z 99999',
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

  it('logs only the name of a source error', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    registers.getWoz.mockRejectedValueOnce(
      new TypeError('fetch failed for https://bron.example/woningen/Voorbeeldlaan%2073')
    );

    await get('/api/v1/woningen/w-7f3a');

    const logged = JSON.stringify(log.mock.calls);
    expect(logged).toContain('TypeError');
    expect(logged).not.toContain('https://');
  });

  it('answers 404 for a property that is not the citizen’s', async () => {
    const response = await get('/api/v1/woningen/w-2c91', 'een-woning');

    expect(response.status).toBe(404);
    expectValidResponse('getWoning', response);
    expect(response.body.burgerActie).toBe('Ga terug naar uw koopwoningen.');
  });
});
