// Vite plugin: gives `vite preview` the same response headers as the deployed Static Web Apps,
// read from the `globalHeaders` of public/staticwebapp.config.json. So the built site is
// checked locally, and in the walkthroughs, under the same Content-Security-Policy. The dev
// server gets none: it needs inline styles and scripts for hot reloading.
import { readFileSync } from 'node:fs';

const CONFIG = new URL('../public/staticwebapp.config.json', import.meta.url);

export function swaHeadersPlugin() {
  return {
    name: 'swa-headers',
    configurePreviewServer(server) {
      const { globalHeaders = {} } = JSON.parse(readFileSync(CONFIG, 'utf8'));
      server.middlewares.use((_req, res, next) => {
        for (const [naam, waarde] of Object.entries(globalHeaders)) res.setHeader(naam, waarde);
        next();
      });
    },
  };
}
