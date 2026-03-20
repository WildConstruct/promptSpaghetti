import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/performance',
  testMatch: 'image-bootstrap-real-server.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'node server/dist/server/src/index.js',
      url: 'http://127.0.0.1:8000/health',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        PORT: '8000',
        HOST: '127.0.0.1',
        DISABLE_ADMIN_SURFACE: '1',
        LOCAL_TEST_AUTH_TOKEN: 'playwright-real-psg-token'
      }
    },
    {
      command:
        'python3 -m http.server 3000 --bind 127.0.0.1 --directory client/dist',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: true,
      timeout: 120 * 1000
    }
  ]
});
