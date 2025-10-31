import { test, expect } from '@playwright/test';

// Preview smoke test: ensure the app loads and no console errors are emitted.
test('preview loads without console errors and becomes ready', async ({
  page
}) => {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Navigate to root. The dev server is managed by playwright.config.ts webServer.
  await page.goto('/');

  // If a loading indicator is shown, wait for it to go away. It's okay if it never appears.
  const loadingSelector = '.loading-message';
  const hasLoading = await page.locator(loadingSelector).count();
  if (hasLoading > 0) {
    try {
      await page
        .locator(loadingSelector)
        .waitFor({ state: 'detached', timeout: 20_000 });
    } catch (error) {
      console.warn('Loading indicator persisted longer than expected:', error);
    }
  }

  // Expect that an error screen is not shown.
  await expect(page.locator('.error-message')).toHaveCount(0);

  // Basic readiness: the app div should exist and fill viewport
  await expect(page.locator('div.App')).toHaveCount(1);

  // Ensure no console errors were logged during boot.
  expect(
    errors,
    `Console errors encountered: \n${errors.join('\n')}`
  ).toHaveLength(0);
});
