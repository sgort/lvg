import { describe, expect, it } from 'vitest';
import type { z } from 'zod';

import { contractExample, contractExamples } from '../test/contractExamples';
import * as schemas from './schemas';

type Case = [string, z.ZodObject, string, number];

const CASES: Case[] = [
  ['Wonen', schemas.Wonen, 'getWonen', 200],
  ['WoningenOverzicht', schemas.WoningenOverzicht, 'listWoningen', 200],
  ['Woning', schemas.Woning, 'getWoning', 200],
  ['Kadaster', schemas.Kadaster, 'getKadaster', 200],
  ['Woz', schemas.Woz, 'getWoz', 200],
  ['Energielabel', schemas.Energielabel, 'getEnergielabel', 200],
  ['Dakisolatie', schemas.Dakisolatie, 'getDakisolatie', 200],
  ['AannemersOverzicht', schemas.AannemersOverzicht, 'listAannemers', 200],
  ['Toestemming', schemas.Toestemming, 'createToestemming', 201],
  ['Toestemming', schemas.Toestemming, 'getToestemming', 200],
  ['Probleem', schemas.Probleem, 'getWoning', 404],
];

describe('response schemas', () => {
  it.each(CASES)('%s parses every example of %s', (_, schema, operationId, status) => {
    for (const [name, example] of Object.entries(contractExamples(operationId, status))) {
      expect(schema.safeParse(example).success, name).toBe(true);
    }
  });

  it.each(CASES)('%s rejects an example without a required field', (_, schema, id, status) => {
    const example = contractExample(id, status) as Record<string, unknown>;
    const required = Object.entries(schema.shape as Record<string, z.ZodType>)
      .filter(([, field]) => !field.safeParse(undefined).success)
      .map(([key]) => key);

    expect(required.length).toBeGreaterThan(0);
    for (const key of required) {
      const zonder = { ...example };
      delete zonder[key];
      expect(schema.safeParse(zonder).success, key).toBe(false);
    }
  });

  it('rejects a calculated advice without options', () => {
    const advies = { status: 'berekend', berekendOp: '2026-11-19', uitgangspunten: [] };

    expect(schemas.Advies.safeParse(advies).success).toBe(false);
  });

  it('rejects an unavailable advice without a message', () => {
    expect(schemas.Advies.safeParse({ status: 'niet-beschikbaar' }).success).toBe(false);
  });

  it('ignores fields it does not know, as the version policy allows', () => {
    const example = contractExample('getWonen', 200) as Record<string, unknown>;

    expect(schemas.Wonen.safeParse({ ...example, nieuwVeld: 1 }).success).toBe(true);
  });
});
