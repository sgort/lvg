import { describe, expect, it } from 'vitest';

import { formatDatum, formatEuro, formatGetal } from './format';

// Intl puts a no-break space between the euro sign and the amount.
const NBSP = ' ';

describe('format', () => {
  it('formats a whole amount in euros without decimals', () => {
    expect(formatEuro(4080)).toBe(`€${NBSP}4.080`);
  });

  it('keeps the cents of an amount that has them', () => {
    expect(formatEuro(37.5)).toBe(`€${NBSP}37,50`);
  });

  it('formats a date as day, month and year in Dutch', () => {
    expect(formatDatum('2025-01-01')).toBe('1 januari 2025');
  });

  it('formats a number with a decimal comma', () => {
    expect(formatGetal(2.8)).toBe('2,8');
    expect(formatGetal(0.035)).toBe('0,035');
  });
});
