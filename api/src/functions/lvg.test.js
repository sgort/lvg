import { describe, expect, it } from 'vitest';

import { lvgHandler } from './lvg.js';

// A stand-in for the Azure HttpRequest: method, url, a Headers object and text().
const azureRequest = ({ method = 'GET', url, headers = {}, body }) => ({
  method,
  url,
  headers: new Headers(headers),
  text: async () => body ?? '',
});

describe('lvgHandler', () => {
  it('serves a GET through the core and returns JSON text with its headers', async () => {
    const response = await lvgHandler(
      azureRequest({ url: 'https://acc.lvg.open-regels.nl/api/v1/woningen?x=1' })
    );

    expect(response.status).toBe(200);
    expect(response.headers['Content-Language']).toBe('nl');
    // The default scenario, een-woning, goes straight to the only property.
    expect(JSON.parse(response.body).weergave).toBe('direct');
  });

  it('passes the request headers on', async () => {
    const response = await lvgHandler(
      azureRequest({
        url: 'https://acc.lvg.open-regels.nl/api/v1/wonen',
        headers: { 'Accept-Language': 'en' },
      })
    );

    expect(response.status).toBe(406);
  });

  it('passes a POST body on as text', async () => {
    const response = await lvgHandler(
      azureRequest({
        method: 'post',
        url: 'https://acc.lvg.open-regels.nl/api/v1/woningen/w-7f3a/toestemmingen',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aannemerId: 'a-91d2',
          gegevenssets: ['woning-en-dak', 'huidige-isolatie'],
          termijnDagen: 14,
        }),
      })
    );

    expect(response.status).toBe(201);
    expect(response.headers.Location).toMatch(/^\/api\/v1\/toestemmingen\/TS-/);
  });
});
