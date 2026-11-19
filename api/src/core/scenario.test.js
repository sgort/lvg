import { describe, expect, it } from 'vitest';

import { DEFAULT_SCENARIO, resolveScenario } from './scenario.js';

const on = { LVG_SCENARIOS: 'on' };

describe('resolveScenario', () => {
  it('defaults to drie-woningen', () => {
    expect(DEFAULT_SCENARIO).toBe('drie-woningen');
    expect(resolveScenario({}, on)).toBe('drie-woningen');
  });

  it('honours the header only when LVG_SCENARIOS is on', () => {
    const headers = { 'X-LVG-Scenario': 'geen-woning' };
    expect(resolveScenario(headers, on)).toBe('geen-woning');
    expect(resolveScenario(headers, {})).toBe('drie-woningen');
    expect(resolveScenario(headers, { LVG_SCENARIOS: 'off' })).toBe('drie-woningen');
    expect(resolveScenario(headers, { LVG_SCENARIOS: 'true' })).toBe('drie-woningen');
  });

  it('reads the header case-insensitively', () => {
    expect(resolveScenario({ 'x-lvg-scenario': 'een-woning' }, on)).toBe('een-woning');
  });

  it('falls back to drie-woningen for an unknown scenario', () => {
    expect(resolveScenario({ 'X-LVG-Scenario': 'alle-woningen' }, on)).toBe('drie-woningen');
  });
});
