import { afterEach, describe, expect, it, vi } from 'vitest';

import { expectValidResponse } from '../../test/contract.js';
import { handle } from '../core/router.js';

const get = (path) => handle({ method: 'GET', path, headers: {} });

afterEach(() => {
  vi.useRealTimers();
});

describe('GET /woningen/{id}/energielabel', () => {
  it('returns the label, dates, documents, contact and the roof insulation action', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-19T12:00:00Z'), toFake: ['Date'] });
    const response = await get('/api/v1/woningen/w-7f3a/energielabel');

    expect(response.status).toBe(200);
    expectValidResponse('getEnergielabel', response);
    const body = response.body;
    expect(body.label).toEqual({ klasse: 'C', naam: 'C' });
    expect(body.objectAanduiding).toBe('woning');
    expect(body).toMatchObject({
      registratiedatum: '2021-02-04',
      opnamedatum: '2020-12-06',
      geldigTot: '2030-12-06',
      geldigheid: 'geldig',
    });
    expect(body.labelDocument.tekst).toBe('Energielabel C 3000SS 73 B (pdf)');
    expect(body.opnamegegevens.tekst).toBe('Opnamegegevens (pdf)');
    expect(body.isde.link).toMatchObject({ extern: true });
    expect(body.contact.organisatie).toBe('Rijksdienst voor Ondernemend Nederland (RVO)');
    expect(body.acties).toEqual([
      { type: 'bekijk-dakisolatie', href: '/api/v1/woningen/w-7f3a/dakisolatie' },
    ]);
  });

  it('decides validity from the dates: expired after the end date', async () => {
    vi.useFakeTimers({ now: new Date('2030-12-07T12:00:00Z'), toFake: ['Date'] });
    const response = await get('/api/v1/woningen/w-7f3a/energielabel');

    expect(response.body.geldigheid).toBe('verlopen');
  });

  it('is still valid on the end date itself', async () => {
    vi.useFakeTimers({ now: new Date('2030-12-06T12:00:00Z'), toFake: ['Date'] });
    const response = await get('/api/v1/woningen/w-7f3a/energielabel');

    expect(response.body.geldigheid).toBe('geldig');
  });

  it('offers no roof insulation action for a property without building data', async () => {
    const response = await get('/api/v1/woningen/w-2c91/energielabel');

    expectValidResponse('getEnergielabel', response);
    expect(response.body.label.klasse).toBe('A');
    expect(response.body.acties).toEqual([]);
  });

  it('answers 404 for an unknown property', async () => {
    const response = await get('/api/v1/woningen/w-0000/energielabel');
    expect(response.status).toBe(404);
    expectValidResponse('getEnergielabel', response);
  });
});
