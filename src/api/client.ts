// The only place that talks to the network. It adds the language and the development
// scenario, gives up after 15 seconds, and turns every failure into an ApiError that carries
// what the citizen can do (burgerActie). Every answer is validated before it is returned.
import type { z } from 'zod';

import { Probleem } from './schemas';

export const API_BASIS = '/api/v1';

/** Where the stand-in frame keeps the chosen scenario. Holds a scenario name only. */
export const SCENARIO_SLEUTEL = 'lvg-scenario';
export const STANDAARD_SCENARIO = 'drie-woningen';

const TIMEOUT_MS = 15_000;
const LATER_OPNIEUW = 'Probeer het later opnieuw.';
const VERBINDING = 'Controleer uw internetverbinding en probeer het opnieuw.';

export class ApiError extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail?: string;
  readonly burgerActie: string;

  constructor({ status, title, detail, burgerActie }: Omit<Probleem, 'type' | 'instance'>) {
    super(title);
    this.name = 'ApiError';
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.burgerActie = burgerActie;
  }
}

// Read when a request is made (in a loader or action), never while rendering.
function gekozenScenario(): string {
  try {
    return globalThis.sessionStorage?.getItem(SCENARIO_SLEUTEL) ?? STANDAARD_SCENARIO;
  } catch {
    return STANDAARD_SCENARIO;
  }
}

async function leesJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
}

async function verzoek<T>(
  method: 'GET' | 'POST',
  pad: string,
  schema: z.ZodType<T>,
  body?: unknown
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_BASIS}${pad}`, {
      method,
      headers: {
        'Accept-Language': 'nl',
        'X-LVG-Scenario': gekozenScenario(),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw controller.signal.aborted
      ? new ApiError({ status: 504, title: 'Geen antwoord', burgerActie: LATER_OPNIEUW })
      : new ApiError({ status: 0, title: 'Geen verbinding', burgerActie: VERBINDING });
  } finally {
    clearTimeout(timer);
  }

  const data = await leesJson(response);
  if (!response.ok) {
    const probleem = Probleem.safeParse(data);
    throw new ApiError(
      probleem.success
        ? probleem.data
        : { status: response.status, title: 'Er ging iets mis', burgerActie: LATER_OPNIEUW }
    );
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ApiError({
      status: response.status,
      title: 'Onverwacht antwoord',
      burgerActie: LATER_OPNIEUW,
    });
  }
  return parsed.data;
}

export const apiGet = <T>(pad: string, schema: z.ZodType<T>): Promise<T> =>
  verzoek('GET', pad, schema);

export const apiPost = <T>(pad: string, body: unknown, schema: z.ZodType<T>): Promise<T> =>
  verzoek('POST', pad, schema, body);
