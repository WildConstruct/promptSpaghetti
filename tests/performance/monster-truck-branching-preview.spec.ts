import { expect, Page, test } from '@playwright/test';

async function openLaunchScreen(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('psg:last-view');
      localStorage.removeItem('prompt-graph-autosave');
      localStorage.removeItem('graphDraft');
    } catch {
      // Ignore storage restrictions in browser test environments.
    }
  });

  await page.goto('/');
  await page.waitForSelector('.launch-screen', { timeout: 20_000 });
}

test('monster truck branching preview renders output and survives seed randomize', async ({
  page
}) => {
  await openLaunchScreen(page);

  await page.locator('.template-grid').evaluate(element => {
    element.scrollTop = element.scrollHeight;
  });
  await page.getByRole('button', { name: /Monster Truck Branching/i }).click();

  await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });

  const previewToggle = page.getByRole('button', {
    name: /Show Preview|Hide Preview/i
  });
  await previewToggle.click();

  const previewTray = page.getByTestId('preview-tray');
  await expect(previewTray).toBeVisible({ timeout: 15_000 });

  await expect
    .poll(
      async () => {
        const texts = await page
          .locator('.preview-result-box')
          .allTextContents();
        return texts
          .map(text => text.replace(/\s+/g, ' ').trim())
          .some(
            text =>
              text &&
              !text.includes('No result yet') &&
              /swamp|graveyard|desert|monster|truck/i.test(text)
          );
      },
      { timeout: 20_000 }
    )
    .toBe(true);

  await page.getByTitle('Randomize seed').first().click();

  await expect
    .poll(
      async () => {
        const loading = await page.locator('.preview-loading').count();
        const texts = await page
          .locator('.preview-result-box')
          .allTextContents();
        return {
          loading,
          hasMeaningfulOutput: texts.some(
            text =>
              !text.includes('No result yet') &&
              /swamp|graveyard|desert|monster|truck/i.test(text)
          )
        };
      },
      { timeout: 20_000 }
    )
    .toEqual({ loading: 0, hasMeaningfulOutput: true });
});
