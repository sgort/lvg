import { describe, expect, it } from 'vitest';

import { ProblemError } from '../core/http.js';
import {
  getAannemers,
  getDak,
  getEnergielabel,
  getKadaster,
  getWoning,
  getWoz,
  listWoningen,
} from './registers.js';

const ROTTERDAM = 'w-7f3a';

describe('listWoningen', () => {
  it('lists three properties in drie-woningen', async () => {
    const woningen = await listWoningen('drie-woningen');
    expect(woningen.map((w) => w.id)).toEqual(['w-7f3a', 'w-2c91', 'w-b04e']);
  });

  it('lists only the Rotterdam property in een-woning', async () => {
    const woningen = await listWoningen('een-woning');
    expect(woningen).toHaveLength(1);
    expect(woningen[0]).toMatchObject({ id: ROTTERDAM, straat: 'Voorbeeldlaan' });
  });

  it('lists none in geen-woning', async () => {
    expect(await listWoningen('geen-woning')).toEqual([]);
  });

  it('uses opaque ids without digits from the postcode or house number', async () => {
    for (const woning of await listWoningen('drie-woningen')) {
      expect(woning.id).toMatch(/^w-[0-9a-f]{4}$/);
      const postcodeDigits = woning.postcode.replace(/\D/g, '');
      const huisnummerDigits = String(woning.huisnummer).replace(/\D/g, '');
      expect(woning.id).not.toContain(postcodeDigits);
      expect(woning.id).not.toContain(huisnummerDigits);
      expect(woning.id.toLowerCase()).not.toContain(woning.straat.toLowerCase().slice(0, 4));
    }
  });
});

describe('register lookups', () => {
  it.each([
    ['getWoning', getWoning],
    ['getKadaster', getKadaster],
    ['getWoz', getWoz],
    ['getEnergielabel', getEnergielabel],
    ['getDak', getDak],
    ['getAannemers', getAannemers],
  ])('%s rejects an unknown id with a 404 problem', async (_, lookup) => {
    const error = await lookup('drie-woningen', 'w-0000').catch((e) => e);
    expect(error).toBeInstanceOf(ProblemError);
    expect(error.status).toBe(404);
    expect(error.burgerActie).toEqual(expect.any(String));
  });

  it('rejects a property that is not in the scenario', async () => {
    const error = await getWoning('een-woning', 'w-2c91').catch((e) => e);
    expect(error).toBeInstanceOf(ProblemError);
    expect(error.status).toBe(404);
  });

  it('returns the registers for the Rotterdam property', async () => {
    expect(await getWoning('drie-woningen', ROTTERDAM)).toMatchObject({
      straat: 'Voorbeeldlaan',
      huisnummer: '73 B',
      postcode: '3000 SS',
      woonplaats: 'Rotterdam',
      bouwjaar: 1990,
    });
    expect(await getKadaster('drie-woningen', ROTTERDAM)).toMatchObject({
      aanduiding: 'Rotterdam Z 99999',
      grootteM2: 158,
    });
    expect(await getWoz('drie-woningen', ROTTERDAM)).toMatchObject({
      waardeEur: 317000,
      waardepeildatum: '2025-01-01',
      objecttype: 'hoekwoning',
    });
    expect(await getEnergielabel('drie-woningen', ROTTERDAM)).toMatchObject({
      klasse: 'C',
      registratiedatum: '2021-02-04',
      opnamedatum: '2020-12-06',
      geldigTot: '2030-12-06',
    });
  });

  it('gives the Rotterdam property a roof area separate from its floor area', async () => {
    const dak = await getDak('drie-woningen', ROTTERDAM);
    expect(dak.dak.oppervlakte_m2).toBe(120);
    expect(dak.gebouw.vloeroppervlakte_m2).toBe(120);
    expect(dak.bestaande_isolatie.R_waarde_m2K_per_W).toBe(2.8);
  });

  it('has no building data for the other properties', async () => {
    expect(await getDak('drie-woningen', 'w-2c91')).toBeNull();
    expect(await getDak('drie-woningen', 'w-b04e')).toBeNull();
  });

  it('lists the contractors without ratings', async () => {
    const aannemers = await getAannemers('drie-woningen', ROTTERDAM);
    expect(aannemers.length).toBeGreaterThan(0);
    expect(aannemers[0]).toEqual({
      id: expect.stringMatching(/^a-[0-9a-f]{4}$/),
      naam: 'IsolatieGroep Rotterdam',
      specialisme: 'Dakisolatie specialist',
    });
  });

  it('returns copies', async () => {
    (await getWoz('drie-woningen', ROTTERDAM)).waardeEur = 1;
    (await listWoningen('drie-woningen'))[0].straat = 'x';
    expect((await getWoz('drie-woningen', ROTTERDAM)).waardeEur).toBe(317000);
    expect((await listWoningen('drie-woningen'))[0].straat).toBe('Voorbeeldlaan');
  });
});
