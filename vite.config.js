import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { configDefaults } from 'vitest/config';

import { getPageTitle } from './src/lib/siteInfo.ts';
import { luxCssPlugin } from './vite/luxCssPlugin.js';
import { lvgApiPlugin } from './vite/lvgApiPlugin.js';
import { swaHeadersPlugin } from './vite/swaHeadersPlugin.js';

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

  return {
    // lvgApiPlugin serves the LVG API on /api/ in the dev server only. It calls Operaton
    // itself, so the browser never talks to Operaton and no login reaches the bundle.
    // luxCssPlugin moves the LUX components' styles into a stylesheet, so the strict CSP holds.
    // swaHeadersPlugin gives `vite preview` the deployed sites' headers, including the CSP.
    plugins: [react(), pageTitle, lvgApiPlugin(), luxCssPlugin(), swaHeadersPlugin()],
    test: {
      // The API has its own package, Node version and test run (`npm run test:api`).
      exclude: [...configDefaults.exclude, 'api/**'],
      setupFiles: ['src/test/setup.ts'],
    },
  };
});
