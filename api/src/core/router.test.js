import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProblemError } from './http.js';
import { createHandler } from './router.js';

const request = (method, path, body) => ({ method, path, headers: {}, body });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createHandler', () => {
  it('passes path parameters, the request and the operation to the handler', async () => {
    const handler = vi.fn(async () => ({ status: 200, body: { ok: true } }));
    const handle = createHandler([
      { method: 'GET', pattern: '/woningen/{woningId}/woz', operationId: 'getWoz', handler },
    ]);

    const response = await handle(request('GET', '/api/v1/woningen/w-7f3a/woz'));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ params: { woningId: 'w-7f3a' }, operationId: 'getWoz' })
    );
  });

  it('matches the method as well as the path', async () => {
    const handle = createHandler([
      { method: 'GET', pattern: '/wonen', operationId: 'getWonen', handler: async () => ({}) },
    ]);

    expect((await handle(request('POST', '/api/v1/wonen'))).status).toBe(404);
  });

  it('turns a ProblemError into its problem response', async () => {
    const handle = createHandler([
      {
        method: 'GET',
        pattern: '/woningen/{woningId}',
        operationId: 'getWoning',
        handler: async () => {
          throw new ProblemError(404, 'Woning niet gevonden', undefined, 'Ga terug.');
        },
      },
    ]);

    const response = await handle(request('GET', '/api/v1/woningen/w-0000'));

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      title: 'Woning niet gevonden',
      burgerActie: 'Ga terug.',
    });
  });

  it('turns any other error into a 500 problem and logs only its name', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handle = createHandler([
      {
        method: 'POST',
        pattern: '/woningen/{woningId}/toestemmingen',
        operationId: 'createToestemming',
        handler: async () => {
          throw new Error('fetch failed for https://bron.example/woningen/Voorbeeldlaan%2073');
        },
      },
    ]);

    const response = await handle(
      request('POST', '/api/v1/woningen/w-7f3a/toestemmingen', { aannemerId: 'geheim' })
    );

    expect(response.status).toBe(500);
    expect(response.body.burgerActie).toBe('Probeer het later opnieuw.');
    expect(response.headers['Content-Language']).toBe('nl');
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).toContain('Error');
    expect(logged).not.toContain('https://');
    expect(logged).not.toContain('w-7f3a');
    expect(logged).not.toContain('geheim');
  });
});
