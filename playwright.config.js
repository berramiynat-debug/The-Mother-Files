import { defineConfig, devices } from '@playwright/test';

const port = 4185;
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 55_000,
  expect: { timeout: 15_000 },
  workers: 2,
  use: { baseURL: 'http://localhost:' + port, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: process.env.BROWSER_CHANNEL || undefined } },
    { name: 'mobile', testMatch: '**/mobile.spec.js', use: { ...devices['Pixel 7'], channel: process.env.BROWSER_CHANNEL || undefined } },
  ],
  webServer: {
    command: 'npm run preview -- --host localhost --port ' + port + ' --strictPort',
    url: 'http://localhost:' + port,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
