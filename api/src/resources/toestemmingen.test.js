import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectValidResponse } from '../../test/contract.js';
import { handle } from '../core/router.js';
import { resetToestemmingenForTests } from './toestemmingen.js';

const VERPLICHT = ['woning-en-dak', 'huidige-isolatie'];

const geef = (body, woningId = 'w-7f3a', headers = {}) =>
  handle({
    method: 'POST',
    path: `/api/v1/woningen/${woningId}/toestemmingen`,
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });

const bekijk = (kenmerk, headers = {}) =>
  handle({ method: 'GET', path: `/api/v1/toestemmingen/${kenmerk}`, headers });

const aanvraag = (extra = {}) => ({
  aannemerId: 'a-91d2',
  gegevenssets: [...VERPLICHT, 'energiegegevens'],
  termijnDagen: 14,
  ...extra,
});

beforeEach(() => {
  resetToestemmingenForTests();
  vi.useFakeTimers({ now: new Date('2026-11-19T12:00:00Z'), toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('POST /woningen/{id}/toestemmingen', () => {
  it.each([
    ['the text null', 'null'],
    ['the value null', null],
    ['a JSON array', '[]'],
    ['a JSON string', '"aanvraag"'],
  ])('answers 400 for %s as body', async (_, body) => {
    const response = await geef(body);

    expect(response.status).toBe(400);
    expect(response.body.title).toBe('Aanvraag niet leesbaar');
    expectValidResponse('createToestemming', response);
  });

  it('creates a consent with a kenmerk, validity and Location', async () => {
    const response = await geef(aanvraag());

    expect(response.status).toBe(201);
    expectValidResponse('createToestemming', response);
    expect(response.body.kenmerk).toBe('TS-2026-1119-0001');
    expect(response.headers.Location).toBe('/api/v1/toestemmingen/TS-2026-1119-0001');
    expect(response.body).toMatchObject({
      gedeeldMet: 'IsolatieGroep Rotterdam',
      doel: 'Offerte voor dakisolatie maken',
      gegevenssets: ['Woning en dak', 'Huidige isolatie', 'Energiegegevens'],
      geldigTot: '2026-12-03',
      termijnDagen: 14,
      woning: { id: 'w-7f3a', adresKort: 'Voorbeeldlaan 73 B' },
    });
    expect(response.body.acties.map((a) => a.type)).toEqual([
      'terug-naar-woning',
      'beheer-gegevens',
    ]);
  });

  it('numbers consents per day', async () => {
    await geef(aanvraag());
    const tweede = await geef(aanvraag({ termijnDagen: 7 }));

    expect(tweede.body.kenmerk).toBe('TS-2026-1119-0002');
    expect(tweede.body.geldigTot).toBe('2026-11-26');
  });

  it('accepts a body that arrives as JSON text', async () => {
    const response = await geef(JSON.stringify(aanvraag()));
    expect(response.status).toBe(201);
  });

  it.each([
    ['no contractor', { aannemerId: undefined }],
    ['an unknown contractor', { aannemerId: 'a-0000' }],
  ])('rejects %s with "Kies een aannemer."', async (_, extra) => {
    const response = await geef(aanvraag(extra));

    expect(response.status).toBe(400);
    expectValidResponse('createToestemming', response);
    expect(response.body.burgerActie).toBe('Kies een aannemer.');
  });

  it('rejects switching off a required data set', async () => {
    const response = await geef(aanvraag({ gegevenssets: ['woning-en-dak', 'energiegegevens'] }));

    expect(response.status).toBe(400);
    expectValidResponse('createToestemming', response);
    expect(response.body.burgerActie).toEqual(expect.any(String));
  });

  it.each([
    ['an unknown data set', { gegevenssets: [...VERPLICHT, 'bsn'] }],
    ['a duration that is not offered', { termijnDagen: 365 }],
    ['a body that is not JSON', 'geen json'],
  ])('rejects %s', async (_, extra) => {
    const body = typeof extra === 'string' ? extra : aanvraag(extra);
    const response = await geef(body);

    expect(response.status).toBe(400);
    expectValidResponse('createToestemming', response);
  });

  it('answers 404 for a property without roof insulation advice', async () => {
    const response = await geef(aanvraag(), 'w-2c91');

    expect(response.status).toBe(404);
    expectValidResponse('createToestemming', response);
  });
});

describe('GET /toestemmingen/{kenmerk}', () => {
  it('returns a consent that was given', async () => {
    const { body } = await geef(aanvraag());

    const response = await bekijk(body.kenmerk);

    expect(response.status).toBe(200);
    expectValidResponse('getToestemming', response);
    expect(response.body).toEqual(body);
  });

  it('answers 404 for an unknown kenmerk', async () => {
    const response = await bekijk('TS-2026-1119-9999');

    expect(response.status).toBe(404);
    expectValidResponse('getToestemming', response);
  });

  it('keeps consents of today and the previous day only', async () => {
    vi.setSystemTime(new Date('2026-11-17T12:00:00Z'));
    const eergisteren = (await geef(aanvraag())).body.kenmerk;
    vi.setSystemTime(new Date('2026-11-18T12:00:00Z'));
    const gisteren = (await geef(aanvraag())).body.kenmerk;
    vi.setSystemTime(new Date('2026-11-19T12:00:00Z'));

    expect((await bekijk(gisteren)).status).toBe(200);
    const response = await bekijk(eergisteren);
    expect(response.status).toBe(404);
    expectValidResponse('getToestemming', response);
  });

  it('does not show one simulated citizen the consent of another', async () => {
    vi.stubEnv('LVG_SCENARIOS', 'on');
    const { body } = await geef(aanvraag(), 'w-7f3a', { 'X-LVG-Scenario': 'een-woning' });

    const response = await bekijk(body.kenmerk, { 'X-LVG-Scenario': 'geen-woning' });

    expect(response.status).toBe(404);
  });
});
