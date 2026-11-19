import { describe, expect, it } from 'vitest';

import { expectValidResponse } from '../../test/contract.js';
import { contract } from './contract.js';
import { handle } from './router.js';

const get = (path, headers = {}) => handle({ method: 'GET', path, headers, body: undefined });

describe('handle', () => {
  it('answers an unknown path with a 404 problem the citizen can act on', async () => {
    const response = await get('/api/v1/bestaat-niet');

    expect(response.status).toBe(404);
    expect(response.headers['Content-Type']).toBe('application/problem+json');
    expect(response.body.status).toBe(404);
    expect(response.body.burgerActie).toEqual(expect.any(String));
    expect(response.body.burgerActie.length).toBeGreaterThan(0);
  });

  it('refuses a language other than Dutch with 406', async () => {
    const response = await get('/api/v1/woningen', { 'Accept-Language': 'en' });

    expect(response.status).toBe(406);
    expect(response.headers['Content-Type']).toBe('application/problem+json');
    expect(response.body.burgerActie).toEqual(expect.any(String));
    expectValidResponse('listWoningen', response);
  });

  it('accepts Dutch, and a request without Accept-Language', async () => {
    expect((await get('/api/v1/openapi.json', { 'accept-language': 'nl' })).status).toBe(200);
    expect((await get('/api/v1/openapi.json')).status).toBe(200);
  });

  it.each([
    ['a browser that prefers Dutch', 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7'],
    ['a browser that accepts Dutch second', 'en-US,en;q=0.9,nl;q=0.8'],
    ['a regional Dutch tag', 'nl-BE'],
    ['any language', '*'],
    ['upper case and spaces', ' NL-nl ; q=0.5 , en'],
  ])('accepts %s', async (_, value) => {
    const response = await get('/api/v1/openapi.json', { 'Accept-Language': value });

    expect(response.status).toBe(200);
    expect(response.headers['Content-Language']).toBe('nl');
  });

  it.each([
    ['only other languages', 'en-US,en;q=0.9,de;q=0.8'],
    ['Dutch refused with q=0', 'nl;q=0,en'],
    ['a wildcard refused with q=0', '*;q=0'],
    ['a tag that only starts with nl', 'nld'],
  ])('refuses %s with 406', async (_, value) => {
    const response = await get('/api/v1/openapi.json', { 'Accept-Language': value });

    expect(response.status).toBe(406);
  });

  it.each([
    ['a success', '/api/v1/openapi.json', {}],
    ['a 404', '/api/v1/bestaat-niet', {}],
    ['a 406', '/api/v1/woningen', { 'Accept-Language': 'en' }],
  ])('sets Content-Language and API-Version on %s', async (_, path, headers) => {
    const response = await get(path, headers);

    expect(response.headers['Content-Language']).toBe('nl');
    expect(response.headers['API-Version']).toBe('1.1.0');
  });

  it('serves the contract at /api/v1/openapi.json', async () => {
    const response = await get('/api/v1/openapi.json');

    expect(response.status).toBe(200);
    expect(response.headers['Content-Type']).toBe('application/json');
    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.body).toEqual(contract);
    expect(response.body.info.title).toBe('LVG Wonen API');
    expectValidResponse('getOpenapi', response);
  });
});
