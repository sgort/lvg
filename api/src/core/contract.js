// The OpenAPI contract, parsed once. It is served at /api/v1/openapi.json and gives the
// version for the API-Version header, so the header can never drift from the contract.
import { readFileSync } from 'node:fs';

import { parse } from 'yaml';

const source = readFileSync(new URL('../../openapi.yaml', import.meta.url), 'utf8');

export const contract = parse(source);

export const API_VERSION = contract.info.version;
