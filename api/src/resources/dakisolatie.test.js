import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectValidResponse } from '../../test/contract.js';
import { handle } from '../core/router.js';
import { resetOperatonWarningForTests } from './dakisolatie.js';

const PATH = '/api/v1/woningen/w-7f3a/dakisolatie';
const get = (path = PATH) => handle({ method: 'GET', path, headers: {} });

// A DMN result per target R-value, shaped like Operaton's evaluate response.
const dmnResult = (doelR, { aanbevolen } = {}) => {
  const result = {
    delta_r: { value: doelR - 2.8 },
    extra_dikte_mm: { value: Math.round((doelR - 2.8) * 35) },
    totale_kosten: { value: 1000 * doelR + 35 },
    subsidie: { value: 1500 },
    netto_kosten: { value: 1000 * doelR + 35 - 1500 },
    besparing_jaar: { value: 300 },
    terugverdientijd: { value: 3.456 },
    aanbeveling: { value: doelR === 6 ? 'Aanbevolen: R-waarde 6.0' : '' },
  };
  if (aanbevolen !== undefined) result.aanbevolen = { value: aanbevolen === doelR };
  return result;
};

const operaton = (options) =>
  vi.fn(async (_url, init) => {
    const doelR = JSON.parse(init.body).variables.doel_r_waarde.value;
    return { ok: true, status: 200, json: async () => [dmnResult(doelR, options)] };
  });

beforeEach(() => {
  resetOperatonWarningForTests();
  vi.stubEnv('OPERATON_BASE_URL', 'https://operaton.example/engine-rest');
  vi.stubEnv('OPERATON_USER', '');
  vi.useFakeTimers({ now: new Date('2026-11-19T12:00:00Z'), toFake: ['Date'] });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('GET /woningen/{id}/dakisolatie', () => {
  it('returns four options with the recommendation taken from the DMN', async () => {
    vi.stubGlobal('fetch', operaton({ aanbevolen: 6 }));

    const response = await get();

    expect(response.status).toBe(200);
    expectValidResponse('getDakisolatie', response);
    const { advies } = response.body;
    expect(advies.status).toBe('berekend');
    expect(advies.berekendOp).toBe('2026-11-19');
    expect(advies.opties.map((o) => o.doelRWaarde)).toEqual([3, 4, 6, 8]);
    expect(advies.opties.map((o) => o.aanbevolen)).toEqual([false, false, true, false]);
    expect(advies.opties[2].toelichting).toBe('Aanbevolen: R-waarde 6.0');
  });

  it('recommends nothing when the DMN has no aanbevolen output', async () => {
    vi.stubGlobal('fetch', operaton());

    const response = await get();

    expectValidResponse('getDakisolatie', response);
    expect(response.body.advies.opties.map((o) => o.aanbevolen)).toEqual([
      false,
      false,
      false,
      false,
    ]);
  });

  it('sends the roof area to Operaton, not the floor area', async () => {
    const fetch = operaton({ aanbevolen: 6 });
    vi.stubGlobal('fetch', fetch);

    await get();

    const sent = fetch.mock.calls.map(([, init]) => JSON.parse(init.body).variables);
    expect(fetch).toHaveBeenCalledTimes(4);
    for (const variables of sent) {
      expect(variables.dak_oppervlakte_m2.value).toBe(120);
      expect(variables.huidige_r_waarde.value).toBe(2.8);
      expect(variables.lambda_w_mk.value).toBe(0.035);
      expect(variables.materiaal_cost_per_m3.value).toBe(80);
      expect(variables.install_cost_per_m2_per_100mm.value).toBe(25);
    }
  });

  it('delivers final, rounded amounts', async () => {
    vi.stubGlobal('fetch', operaton({ aanbevolen: 6 }));

    const optie = (await get()).body.advies.opties[2];

    expect(optie).toEqual({
      doelRWaarde: 6,
      aanbevolen: true,
      extraDikteMm: 112,
      kostenEur: 6035,
      kostenPerM2Eur: 50,
      subsidieEur: 1500,
      nettoKostenEur: 4535,
      besparingPerJaarEur: 300,
      terugverdientijdJaar: 3.5,
      toelichting: 'Aanbevolen: R-waarde 6.0',
    });
  });

  it('describes the current roof and the assumptions', async () => {
    vi.stubGlobal('fetch', operaton({ aanbevolen: 6 }));

    const body = (await get()).body;

    expect(body.huidigDak).toMatchObject({
      isolatie: { soort: 'Glaswol', dikteMm: 100, rWaarde: 2.8 },
      dakoppervlakteM2: 120,
      daktype: 'Zadeldak',
      bronnen: ['Kadaster', 'BAG', 'LVG'],
    });
    expect(body.advies.uitgangspunten.map((u) => u.label)).toEqual([
      'Warmtegeleiding isolatiemateriaal',
      'Materiaalprijs',
      'Arbeidsprijs',
    ]);
    expect(body.advies.uitgangspunten[0].waarde).toBe('0,035 W/m·K');
    expect(body.advies.toelichting).toBe(
      'Dit is een indicatie. De echte kosten hoort u van een aannemer.'
    );
  });

  it('offers sharing with a contractor and more about subsidy', async () => {
    vi.stubGlobal('fetch', operaton({ aanbevolen: 6 }));

    const acties = (await get()).body.acties;

    expect(acties.map((a) => a.type)).toEqual(['deel-met-aannemer', 'meer-over-subsidie']);
    expect(acties[0].href).toBe('/api/v1/woningen/w-7f3a/aannemers');
  });

  it('logs only the name of an Operaton error', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed for https://bron.example/woningen/Voorbeeldlaan%2073');
      })
    );

    await get();

    const logged = JSON.stringify(log.mock.calls);
    expect(logged).toContain('TypeError');
    expect(logged).not.toContain('https://');
  });

  it('reports the advice as unavailable on Azure when OPERATON_BASE_URL is not set', async () => {
    vi.stubEnv('OPERATON_BASE_URL', '');
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    const first = await get();
    const second = await get();

    expectValidResponse('getDakisolatie', first);
    expect(first.body.advies.status).toBe('niet-beschikbaar');
    expect(second.body.advies.status).toBe('niet-beschikbaar');
    expect(fetch).not.toHaveBeenCalled();
    expect(log.mock.calls).toEqual([['[lvg-api] OPERATON_BASE_URL is not set']]);
  });

  it('still uses the local Operaton on a development host', async () => {
    vi.stubEnv('OPERATON_BASE_URL', '');
    const fetch = operaton({ aanbevolen: 6 });
    vi.stubGlobal('fetch', fetch);

    const response = await handle({ method: 'GET', path: PATH, headers: {}, env: {} });

    expect(response.body.advies.status).toBe('berekend');
    expect(fetch.mock.calls[0][0]).toMatch(/^http:\/\/localhost:8081\/engine-rest\//);
  });

  it('keeps the roof and explains what to do when Operaton fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      })
    );

    const response = await get();

    expect(response.status).toBe(200);
    expectValidResponse('getDakisolatie', response);
    expect(response.body.huidigDak.dakoppervlakteM2).toBe(120);
    expect(response.body.advies.status).toBe('niet-beschikbaar');
    expect(response.body.advies.melding.burgerActie).toBe(
      'Wij kunnen het advies nu niet berekenen. Probeer het later opnieuw.'
    );
    expect(response.body.advies.opties).toBeUndefined();
    expect(response.body.acties.map((a) => a.type)).toEqual(['meer-over-subsidie']);
  });

  it.each([
    ['no result', () => []],
    ['a result without cost outputs', () => [{ aanbeveling: { value: '' } }]],
  ])('reports the advice as unavailable when the DMN gives %s', async (_, body) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, status: 200, json: async () => body() }))
    );

    const response = await get();

    expectValidResponse('getDakisolatie', response);
    expect(response.body.advies.status).toBe('niet-beschikbaar');
    expect(response.body.advies.opties).toBeUndefined();
    expect(response.body.acties.map((a) => a.type)).toEqual(['meer-over-subsidie']);
  });

  it('answers 404 for a property without building data', async () => {
    const response = await get('/api/v1/woningen/w-2c91/dakisolatie');

    expect(response.status).toBe(404);
    expectValidResponse('getDakisolatie', response);
  });
});
