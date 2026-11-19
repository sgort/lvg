// Playwright walkthroughs on the built site, served by `vite preview` with the API and the
// deployed sites' headers (CSP included). Chromium only, at a desktop and a mobile size.
// Locally: `npm run test:e2e` (builds first). In CI the workflow builds once and runs
// `npx playwright test` on that build, which is what gets deployed.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobiel',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/nl/wonen`,
    reuseExistingServer: !CI,
    env: { LVG_SCENARIOS: 'on' },
  },
});
