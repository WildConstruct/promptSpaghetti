import { expect, Locator, Page, test } from '@playwright/test';

async function openLaunchScreen(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('psg:last-view', 'launch');
      localStorage.removeItem('prompt-spaghetti:workspace');
      localStorage.removeItem('prompt-spaghetti:autosave');
      sessionStorage.removeItem('prompt-spaghetti:recovery-dismissed');
      localStorage.removeItem('prompt-graph-autosave');
      localStorage.removeItem('epic1-graph-autosave');
      localStorage.removeItem('epic1-graph');
      localStorage.removeItem('promptgraph:state:v1');
      localStorage.removeItem('graphDraft');
    } catch {
      // Ignore storage restrictions in browser test environments.
    }
  });

  await page.setViewportSize({ width: 1600, height: 900 });

  await page.goto('/');
  await page.waitForSelector('.launch-screen', { timeout: 20_000 });
}

async function triggerPreviewIfNeeded(previewTray: Locator): Promise<void> {
  await previewTray.page().waitForTimeout(300);
  const loadingCount = await previewTray.locator('.preview-loading').count();
  const resultCount = await previewTray.locator('.preview-result-box').count();
  if (loadingCount > 0 || resultCount > 0) {
    return;
  }
  const generateButton = previewTray.getByRole('button', {
    name: /Generate Preview/i
  });
  if ((await generateButton.count()) > 0) {
    await generateButton.first().click();
  }
}

async function ensurePreviewTrayOpen(page: Page): Promise<void> {
  const previewContent = page.locator('.preview-tray-content');
  if ((await previewContent.count()) === 0) {
    const previewToggle = page.getByRole('button', {
      name: /Show Preview|Hide Preview/i
    });
    await previewToggle.click();
  }
  await expect(previewContent).toBeVisible({ timeout: 15_000 });
}

async function readPreviewRandomizeState(
  page: Page,
  previewTray: Locator,
  previewLogs: string[]
): Promise<{
  loading: number;
  debug: Record<string, unknown> | null;
  seedLabels: string[];
  logs: string[];
  hasMeaningfulOutput: boolean;
}> {
  const loading = await previewTray.locator('.preview-loading').count();
  const texts = await previewTray.locator('.preview-result-box').allTextContents();
  const seedLabels = await previewTray
    .locator('button[title="Randomize seed"]')
    .evaluateAll((elements: Element[]) =>
      elements.map((element: Element) => {
        const container = element.parentElement;
        return container?.querySelector('button')?.textContent?.trim() ?? '';
      })
    );
  const debug = await page.evaluate(() => {
    return (
      (window as Window & {
        __PSG_PREVIEW_DEBUG__?: Record<string, unknown>;
      }).__PSG_PREVIEW_DEBUG__ ?? null
    );
  });

  return {
    loading,
    debug,
    seedLabels,
    logs: [...previewLogs],
    hasMeaningfulOutput: texts.some(
      (text: string) =>
        !text.includes('No result yet') &&
        /swamp|graveyard|desert|monster|truck/i.test(text)
    )
  };
}

test('monster truck branching preview renders output and survives seed randomize', async ({
  page
}) => {
  const previewLogs: string[] = [];
  page.on('console', (message: { text: () => string }) => {
    const text = message.text();
    if (text.includes('[PSG_PREVIEW_DEBUG]')) {
      previewLogs.push(text);
      if (previewLogs.length > 10) {
        previewLogs.shift();
      }
    }
  });

  await openLaunchScreen(page);

  await page.locator('.template-grid').evaluate((element: HTMLElement) => {
    element.scrollTop = element.scrollHeight;
  });

  const quickAction = page
    .locator('[data-testid="quick-action-branching_family"]')
    .first();
  await quickAction.waitFor({ state: 'attached', timeout: 20_000 });
  await expect(quickAction).toBeVisible({ timeout: 20_000 });
  await quickAction.click({ force: true });

  await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });
  await ensurePreviewTrayOpen(page);

  const previewTray = page.getByTestId('preview-tray');
  await expect(previewTray).toBeVisible({ timeout: 15_000 });
  await triggerPreviewIfNeeded(previewTray);

  await expect
    .poll(
      async () => {
        const texts = await previewTray
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

  await previewTray.getByTitle('Randomize seed').first().click();

  try {
    await expect
      .poll(
        () => readPreviewRandomizeState(page, previewTray, previewLogs),
        { timeout: 20_000 }
      )
      .toEqual({
        loading: 0,
        debug: expect.anything(),
        seedLabels: expect.any(Array),
        logs: expect.any(Array),
        hasMeaningfulOutput: true
      });
  } catch (error) {
    const finalState = await readPreviewRandomizeState(page, previewTray, previewLogs);
    console.log(
      '[FINAL_RANDOMIZE_STATE]',
      JSON.stringify(finalState, null, 2)
    );
    throw error;
  }
});
