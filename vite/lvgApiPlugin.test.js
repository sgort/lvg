import { Readable } from 'node:stream';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { operatonConfig } from '../api/src/operaton/parameters.js';
import { createApiMiddleware, devApiEnv, lvgApiPlugin } from './lvgApiPlugin.js';

const fakeResponse = () => {
  const res = { statusCode: 0, headers: {}, body: undefined };
  res.setHeader = (name, value) => (res.headers[name] = value);
  res.end = (body) => (res.body = body);
  return res;
};

const fakeRequest = ({ method = 'GET', originalUrl, body }) =>
  Object.assign(Readable.from(body === undefined ? [] : [body]), {
    method,
    originalUrl,
    url: originalUrl.replace(/^\/api/, ''),
    headers: { 'accept-language': 'nl' },
  });

describe('devApiEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to local Operaton with the demo login and scenarios on', () => {
    expect(operatonConfig(devApiEnv('test', '/nonexistent'))).toEqual({
      baseUrl: 'http://localhost:8081/engine-rest',
      user: 'demo',
      password: 'demo',
    });
    expect(devApiEnv('test', '/nonexistent').LVG_SCENARIOS).toBe('on');
  });

  it('sends no demo login when only a remote engine is set', () => {
    vi.stubEnv('OPERATON_BASE_URL', 'https://operaton.open-regels.nl/engine-rest');

    expect(operatonConfig(devApiEnv('test', '/nonexistent'))).toEqual({
      baseUrl: 'https://operaton.open-regels.nl/engine-rest',
      user: undefined,
      password: undefined,
    });
  });
});

describe('createApiMiddleware', () => {
  it('passes path, headers, body and the dev settings to the core', async () => {
    const handle = vi.fn(async () => ({
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: { ok: true },
    }));
    const env = { LVG_SCENARIOS: 'on' };
    const res = fakeResponse();

    await createApiMiddleware(handle, env)(
      fakeRequest({
        method: 'POST',
        originalUrl: '/api/v1/woningen/w-7f3a/toestemmingen?debug=1',
        body: '{"a":1}',
      }),
      res
    );

    expect(handle).toHaveBeenCalledWith({
      method: 'POST',
      path: '/api/v1/woningen/w-7f3a/toestemmingen',
      headers: { 'accept-language': 'nl' },
      body: '{"a":1}',
      env,
    });
    expect(res.statusCode).toBe(201);
    expect(res.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(res.body)).toEqual({ ok: true });
  });

  it('logs only the name of an error', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handle = vi.fn(async () => {
      throw new TypeError('fetch failed for https://bron.example/Voorbeeldlaan');
    });
    const res = fakeResponse();

    await createApiMiddleware(handle, {})(fakeRequest({ originalUrl: '/api/v1/wonen' }), res);

    expect(res.statusCode).toBe(500);
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).toContain('TypeError');
    expect(logged).not.toContain('https://');
  });

  it('sends no body to the core for a GET', async () => {
    const handle = vi.fn(async () => ({ status: 200, headers: {}, body: {} }));

    await createApiMiddleware(handle, {})(
      fakeRequest({ originalUrl: '/api/v1/wonen' }),
      fakeResponse()
    );

    expect(handle.mock.calls[0][0].body).toBeUndefined();
  });
});

describe('lvgApiPlugin in vite preview', () => {
  it('serves the API on /api/ with the same settings as the dev server', async () => {
    const plugin = lvgApiPlugin();
    const use = vi.fn();
    plugin.configResolved({ root: process.cwd(), mode: 'test' });

    await plugin.configurePreviewServer({ middlewares: { use } });

    expect(use).toHaveBeenCalledWith('/api/', expect.any(Function));
    const middleware = use.mock.calls[0][1];
    const res = fakeResponse();
    const req = fakeRequest({ originalUrl: '/api/v1/woningen' });
    req.headers['x-lvg-scenario'] = 'een-woning';
    await middleware(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).weergave).toBe('direct');
  });
});
