import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { swaHeadersPlugin } from './swaHeadersPlugin.js';

const config = JSON.parse(
  readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8')
);

describe('swaHeadersPlugin', () => {
  it('adds every globalHeaders entry of staticwebapp.config.json to preview responses', () => {
    const plugin = swaHeadersPlugin();
    const use = vi.fn();
    plugin.configurePreviewServer({ middlewares: { use } });
    const headers = {};
    const next = vi.fn();

    use.mock.calls[0][0]({}, { setHeader: (naam, waarde) => (headers[naam] = waarde) }, next);

    expect(Object.keys(config.globalHeaders).length).toBeGreaterThan(0);
    expect(headers).toEqual(config.globalHeaders);
    expect(next).toHaveBeenCalledOnce();
  });

  it('sends a strict Content-Security-Policy, without unsafe-inline or unsafe-eval', () => {
    const csp = config.globalHeaders['Content-Security-Policy'];

    expect(csp).toContain("style-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/unsafe-(inline|eval)/);
  });

  it('adds nothing to the dev server', () => {
    expect(swaHeadersPlugin().configureServer).toBeUndefined();
  });
});
