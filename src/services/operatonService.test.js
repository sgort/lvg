import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchAllCalculations, transformOperatonResult } from './operatonService';

const EVALUATE_URL = '/api/engine-rest/decision-definition/key/bereken_isolatie_opties/evaluate';

const baseParams = {
  huidige_r_waarde: 2.8,
  dak_oppervlakte_m2: 120,
  lambda_w_mk: 0.035,
  materiaal_cost_per_m3: 80,
  install_cost_per_m2_per_100mm: 25,
};

const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchAllCalculations', () => {
  it('evaluates the decision for R 3, 4, 6 and 8 without an Authorization header', async () => {
    const fetchMock = vi.fn(async () => okResponse([{ totale_kosten: { value: 2400 } }]));
    vi.stubGlobal('fetch', fetchMock);

    await fetchAllCalculations(baseParams);

    expect(fetchMock).toHaveBeenCalledTimes(4);
    const targets = fetchMock.mock.calls.map(([url, init]) => {
      expect(url).toBe(EVALUATE_URL);
      expect(init.method).toBe('POST');
      expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
      return JSON.parse(init.body).variables.doel_r_waarde.value;
    });
    expect(targets).toEqual([3, 4, 6, 8]);
  });

  it('turns a non-OK response into an error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 500, text: async () => 'boom' }))
    );

    await expect(fetchAllCalculations(baseParams)).rejects.toThrow(
      'DMN evaluation failed (500): boom'
    );
  });
});

describe('transformOperatonResult', () => {
  it('maps a decision result to the table row', () => {
    const row = transformOperatonResult(
      {
        delta_r: { value: 3.2 },
        extra_dikte_mm: { value: 112 },
        totale_kosten: { value: 2400 },
        subsidie: { value: 500 },
        netto_kosten: { value: 1900 },
        besparing_jaar: { value: 300 },
        terugverdientijd: { value: 6.3 },
        aanbeveling: { value: 'Aanbevolen' },
      },
      6,
      120
    );

    expect(row).toEqual({
      doel_R: 6,
      delta_R: 3.2,
      extra_dikte_mm: 112,
      kost_per_m2_eur: 20,
      totale_kost_eur: 2400,
      subsidie_eur: 500,
      netto_kost_eur: 1900,
      jaarlijkse_besparing_eur: 300,
      terugverdientijd_jaar: 6.3,
      aanbeveling: 'Aanbevolen',
    });
  });
});
