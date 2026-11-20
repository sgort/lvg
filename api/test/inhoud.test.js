// The first deployed version must look finished: no response carries a design placeholder
// ({…}) any more; mock content takes its place (owner, 19 November 2026, plan Task 22).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handle } from '../src/core/router.js';
import { expectValidResponse } from './contract.js';

const PLACEHOLDER = /\{[A-Za-z][^{}]*\}/;

// A complete decision result, so the advice is calculated.
const operaton = vi.fn(async () => ({
  ok: true,
  status: 200,
  json: async () => [
    {
      extra_dikte_mm: { value: 112 },
      totale_kosten: { value: 4435 },
      subsidie: { value: 2185 },
      netto_kosten: { value: 2250 },
      besparing_jaar: { value: 640 },
      terugverdientijd: { value: 3.5 },
      aanbevolen: { value: false },
    },
  ],
}));

const get = (path) =>
  handle({
    method: 'GET',
    path,
    headers: { 'X-LVG-Scenario': 'drie-woningen' },
    env: { LVG_SCENARIOS: 'on', OPERATON_BASE_URL: 'https://operaton.example/engine-rest' },
  });

beforeEach(() => {
  vi.stubGlobal('fetch', operaton);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('mock content instead of placeholders', () => {
  it.each([
    '/api/v1/wonen',
    '/api/v1/woningen',
    '/api/v1/woningen/w-7f3a',
    '/api/v1/woningen/w-7f3a/kadaster',
    '/api/v1/woningen/w-7f3a/woz',
    '/api/v1/woningen/w-7f3a/energielabel',
    '/api/v1/woningen/w-7f3a/dakisolatie',
    '/api/v1/woningen/w-7f3a/aannemers',
    '/api/v1/woningen/w-2c91/woz',
  ])('%s carries no {…} placeholder', async (path) => {
    const response = await get(path);

    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).not.toMatch(PLACEHOLDER);
  });

  it('answers frequently asked questions on the property summary', async () => {
    const response = await get('/api/v1/woningen/w-7f3a');

    expectValidResponse('getWoning', response);
    expect(response.body.veelgesteldeVragen.vragen).toHaveLength(3);
  });

  it('offers the parcel map as a download', async () => {
    const response = await get('/api/v1/woningen/w-7f3a/kadaster');

    expect(response.body.kaart.download).toEqual({
      tekst: 'Download kadastrale kaart (png)',
      href: response.body.kaart.afbeelding.src,
    });
  });
});
