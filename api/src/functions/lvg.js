// Azure Functions (programming model v4) adapter: one HTTP function serves the whole API.
// Static Web Apps prefixes managed functions with /api, so the route v1/{*path} answers
// /api/v1/... The core handler does everything else; settings come from the app settings.
import { app } from '@azure/functions';

import { handle } from '../core/router.js';

/** Converts an Azure HttpRequest to the core request and the core response back. */
export async function lvgHandler(request) {
  const method = request.method.toUpperCase();
  const response = await handle({
    method,
    path: new URL(request.url).pathname,
    headers: Object.fromEntries(request.headers.entries()),
    body: method === 'GET' || method === 'HEAD' ? undefined : await request.text(),
  });
  return {
    status: response.status,
    headers: response.headers,
    body: response.body === undefined ? undefined : JSON.stringify(response.body),
  };
}

app.http('lvg', {
  route: 'v1/{*path}',
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: lvgHandler,
});
