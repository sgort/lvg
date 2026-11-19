import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';

import { getPageTitle } from './src/lib/siteInfo.js';

export default defineConfig(({ mode }) => {
  // VITE_SITE_URL is set by each deploy workflow and absent locally. The title is
  // written into index.html, so the tab is marked before any script runs.
  const siteUrl = loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL;
  const pageTitle = {
    name: 'environment-page-title',
    transformIndexHtml: (html) =>
      html.replace(
        /<title>([^<]*)<\/title>/,
        (_, title) => `<title>${getPageTitle(siteUrl, title)}</title>`
      ),
  };

  // No VITE_ prefix, so these values stay on the dev server and never reach the
  // browser bundle. Override the local defaults in .env.local if needed.
  const env = loadEnv(mode, process.cwd(), 'OPERATON_');
  const user = env.OPERATON_USER || 'demo';
  const password = env.OPERATON_PASSWORD || 'demo';

  return {
    plugins: [react(), pageTitle],
    test: {
      // The API has its own package, Node version and test run (`npm run test:api`).
      exclude: [...configDefaults.exclude, 'api/**'],
    },
    server: {
      proxy: {
        // The local Operaton requires a login, so the proxy adds it. Only the call
        // the app makes is forwarded: other sites can send requests to this dev
        // server, and they must not reach the rest of the engine with that login.
        '/api/engine-rest/decision-definition/key/bereken_isolatie_opties/evaluate': {
          target: 'http://localhost:8081',
          changeOrigin: true,
          auth: `${user}:${password}`,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
