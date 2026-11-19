import { describe, expect, it, vi } from 'vitest';

import { evaluateIsolatie } from './client.js';

// Carried over from src/services/operatonService.test.js: the call to Operaton moved from
// the browser to the API.
const BASE_URL = 'https://operaton.example/engine-rest';
const EVALUATE_URL = `${BASE_URL}/decision-definition/key/bereken_isolatie_opties/evaluate`;

const params = {
  huidige_r_waarde: 2.8,
  dak_oppervlakte_m2: 120,
  lambda_w_mk: 0.035,
  materiaal_cost_per_m3: 80,
  install_cost_per_m2_per_100mm: 25,
  doel_r_waarde: 6,
};

const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });

describe('evaluateIsolatie', () => {
  it('posts the inputs with their types to the decision on baseUrl', async () => {
    const fetch = vi.fn(async () => okResponse([{ totale_kosten: { value: 2400 } }]));

    const result = await evaluateIsolatie(params, { baseUrl: BASE_URL, fetch });

    expect(result).toEqual({ totale_kosten: { value: 2400 } });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(EVALUATE_URL);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      variables: {
        huidige_r_waarde: { value: 2.8, type: 'Double' },
        dak_oppervlakte_m2: { value: 120, type: 'Double' },
        lambda_w_mk: { value: 0.035, type: 'Double' },
        materiaal_cost_per_m3: { value: 80, type: 'Integer' },
        install_cost_per_m2_per_100mm: { value: 25, type: 'Integer' },
        doel_r_waarde: { value: 6, type: 'Double' },
      },
    });
  });

  it('sends no Authorization header without a login', async () => {
    const fetch = vi.fn(async () => okResponse([{}]));

    await evaluateIsolatie(params, { baseUrl: BASE_URL, fetch });

    expect(fetch.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('sends Basic authentication when a login is set', async () => {
    const fetch = vi.fn(async () => okResponse([{}]));

    await evaluateIsolatie(params, { baseUrl: BASE_URL, user: 'demo', password: 'demo', fetch });

    expect(fetch.mock.calls[0][1].headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from('demo:demo').toString('base64')}`,
    });
  });

  it('limits each call to 10 seconds', async () => {
    const fetch = vi.fn(async () => okResponse([{}]));

    await evaluateIsolatie(params, { baseUrl: BASE_URL, fetch });

    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it('throws on a non-OK response', async () => {
    const fetch = vi.fn(async () => ({ ok: false, status: 500, text: async () => 'boom' }));

    await expect(evaluateIsolatie(params, { baseUrl: BASE_URL, fetch })).rejects.toThrow(
      'DMN evaluation failed (500)'
    );
  });
});
