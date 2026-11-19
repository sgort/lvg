import { describe, expect, it } from 'vitest';

import { createLatestRequest } from './latestRequest';

describe('createLatestRequest', () => {
  it('treats only the newest token as current', () => {
    const guard = createLatestRequest();
    const first = guard.next();
    const second = guard.next();
    expect(guard.isCurrent(first)).toBe(false);
    expect(guard.isCurrent(second)).toBe(true);
  });

  it('keeps separate guards independent', () => {
    const personal = createLatestRequest();
    const building = createLatestRequest();
    const token = personal.next();
    building.next();
    expect(personal.isCurrent(token)).toBe(true);
  });
});
