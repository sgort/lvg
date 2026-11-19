// Every resource tells the page how the citizen's property list behaves (`woning.overzicht`),
// so a page can leave out a step to the list when the list would only lead back here.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handle } from '../src/core/router.js';
import { expectValidResponse } from './contract.js';

const get = (path, scenario) =>
  handle({
    method: 'GET',
    path,
    headers: { 'X-LVG-Scenario': scenario },
    env: { LVG_SCENARIOS: 'on', OPERATON_BASE_URL: 'http://127.0.0.1:9/engine-rest' },
  });

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('woning.overzicht', () => {
  it.each([
    ['getWoning', '/api/v1/woningen/w-7f3a'],
    ['getKadaster', '/api/v1/woningen/w-7f3a/kadaster'],
    ['getWoz', '/api/v1/woningen/w-7f3a/woz'],
    ['getEnergielabel', '/api/v1/woningen/w-7f3a/energielabel'],
    ['getDakisolatie', '/api/v1/woningen/w-7f3a/dakisolatie'],
    ['listAannemers', '/api/v1/woningen/w-7f3a/aannemers'],
  ])('%s says direct for a citizen with one property, lijst for several', async (id, path) => {
    const een = await get(path, 'een-woning');
    const drie = await get(path, 'drie-woningen');

    expectValidResponse(id, een);
    expect(een.body.woning.overzicht).toBe('direct');
    expect(drie.body.woning.overzicht).toBe('lijst');
  });
});
