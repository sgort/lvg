// Every response in the contract carries an example, and every example is valid against its
// own schema. The front-end tests use these examples as fixtures, so a wrong example would
// let a wrong page pass.
import { describe, expect, it } from 'vitest';

import { contract } from '../src/core/contract.js';
import { compileSchema, resolveRef } from './contract.js';

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

const mediaPerResponse = () =>
  Object.values(contract.paths).flatMap((pathItem) =>
    METHODS.filter((method) => pathItem[method]).flatMap((method) => {
      const operation = pathItem[method];
      return Object.entries(operation.responses).flatMap(([status, response]) =>
        Object.entries(resolveRef(response).content ?? {}).map(([mediaType, media]) => ({
          name: `${operation.operationId} ${status} ${mediaType}`,
          media,
        }))
      );
    })
  );

describe('contract examples', () => {
  it.each(mediaPerResponse())('$name has at least one example', ({ media }) => {
    expect(Object.keys(media.examples ?? {}).length).toBeGreaterThan(0);
  });

  it.each(mediaPerResponse())('$name has only valid examples', ({ media }) => {
    const validate = compileSchema(media.schema);
    for (const [exampleName, example] of Object.entries(media.examples ?? {})) {
      const valid = validate(example.value);
      expect(valid, `${exampleName}: ${JSON.stringify(validate.errors, null, 2)}`).toBe(true);
    }
  });
});

describe('Advies is bound to its status', () => {
  const validate = compileSchema(contract.components.schemas.Advies);

  it('rejects a calculated advice without options', () => {
    expect(validate({ status: 'berekend', berekendOp: '2026-11-19', uitgangspunten: [] })).toBe(
      false
    );
  });

  it('rejects an unavailable advice without a message', () => {
    expect(validate({ status: 'niet-beschikbaar' })).toBe(false);
  });
});
