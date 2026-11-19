// Responses in the shape every handler returns: { status, headers, body }. The Azure
// Functions adapter and the Vite plugin turn this into a real HTTP response.
import { API_VERSION } from './contract.js';

export const LANGUAGE = 'nl';

export const standardHeaders = () => ({
  'Content-Language': LANGUAGE,
  'API-Version': API_VERSION,
});

export function json(status, body, headers = {}) {
  return {
    status,
    headers: { ...standardHeaders(), 'Content-Type': 'application/json', ...headers },
    body,
  };
}

/**
 * An RFC 9457 problem with the text the citizen sees about what to do next.
 *
 * @param {number} status
 * @param {string} title
 * @param {string | undefined} detail
 * @param {string} burgerActie
 */
export function problem(status, title, detail, burgerActie) {
  const body = { type: 'about:blank', title, status, burgerActie };
  if (detail) body.detail = detail;
  return {
    status,
    headers: { ...standardHeaders(), 'Content-Type': 'application/problem+json' },
    body,
  };
}

/** Thrown by handlers and sources to answer with a specific problem. */
export class ProblemError extends Error {
  constructor(status, title, detail, burgerActie) {
    super(title);
    this.name = 'ProblemError';
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.burgerActie = burgerActie;
  }

  toResponse() {
    return problem(this.status, this.title, this.detail, this.burgerActie);
  }
}

/** Case-insensitive header lookup, for plain objects and Headers alike. */
export function getHeader(headers, name) {
  if (!headers) return undefined;
  if (typeof headers.get === 'function') return headers.get(name) ?? undefined;
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : headers[key];
}
