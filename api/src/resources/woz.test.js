import { describe, expect, it } from 'vitest';

import { expectValidResponse } from '../../test/contract.js';
import { handle } from '../core/router.js';

const get = (path) => handle({ method: 'GET', path, headers: {} });

describe('GET /woningen/{id}/woz', () => {
  it('returns the WOZ fields, each with an explanation, the report and contact', async () => {
    const response = await get('/api/v1/woningen/w-7f3a/woz');

    expect(response.status).toBe(200);
    expectValidResponse('getWoz', response);
    const { gegevens, contact } = response.body;
    expect(gegevens.waarde.bedragEur).toBe(317000);
    expect(gegevens.waardepeildatum.datum).toBe('2025-01-01');
    expect(gegevens.grondoppervlakteM2.waarde).toBe(160);
    expect(gegevens.objectnummer.tekst).toBe('059999999999');
    expect(gegevens.objecttype.tekst).toBe('hoekwoning');
    expect(gegevens.taxatieverslag.link.tekst).toBe('Taxatieverslag (pdf)');
    for (const veld of Object.values(gegevens)) {
      expect(veld.uitleg).toEqual(expect.any(String));
    }
    expect(contact.organisatie).toBe('Gemeente Rotterdam');
  });

  it('answers 404 for an unknown property', async () => {
    const response = await get('/api/v1/woningen/w-0000/woz');
    expect(response.status).toBe(404);
    expectValidResponse('getWoz', response);
  });
});
