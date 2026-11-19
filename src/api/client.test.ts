import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { ApiError, apiGet, apiPost, SCENARIO_SLEUTEL } from './client';

const Body = z.object({ ok: z.boolean() });

const antwoord = (status: number, body: unknown, contentType = 'application/json') =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': contentType } });

const opgeslagen = new Map<string, string>();

beforeEach(() => {
  opgeslagen.clear();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => opgeslagen.get(key) ?? null,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const fout = async (promise: Promise<unknown>): Promise<ApiError> => {
  const error = await promise.then(
    () => undefined,
    (e: unknown) => e
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
};

const aanroep = (fetch: { mock: { calls: unknown[][] } }) =>
  fetch.mock.calls[0] as [string, RequestInit];

describe('apiGet', () => {
  it('asks for Dutch and the default scenario under /api/v1', async () => {
    const fetch = vi.fn(() => Promise.resolve(antwoord(200, { ok: true })));
    vi.stubGlobal('fetch', fetch);

    await expect(apiGet('/wonen', Body)).resolves.toEqual({ ok: true });

    const [url, init] = aanroep(fetch);
    expect(url).toBe('/api/v1/wonen');
    expect(init.headers).toMatchObject({
      'Accept-Language': 'nl',
      'X-LVG-Scenario': 'drie-woningen',
    });
  });

  it('sends the scenario chosen in the stand-in frame', async () => {
    opgeslagen.set(SCENARIO_SLEUTEL, 'een-woning');
    const fetch = vi.fn(() => Promise.resolve(antwoord(200, { ok: true })));
    vi.stubGlobal('fetch', fetch);

    await apiGet('/woningen', Body);

    expect(aanroep(fetch)[1].headers).toMatchObject({ 'X-LVG-Scenario': 'een-woning' });
  });

  it('turns a problem+json answer into an ApiError with its burgerActie', async () => {
    const probleem = {
      type: 'about:blank',
      title: 'Woning niet gevonden',
      status: 404,
      detail: 'Deze woning bestaat niet.',
      burgerActie: 'Ga terug naar uw koopwoningen.',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(antwoord(404, probleem, 'application/problem+json')))
    );

    const error = await fout(apiGet('/woningen/w-0000', Body));

    expect(error).toMatchObject({
      status: 404,
      title: 'Woning niet gevonden',
      detail: 'Deze woning bestaat niet.',
      burgerActie: 'Ga terug naar uw koopwoningen.',
    });
  });

  it('treats a body that does not match its schema as an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(antwoord(200, { ok: 'ja' })))
    );

    const error = await fout(apiGet('/wonen', Body));

    expect(error.burgerActie).toBe('Probeer het later opnieuw.');
  });

  it('tells the citizen to check the connection when the network fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    );

    const error = await fout(apiGet('/wonen', Body));

    expect(error.burgerActie).toBe('Controleer uw internetverbinding en probeer het opnieuw.');
  });

  it('gives up after 15 seconds', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError'))
            );
          })
      )
    );

    const pending = fout(apiGet('/wonen', Body));
    await vi.advanceTimersByTimeAsync(15_000);
    const error = await pending;

    expect(error.burgerActie).toBe('Probeer het later opnieuw.');
  });
});

describe('apiPost', () => {
  it('posts JSON and validates the answer', async () => {
    const fetch = vi.fn(() => Promise.resolve(antwoord(201, { ok: true })));
    vi.stubGlobal('fetch', fetch);

    await expect(apiPost('/woningen/w-7f3a/toestemmingen', { a: 1 }, Body)).resolves.toEqual({
      ok: true,
    });

    const [, init] = aanroep(fetch);
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });
});
