import { Readable } from 'node:stream';

import { describe, expect, it, vi } from 'vitest';

import { createApiMiddleware, devApiEnv } from './lvgApiPlugin.js';

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
  it('defaults to local Operaton with the demo login and scenarios on', () => {
    expect(devApiEnv('test', '/nonexistent')).toEqual({
      OPERATON_BASE_URL: 'http://localhost:8081/engine-rest',
      OPERATON_USER: 'demo',
      OPERATON_PASSWORD: 'demo',
      LVG_SCENARIOS: 'on',
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

  it('sends no body to the core for a GET', async () => {
    const handle = vi.fn(async () => ({ status: 200, headers: {}, body: {} }));

    await createApiMiddleware(handle, {})(
      fakeRequest({ originalUrl: '/api/v1/wonen' }),
      fakeResponse()
    );

    expect(handle.mock.calls[0][0].body).toBeUndefined();
  });
});
