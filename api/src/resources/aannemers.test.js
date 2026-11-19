import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { expectValidResponse } from '../../test/contract.js';
import { handle } from '../core/router.js';

const get = (path) => handle({ method: 'GET', path, headers: {} });

beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2026-11-19T12:00:00Z'), toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('GET /woningen/{id}/aannemers', () => {
  it('lists contractors without ratings, each with the data sets and durations', async () => {
    const response = await get('/api/v1/woningen/w-7f3a/aannemers');

    expect(response.status).toBe(200);
    expectValidResponse('listAannemers', response);
    expect(response.body.doel).toBe('Offerte voor dakisolatie maken');
    expect(response.body.woning.adresKort).toBe('Voorbeeldlaan 73 B');

    const [eerste] = response.body.aannemers;
    expect(eerste).toMatchObject({
      id: 'a-91d2',
      naam: 'IsolatieGroep Rotterdam',
      specialisme: 'Dakisolatie specialist',
    });
    for (const aannemer of response.body.aannemers) {
      expect(aannemer).not.toHaveProperty('rating');
      expect(aannemer).not.toHaveProperty('beoordeling');
    }

    expect(eerste.gegevenssets).toEqual([
      {
        id: 'woning-en-dak',
        naam: 'Woning en dak',
        bron: 'LVG (Kadaster, BAG)',
        elementen: ['adres', 'bouwjaar', 'dakoppervlakte', 'daktype'],
        verplicht: true,
        standaardAan: true,
      },
      {
        id: 'huidige-isolatie',
        naam: 'Huidige isolatie',
        bron: 'LVG',
        elementen: ['soort', 'dikte', 'R-waarde'],
        verplicht: true,
        standaardAan: true,
      },
      {
        id: 'energiegegevens',
        naam: 'Energiegegevens',
        bron: 'RVO (EP-online)',
        elementen: ['energielabel', 'eerder toegekende verduurzamingssubsidies'],
        verplicht: false,
        standaardAan: true,
      },
      {
        id: 'advies-dakisolatie',
        naam: 'Advies dakisolatie',
        bron: 'LVG',
        elementen: ['het advies van de vorige pagina'],
        verplicht: false,
        standaardAan: false,
      },
    ]);
    expect(eerste.termijnen).toEqual([
      { dagen: 7, verlooptOp: '2026-11-26', standaard: false },
      { dagen: 14, verlooptOp: '2026-12-03', standaard: true },
      { dagen: 30, verlooptOp: '2026-12-19', standaard: false },
    ]);
  });

  it('answers 404 for a property without roof insulation advice', async () => {
    const response = await get('/api/v1/woningen/w-2c91/aannemers');

    expect(response.status).toBe(404);
    expectValidResponse('listAannemers', response);
  });
});
