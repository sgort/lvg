// Dev-only Vite plugin: serves the LVG API on /api/ in the dev server with the same core
// handler Azure runs, so `npm run dev` needs no Azure tooling. Operaton settings stay in
// this server process; nothing here reaches the browser bundle.
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { loadEnv } from 'vite';

// The local Operaton and its demo login are the API's own defaults (operatonConfig), which
// it applies only to the local engine. Setting them here as well would send the demo login
// to any engine set in OPERATON_BASE_URL.
const DEFAULTS = {
  LVG_SCENARIOS: 'on',
};

/** The API's settings for local development: .env files over the defaults. */
export function devApiEnv(mode, cwd) {
  return { ...DEFAULTS, ...loadEnv(mode, cwd, ['OPERATON_', 'LVG_']) };
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

/** Connect middleware around the core handler. */
export function createApiMiddleware(handle, env) {
  return async (req, res) => {
    try {
      const method = (req.method ?? 'GET').toUpperCase();
      // Connect strips the mount path from req.url; originalUrl keeps /api/...
      const url = new URL(req.originalUrl ?? req.url, 'http://localhost');
      const response = await handle({
        method,
        path: url.pathname,
        headers: req.headers,
        body: method === 'GET' || method === 'HEAD' ? undefined : await readBody(req),
        env,
      });
      res.statusCode = response.status;
      for (const [name, value] of Object.entries(response.headers ?? {})) {
        res.setHeader(name, value);
      }
      res.end(response.body === undefined ? undefined : JSON.stringify(response.body));
    } catch (error) {
      console.error('[lvg-api dev]', error?.message ?? String(error));
      res.statusCode = 500;
      res.end();
    }
  };
}

export function lvgApiPlugin() {
  let env;
  let root;
  return {
    name: 'lvg-api',
    // The dev server only: not in a build, and not in Vitest, which also starts a server.
    apply: (_config, { command }) => command === 'serve' && !process.env.VITEST,
    configResolved(config) {
      root = config.root;
      env = devApiEnv(config.mode, root);
    },
    async configureServer(server) {
      // Node's own import, not Vite's module loader: the API is a separate Node package
      // with its own dependencies. Changes in api/ need a dev server restart.
      const routerUrl = pathToFileURL(path.join(root, 'api/src/core/router.js')).href;
      const { handle } = await import(routerUrl);
      server.middlewares.use('/api/', createApiMiddleware(handle, env));
    },
  };
}
