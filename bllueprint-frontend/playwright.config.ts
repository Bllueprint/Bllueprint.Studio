import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests (docs/frontend-guidelines.md §9).
 *
 * - `web`: regression suite against the PRODUCTION build served statically
 *   (same bundle, same CSP as the packaged app). The web server builds first.
 * - `visual`: screenshot comparisons per theme (opt-in, platform-specific baselines).
 * - `electron`: smoke test of the PACKAGED desktop app; needs
 *   `BLLUEPRINT_APP_EXE` pointing at the executable produced by electron-builder,
 *   otherwise it is skipped.
 */
const WEB_PORT = Number(process.env['E2E_PORT'] ?? 4310);
const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'e2e/.results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['list'], ['html', { open: 'never', outputFolder: 'e2e/.report' }]] : 'list',
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  projects: [
    {
      name: 'web',
      testDir: 'e2e/web',
      testIgnore: /visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${WEB_PORT}`,
        viewport: { width: 1400, height: 900 },
        colorScheme: 'light',
      },
    },
    {
      // Screenshot comparisons: opt-in (baselines are per platform, see visual.spec.ts).
      name: 'visual',
      testDir: 'e2e/web',
      testMatch: /visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${WEB_PORT}`,
        viewport: { width: 1400, height: 900 },
        colorScheme: 'light',
      },
    },
    {
      name: 'electron',
      testDir: 'e2e/electron',
      timeout: 90_000,
    },
  ],
  webServer: {
    command: `npm run build && node e2e/serve.mjs ${WEB_PORT}`,
    url: `http://localhost:${WEB_PORT}`,
    timeout: 240_000,
    reuseExistingServer: !isCI,
  },
});
