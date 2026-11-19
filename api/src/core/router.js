// Routes requests to handlers. The table maps each contract operation to a plain function,
// so tests and both hosts (Azure Functions and the Vite dev server) share one entry point.
import { getAannemers } from '../resources/aannemers.js';
import { getDakisolatie } from '../resources/dakisolatie.js';
import { getEnergielabel } from '../resources/energielabel.js';
import { getKadaster } from '../resources/kadaster.js';
import { createToestemming, getToestemming } from '../resources/toestemmingen.js';
import { getWoning, listWoningen } from '../resources/woningen.js';
import { getWonen } from '../resources/wonen.js';
import { getWoz } from '../resources/woz.js';
import { contract } from './contract.js';
import { errorName, getHeader, json, LANGUAGE, problem, ProblemError } from './http.js';

export const BASE_PATH = '/api/v1';

const NOT_FOUND_ACTION = 'Ga naar de pagina Wonen in MijnOverheid.';
const RETRY_ACTION = 'Probeer het later opnieuw.';

const getOpenapi = async () => json(200, contract, { 'access-control-allow-origin': '*' });

/** The route table. Later tasks add one entry per contract operation. */
export const routes = [
  { method: 'GET', pattern: '/openapi.json', operationId: 'getOpenapi', handler: getOpenapi },
  { method: 'GET', pattern: '/wonen', operationId: 'getWonen', handler: getWonen },
  { method: 'GET', pattern: '/woningen', operationId: 'listWoningen', handler: listWoningen },
  { method: 'GET', pattern: '/woningen/{woningId}', operationId: 'getWoning', handler: getWoning },
  {
    method: 'GET',
    pattern: '/woningen/{woningId}/kadaster',
    operationId: 'getKadaster',
    handler: getKadaster,
  },
  { method: 'GET', pattern: '/woningen/{woningId}/woz', operationId: 'getWoz', handler: getWoz },
  {
    method: 'GET',
    pattern: '/woningen/{woningId}/energielabel',
    operationId: 'getEnergielabel',
    handler: getEnergielabel,
  },
  {
    method: 'GET',
    pattern: '/woningen/{woningId}/dakisolatie',
    operationId: 'getDakisolatie',
    handler: getDakisolatie,
  },
  {
    method: 'GET',
    pattern: '/woningen/{woningId}/aannemers',
    operationId: 'listAannemers',
    handler: getAannemers,
  },
  {
    method: 'POST',
    pattern: '/woningen/{woningId}/toestemmingen',
    operationId: 'createToestemming',
    handler: createToestemming,
  },
  {
    method: 'GET',
    pattern: '/toestemmingen/{kenmerk}',
    operationId: 'getToestemming',
    handler: getToestemming,
  },
];

// '/woningen/{woningId}/woz' → /^\/woningen\/([^/]+)\/woz$/ with names ['woningId'].
function compile(pattern) {
  const names = [];
  const source = pattern
    .split('/')
    .map((segment) => {
      const param = segment.match(/^\{(\w+)\}$/);
      if (!param) return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      names.push(param[1]);
      return '([^/]+)';
    })
    .join('/');
  return { regex: new RegExp(`^${source}$`), names };
}

// Operations that answer in any language: the contract is meant to be read by tools.
const LANGUAGE_FREE = new Set(['getOpenapi']);

// Only Dutch is offered for now. Language negotiation as in RFC 9110: Dutch is acceptable when
// `nl`, `nl-*` or `*` has q above 0, so a browser's own header works. An explicit `nl` or
// `nl-*` with q=0 refuses Dutch, whatever `*` says. A missing or empty header means any
// language.
function acceptsDutch(headers) {
  const value = getHeader(headers, 'Accept-Language')?.trim();
  if (!value) return true;
  const ranges = value.split(',').map((item) => {
    const [range, ...params] = item.split(';').map((part) => part.trim().toLowerCase());
    const q = params.find((p) => p.startsWith('q='));
    return { range, quality: q === undefined ? 1 : Number(q.slice(2)) };
  });
  const explicit = ranges.filter(
    ({ range }) => range === LANGUAGE || range.startsWith(`${LANGUAGE}-`)
  );
  if (explicit.some(({ quality }) => !(quality > 0))) return false;
  const wildcard = ranges.filter(({ range }) => range === '*');
  return [...explicit, ...wildcard].some(({ quality }) => quality > 0);
}

// A path segment that is not valid percent-encoding names nothing: null, so the route's 404.
function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch (error) {
    if (error instanceof URIError) return null;
    throw error;
  }
}

const notFound = () =>
  problem(404, 'Niet gevonden', 'Deze pagina bestaat niet (meer).', NOT_FOUND_ACTION);

function findRoute(compiled, method, path) {
  for (const route of compiled) {
    if (route.method !== method) continue;
    const match = path.match(route.regex);
    if (match) return { ...route, match };
  }
  return undefined;
}

export function createHandler(table) {
  const compiled = table.map((route) => ({ ...route, ...compile(route.pattern) }));

  return async function handle(request) {
    try {
      const path = request.path.startsWith(BASE_PATH) ? request.path.slice(BASE_PATH.length) : null;
      const route = path === null ? undefined : findRoute(compiled, request.method, path);

      if (!LANGUAGE_FREE.has(route?.operationId) && !acceptsDutch(request.headers)) {
        return problem(
          406,
          'Taal niet beschikbaar',
          'Deze gegevens zijn alleen in het Nederlands beschikbaar.',
          'Bekijk deze pagina in het Nederlands.'
        );
      }

      if (!route) return notFound();

      const values = route.match.slice(1).map(decodeSegment);
      if (values.includes(null)) return notFound();
      const params = Object.fromEntries(route.names.map((name, i) => [name, values[i]]));
      return await route.handler({ ...request, params, operationId: route.operationId });
    } catch (error) {
      if (error instanceof ProblemError) return error.toResponse();
      // Log the error's name only: its message or stack can contain request data.
      console.error('[lvg-api] unhandled error:', errorName(error));
      return problem(500, 'Er ging iets mis', undefined, RETRY_ACTION);
    }
  };
}

export const handle = createHandler(routes);
