// Test helper: checks a handler response against api/openapi.yaml. A response must use a
// status the operation declares, the declared content type, carry every declared header,
// and have a body that matches the schema.
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { expect } from 'vitest';

import { contract } from '../src/core/contract.js';

const CONTRACT_ID = 'lvg-contract';

// OpenAPI 3.0 schemas carry keywords JSON Schema does not know, such as `example`, so
// strict mode is off. Formats like `date` and `uri-reference` are still checked.
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addSchema({ $id: CONTRACT_ID, components: contract.components });

const resolveRef = (node) => {
  if (!node?.$ref) return node;
  const path = node.$ref.replace(/^#\//, '').split('/');
  return path.reduce((value, key) => value[key], contract);
};

// Point local refs at the registered contract, so ajv can follow them.
const rewriteRefs = (schema) =>
  JSON.parse(JSON.stringify(schema).replaceAll('"$ref":"#/', `"$ref":"${CONTRACT_ID}#/`));

const findOperation = (operationId) => {
  for (const methods of Object.values(contract.paths)) {
    for (const operation of Object.values(methods)) {
      if (operation?.operationId === operationId) return operation;
    }
  }
  throw new Error(`Unknown operationId ${operationId}`);
};

const headerValue = (headers, name) => {
  const key = Object.keys(headers ?? {}).find((k) => k.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : headers[key];
};

export function expectValidResponse(operationId, response) {
  const operation = findOperation(operationId);
  const declared = resolveRef(operation.responses[String(response.status)]);
  expect(declared, `${operationId} does not declare status ${response.status}`).toBeDefined();

  for (const name of Object.keys(declared.headers ?? {})) {
    expect(headerValue(response.headers, name), `missing header ${name}`).toBeDefined();
  }

  const [contentType, media] = Object.entries(declared.content ?? {})[0] ?? [];
  if (!contentType) return;
  expect(headerValue(response.headers, 'Content-Type')).toContain(contentType);

  const validate = ajv.compile(rewriteRefs(media.schema));
  const valid = validate(response.body);
  expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
}
