import { defineConfig } from 'vitest/config';

// API tests run in Node. Responses are checked against openapi.yaml in the tests.
export default defineConfig({
  test: {
    environment: 'node',
  },
});
