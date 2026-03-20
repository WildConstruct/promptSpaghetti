import { expect, test, type Page } from '@playwright/test';

async function openEditorWithHostedImageBootstrap(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('psg:last-view', 'editor');
      localStorage.removeItem('prompt-graph-autosave');
      localStorage.removeItem('graphDraft');
    } catch {
      // Ignore localStorage restrictions in browser tests.
    }
  });

  await page.route('**/api/psg/capabilities', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        version: 'psg/1',
        supportedKinds: ['fragment', 'crowd-plan', 'scene-plan'],
        operations: [
          'validate',
          'normalize',
          'expand-crowd',
          'export-comfy',
          'assets-register',
          'assets-derive',
          'scene-assemble',
          'images-register-batch',
          'images-analyze',
          'images-review',
          'images-draft-graph',
          'images-generate-batch'
        ],
        exportTargets: ['comfy']
      })
    });
  });

  await page.goto('/');
  await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });
  await page.waitForSelector('.simple-menu-bar', { timeout: 20_000 });
}

test('image bootstrap menu entry opens the dialog when hosted PSG image ops are available', async ({
  page
}) => {
  await openEditorWithHostedImageBootstrap(page);

  const fileMenu = page.locator('.menu-section').filter({ hasText: 'File' }).first();
  await fileMenu.hover();

  const menuItem = page.getByRole('button', { name: 'Image Bootstrap...' });
  await expect(menuItem).toBeVisible();
  await menuItem.click();

  await expect(
    page.getByRole('heading', { name: 'Image Bootstrap' })
  ).toBeVisible();
  await expect(
    page.getByText(/Analyze attached image assets, review the machine read/i)
  ).toBeVisible();
});
