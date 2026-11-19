import { describe, expect, it } from 'vitest';

import { expectValidResponse } from '../../test/contract.js';
import { handle } from '../core/router.js';

const get = (path) => handle({ method: 'GET', path, headers: {} });

describe('GET /woningen/{id}/kadaster', () => {
  it('returns the parcel, map, products, owner information, photos and contact', async () => {
    const response = await get('/api/v1/woningen/w-7f3a/kadaster');

    expect(response.status).toBe(200);
    expectValidResponse('getKadaster', response);
    const body = response.body;
    expect(body.woning.adres).toBe('Voorbeeldlaan 73 B, 3000 SS Rotterdam');
    expect(body.kaart.afbeelding).toEqual({
      src: '/perceel-1560.png',
      alt: 'Kadastrale kaart met perceel Rotterdam Z 99999',
    });
    expect(body.gegevens).toEqual({
      aanduiding: 'Rotterdam Z 99999',
      grootteM2: 158,
      koopsomEur: 245000,
      publiekrechtelijkeBeperkingen: 'Geen',
      bebouwing: 'Woonhuis',
    });
    expect(body.producten.map((p) => p.label)).toEqual([
      'Beperkte rechten',
      'Hypotheekbedrag',
      'Hypotheekgever',
      'Hypotheeknemer',
      'Zakelijke rechten',
    ]);
    expect(body.producten.every((p) => p.link.extern)).toBe(true);
    expect(body.eigenaarsinformatie.tekst).toBe(
      'In Eigenaarsinformatie vindt u informatie over geregistreerde objecten die op uw naam staan in de Basisregistratie Kadaster. U bent van deze objecten de gerechtigde. Een uitgebreide toelichting op deze informatie vindt u op de webpagina van het Kadaster.'
    );
    expect(body.eigenaarsinformatie.meerInformatie).toMatchObject({
      tekst: 'Kadaster',
      extern: true,
    });
    expect(body.eigenaarsinformatie.download.tekst).toBe('Download eigenaarsinformatie (pdf)');
    expect(body.fotos.luchtfotos).toHaveLength(1);
    expect(body.fotos.panoramafotos).toHaveLength(1);
    expect(body.contact.organisatie).toBe('Kadaster');
  });

  it('answers 404 for an unknown property', async () => {
    const response = await get('/api/v1/woningen/w-0000/kadaster');
    expect(response.status).toBe(404);
    expectValidResponse('getKadaster', response);
  });
});
