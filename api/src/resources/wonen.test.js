import { describe, expect, it } from 'vitest';

import { expectValidResponse } from '../../test/contract.js';
import { handle } from '../core/router.js';

describe('GET /wonen', () => {
  it('returns the three landing cards with their actions', async () => {
    const response = await handle({ method: 'GET', path: '/api/v1/wonen', headers: {} });

    expect(response.status).toBe(200);
    expectValidResponse('getWonen', response);
    expect(response.body.kaarten.map((k) => k.titel)).toEqual([
      'Berichten over uw Buurt',
      'Ik ben woningeigenaar',
      'Ik ben huurder',
    ]);
    const [buurt, eigenaar, huurder] = response.body.kaarten;
    expect(buurt).toMatchObject({
      bron: 'Officiële Bekendmakingen',
      tekst:
        'U vindt hier berichten over vergunningen in uw buurt, zoals evenementen en bouwplannen. Ook vindt u de bekendmakingen van nieuwe regelgeving.',
      actie: { type: 'berichten-over-uw-buurt', tekst: 'Berichten over uw Buurt' },
    });
    expect(eigenaar).toMatchObject({
      bron: 'LVG',
      tekst: '{Ingang LVG}',
      actie: {
        type: 'bekijk-koopwoningen',
        href: '/api/v1/woningen',
        tekst: 'Bekijk koopwoningen',
      },
    });
    expect(huurder).toMatchObject({
      bron: 'LVG',
      tekst: '{intro}',
      actie: { type: 'bekijk-huurwoningen', tekst: 'Bekijk huurwoningen' },
    });
  });
});
