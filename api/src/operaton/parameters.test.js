import { describe, expect, it } from 'vitest';

import { operatonConfig } from './parameters.js';

describe('operatonConfig', () => {
  it('uses the local engine with the demo login by default', () => {
    expect(operatonConfig({})).toEqual({
      baseUrl: 'http://localhost:8081/engine-rest',
      user: 'demo',
      password: 'demo',
    });
  });

  it('sends no login to another engine unless one is set', () => {
    expect(
      operatonConfig({ OPERATON_BASE_URL: 'https://operaton.open-regels.nl/engine-rest/' })
    ).toEqual({
      baseUrl: 'https://operaton.open-regels.nl/engine-rest',
      user: undefined,
      password: undefined,
    });
  });

  it('treats an empty login as none, even locally', () => {
    expect(operatonConfig({ OPERATON_USER: '', OPERATON_PASSWORD: '' })).toMatchObject({
      user: undefined,
      password: undefined,
    });
  });
});
