// Shared set-up for the front-end tests: jest-dom matchers, and a clean DOM after each test
// (Testing Library only cleans up by itself when Vitest globals are on, which they are not).
import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
