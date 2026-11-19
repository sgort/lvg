import { beforeEach, describe, expect, it } from 'vitest';

import { getSession, login, logout, resetSessionForTests } from './authService';

beforeEach(() => resetSessionForTests());

describe('authService', () => {
  it('starts logged out', async () => {
    expect(await getSession()).toBeNull();
  });

  it('logs in and out', async () => {
    expect(await login()).toEqual({ user: 'demo' });
    expect(await getSession()).toEqual({ user: 'demo' });
    expect(await logout()).toBeNull();
    expect(await getSession()).toBeNull();
  });
});
