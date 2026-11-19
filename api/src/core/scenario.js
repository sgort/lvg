// Which simulated citizen a request is for. The X-LVG-Scenario header is honoured only
// when LVG_SCENARIOS=on, which is set on acc, previews and locally, never in production.
import { scenarios } from '../mock/scenarios.js';
import { getHeader } from './http.js';

export const DEFAULT_SCENARIO = 'drie-woningen';

export function resolveScenario(headers, env) {
  if (env?.LVG_SCENARIOS !== 'on') return DEFAULT_SCENARIO;
  const requested = getHeader(headers, 'X-LVG-Scenario');
  return Object.hasOwn(scenarios, requested ?? '') ? requested : DEFAULT_SCENARIO;
}
