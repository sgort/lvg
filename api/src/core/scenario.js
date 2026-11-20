// Which simulated citizen a request is for. The X-LVG-Scenario header is honoured only
// when LVG_SCENARIOS=on, which is set on acc, previews and locally, never in production.
import { scenarios } from '../mock/scenarios.js';
import { getHeader } from './http.js';

// One property, so every environment shows the same path through the pages: Wonen, then
// straight to that property (agreed with the owner on 19 November 2026, plan Task 21).
export const DEFAULT_SCENARIO = 'een-woning';

export function resolveScenario(headers, env) {
  if (env?.LVG_SCENARIOS !== 'on') return DEFAULT_SCENARIO;
  const requested = getHeader(headers, 'X-LVG-Scenario');
  return Object.hasOwn(scenarios, requested ?? '') ? requested : DEFAULT_SCENARIO;
}
