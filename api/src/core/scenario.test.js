import { describe, expect, it } from 'vitest';

import { DEFAULT_SCENARIO, resolveScenario } from './scenario.js';

const on = { LVG_SCENARIOS: 'on' };

describe('resolveScenario', () => {
  it('defaults to een-woning', () => {
    expect(DEFAULT_SCENARIO).toBe('een-woning');
    expect(resolveScenario({}, on)).toBe('een-woning');
  });

  it('honours the header only when LVG_SCENARIOS is on', () => {
    const headers = { 'X-LVG-Scenario': 'geen-woning' };
    expect(resolveScenario(headers, on)).toBe('geen-woning');
    expect(resolveScenario(headers, {})).toBe('een-woning');
    expect(resolveScenario(headers, { LVG_SCENARIOS: 'off' })).toBe('een-woning');
    expect(resolveScenario(headers, { LVG_SCENARIOS: 'true' })).toBe('een-woning');
  });

  it('reads the header case-insensitively', () => {
    expect(resolveScenario({ 'x-lvg-scenario': 'een-woning' }, on)).toBe('een-woning');
  });

  it('falls back to een-woning for an unknown scenario', () => {
    expect(resolveScenario({ 'X-LVG-Scenario': 'alle-woningen' }, on)).toBe('een-woning');
  });
});
