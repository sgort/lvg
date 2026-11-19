// Test helper: the examples in api/openapi.yaml, by operation and status. Fixtures come from
// the contract, not from hand-written data, so a page test and the API agree by construction.
import { parse } from 'yaml';

import source from '../../api/openapi.yaml?raw';

type Media = { examples?: Record<string, { value: unknown }> };
type Response = { $ref?: string; content?: Record<string, Media> };
type Operation = { operationId?: string; responses: Record<string, Response> };
type Contract = {
  paths: Record<string, Record<string, Operation>>;
  components: { responses: Record<string, Response> };
};

const contract = parse(source) as Contract;

const resolve = (response: Response): Response => {
  if (!response.$ref) return response;
  const name = response.$ref.split('/').pop() ?? '';
  const target = contract.components.responses[name];
  if (!target) throw new Error(`Unknown response ${response.$ref}`);
  return target;
};

function findOperation(operationId: string): Operation {
  for (const pathItem of Object.values(contract.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (operation.operationId === operationId) return operation;
    }
  }
  throw new Error(`Unknown operationId ${operationId}`);
}

/** The examples of one response, by name, as their values. */
export function contractExamples(operationId: string, status: number): Record<string, unknown> {
  const response = findOperation(operationId).responses[String(status)];
  if (!response) throw new Error(`${operationId} declares no ${status}`);
  const media = Object.values(resolve(response).content ?? {})[0];
  const examples = Object.entries(media?.examples ?? {});
  if (examples.length === 0) throw new Error(`${operationId} ${status} has no examples`);
  return Object.fromEntries(examples.map(([name, example]) => [name, example.value]));
}

/** The first example of one response. */
export function contractExample(operationId: string, status: number): unknown {
  return Object.values(contractExamples(operationId, status))[0];
}
