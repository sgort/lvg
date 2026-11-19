// Every response in the contract carries an example, and every example is valid against its
// own schema. The front-end tests use these examples as fixtures, so a wrong example would
// let a wrong page pass.
import { readFileSync } from 'node:fs';

import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

import { API_VERSION, contract } from '../src/core/contract.js';
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

const requestBodies = () =>
  Object.values(contract.paths).flatMap((pathItem) =>
    METHODS.filter((method) => pathItem[method]?.requestBody).flatMap((method) => {
      const operation = pathItem[method];
      return Object.entries(operation.requestBody.content).map(([mediaType, media]) => ({
        name: `${operation.operationId} request ${mediaType}`,
        media,
      }));
    })
  );

describe('contract examples', () => {
  it.each(requestBodies())('$name has valid examples', ({ media }) => {
    const examples = Object.entries(media.examples ?? {});
    expect(examples.length).toBeGreaterThan(0);
    const validate = compileSchema(media.schema);
    for (const [exampleName, example] of examples) {
      expect(validate(example.value), exampleName).toBe(true);
    }
  });

  it('shows an unreadable request among the 400 examples', () => {
    const examples = Object.values(
      contract.components.responses.BadRequest.content['application/problem+json'].examples
    );
    expect(examples.map((example) => example.value.title)).toContain('Aanvraag niet leesbaar');
  });

  it('reads the same in YAML 1.1 tools, so no date turns into a timestamp', () => {
    const source = readFileSync(new URL('../openapi.yaml', import.meta.url), 'utf8');
    expect(JSON.parse(JSON.stringify(parse(source, { version: '1.1' })))).toEqual(contract);
  });

  it('has the same version as the package', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(pkg.version).toBe(API_VERSION);
  });

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
