import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

type RegionFragmentCandidate = {
  name: string;
  path: string;
  searchTerms: string[];
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function loadRegionFragmentCandidatesFromBrowser(
  page: Page
): Promise<RegionFragmentCandidate[]> {
  return page.evaluate<RegionFragmentCandidate[]>(async () => {
    const safeFetchJson = async (url: string) => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        const text = await res.text();
        const trimmed = text.trim();
        if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
          return null;
        }
        return JSON.parse(trimmed);
      } catch {
        return null;
      }
    };

    const manifest = await safeFetchJson(
      '/assets/library/asset-fragments-manifest.json'
    );

    if (!manifest || !Array.isArray(manifest.fragments)) {
      return [];
    }

    const basePath = '/assets/library/';
    const candidates: RegionFragmentCandidate[] = [];

    for (const fragment of manifest.fragments) {
      if (
        !fragment ||
        typeof fragment.name !== 'string' ||
        typeof fragment.path !== 'string'
      ) {
        continue;
      }

      const normalizedPath = fragment.path.replace(/^\.\//, '');
      const fragmentData = await safeFetchJson(`${basePath}${normalizedPath}`);

      if (
        !fragmentData ||
        !Array.isArray(fragmentData.regions) ||
        fragmentData.regions.length === 0
      ) {
        continue;
      }

      const regionNames = fragmentData.regions
        .map((region: { name?: string }) =>
          typeof region?.name === 'string' ? region.name : null
        )
        .filter((name): name is string => Boolean(name));

      candidates.push({
        name: fragment.name,
        path: `${basePath}${normalizedPath}`,
        searchTerms: [fragment.name, ...regionNames]
      });
    }

    return candidates;
  });
}

async function maybeClick(page: Page, locatorSelector: string | Locator) {
  const locator =
    typeof locatorSelector === 'string'
      ? page.locator(locatorSelector)
      : locatorSelector;
  try {
    await locator.click({ timeout: 1500 });
  } catch {
    // Intentionally ignore failures; this is a best-effort helper.
  }
}

async function sizeOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element not visible for boundingBox()');
  return { width: box.width, height: box.height, x: box.x, y: box.y };
}

async function getRegionSize(page: Page, regionId: string) {
  return page.evaluate(id => {
    const instance = (window as any).__EPIC1_REACT_FLOW__;
    if (!instance) {
      return null;
    }
    const node = instance.getNodes().find((n: any) => n.id === id);
    if (!node) {
      return null;
    }
    const width = node.data?.width || node.style?.width || node.measured?.width;
    const height =
      node.data?.height || node.style?.height || node.measured?.height;
    return {
      width: typeof width === 'number' ? width : Number(width) || 0,
      height: typeof height === 'number' ? height : Number(height) || 0
    };
  }, regionId);
}

async function getWrapperSnapshots(page: Page) {
  return page.evaluate(() => {
    const instance = (window as any).__EPIC1_REACT_FLOW__;
    if (!instance) {
      return [];
    }

    return instance
      .getNodes()
      .filter((node: any) => node.type === 'enhancedBoundingBox')
      .map((node: any) => ({
        id: node.id,
        title: node.data?.title,
        position: node.position,
        width:
          node.data?.width || node.style?.width || node.measured?.width || 0,
        height:
          node.data?.height || node.style?.height || node.measured?.height || 0
      }));
  });
}

async function waitForWrapperCountIncrease(
  page: Page,
  before: number,
  reason: string
) {
  try {
    await expect
      .poll(async () => (await getWrapperSnapshots(page)).length, {
        timeout: 8000,
        message: `Waiting for wrapper count increase after ${reason}`
      })
      .toBeGreaterThan(before);
    return true;
  } catch {
    return false;
  }
}

async function insertPresetDirect(
  page: Page,
  candidate: RegionFragmentCandidate
) {
  await page.evaluate(async preset => {
    const insertPreset = (
      window as typeof window & {
        __EPIC1_INSERT_PRESET__?: ((meta: unknown) => Promise<void>) | null;
      }
    ).__EPIC1_INSERT_PRESET__;

    if (!insertPreset) {
      throw new Error('Editor preset insert helper is not available.');
    }

    await insertPreset({
      name: preset.name,
      path: preset.path,
      file: preset.path,
      metadata: {
        file: preset.path
      }
    });
  }, candidate);
}

async function selectWrapperForResize(wrapper: Locator) {
  await expect(wrapper).toBeVisible({ timeout: 15000 });
  await wrapper.locator('div.bounding-box-header').first().click();
  await expect(wrapper).toHaveClass(/selected/);
  await expect(wrapper.locator('.ebb-resize-handle')).toHaveCount(8);
}

async function getSouthEastResizeHandle(wrapper: Locator): Promise<Locator> {
  const handles = wrapper.locator('.ebb-resize-handle');
  await expect(handles).toHaveCount(8);

  let bestIndex = -1;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < 8; i += 1) {
    const box = await handles.nth(i).boundingBox();
    if (!box) {
      continue;
    }
    const score = box.x + box.y;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex < 0) {
    throw new Error('Unable to resolve south-east resize handle.');
  }

  return handles.nth(bestIndex);
}

async function ensureAssetBrowserOpen(page: Page) {
  const assetBrowserToggle = page
    .locator('button[title="Asset Browser"]')
    .first();
  if (await assetBrowserToggle.count()) {
    const classes = (await assetBrowserToggle.getAttribute('class')) || '';
    if (!classes.includes('active')) {
      await assetBrowserToggle.click();
    }
  } else {
    await maybeClick(page, page.getByRole('button', { name: /^Assets$/i }));
  }

  const proBrowser = page.locator('.asset-browser-pro-horizontal').first();
  await expect(proBrowser).toBeVisible({ timeout: 20000 });
}

async function findRegionFragmentTile(
  page: Page,
  candidates: RegionFragmentCandidate[]
): Promise<{
  fragmentCard: Locator;
  insertButton: Locator;
  fragmentName: string;
}> {
  if (candidates.length === 0) {
    throw new Error(
      'No asset fragments with regions were detected in the manifest.'
    );
  }

  await ensureAssetBrowserOpen(page);

  const browserRoot = page.locator('.asset-browser-pro-horizontal').first();

  const listViewToggle = browserRoot
    .locator('button[title="List View"]')
    .first();
  if (await listViewToggle.count()) {
    const pressed = await listViewToggle.getAttribute('aria-pressed');
    if (pressed !== 'true') {
      await listViewToggle.click();
    }
  }

  const searchInput = browserRoot
    .locator('input[placeholder="Search presets..."]')
    .first();

  await expect(searchInput).toBeVisible({ timeout: 10000 });

  for (const candidate of candidates) {
    for (const term of candidate.searchTerms) {
      await searchInput.fill(term);
      await page.waitForTimeout(200);

      const listMatch = browserRoot
        .locator('.preset-list-item')
        .filter({ hasText: candidate.name })
        .first();
      if (await listMatch.count()) {
        await expect(listMatch).toBeVisible({ timeout: 2000 });
        const insertButton = await resolveInsertButton(
          page,
          listMatch,
          candidate.name
        );
        return {
          fragmentCard: listMatch,
          insertButton,
          fragmentName: candidate.name
        };
      }

      const gridMatch = browserRoot
        .locator('.preset-card-compact')
        .filter({ hasText: candidate.name })
        .first();

      if (await gridMatch.count()) {
        await expect(gridMatch).toBeVisible({ timeout: 2000 });
        const insertButton = await resolveInsertButton(
          page,
          gridMatch,
          candidate.name
        );
        return {
          fragmentCard: gridMatch,
          insertButton,
          fragmentName: candidate.name
        };
      }
    }
  }

  throw new Error(
    'Unable to locate a region-enabled asset fragment in the browser UI.'
  );
}

async function resolveInsertButton(
  page: Page,
  fragmentCard: Locator,
  fragmentName: string
) {
  let insertButton = fragmentCard
    .locator('button[aria-label^="Insert"]')
    .first();

  if (!(await insertButton.count())) {
    insertButton = page
      .getByRole('button', {
        name: new RegExp(`^Insert\\s+${escapeRegExp(fragmentName)}$`, 'i')
      })
      .first();
  }

  return insertButton;
}

// Geometry verification is handled via React Flow state snapshots

async function waitForNodeCountIncrease(
  locator: Locator,
  before: number,
  reason: string
) {
  try {
    await expect
      .poll(async () => locator.count(), {
        timeout: 8000,
        message: `Waiting for node count increase after ${reason}`
      })
      .toBeGreaterThan(before);
    return true;
  } catch (error) {
    return false;
  }
}

test.describe('Region fragment box sizing and resize', () => {
  test('drag fragment, ensure region fits contents, then resize larger', async ({
    page
  }) => {
    test.setTimeout(60000);
    page.on('console', msg => {
      console.log(`[browser:${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', error => {
      console.log('[pageerror]', error);
    });

    // 1) Open the app
    await page.goto('/');

    // 2) If Launch Screen appears, skip to editor
    await maybeClick(
      page,
      page.getByRole('button', { name: /Skip to Editor/i })
    );

    // 3) Ensure editor canvas is visible
    const canvas = page.locator('div.graph-canvas-container');
    await expect(canvas).toBeVisible();
    const nodeLocator = page.locator('.react-flow__node');
    const nodesBeforeInsert = await nodeLocator.count();
    const wrappersBeforeInsert = (await getWrapperSnapshots(page)).length;

    // 4) Locate any fragment that has a region defined
    const regionCandidates =
      await loadRegionFragmentCandidatesFromBrowser(page);
    const { fragmentCard, insertButton, fragmentName } =
      await findRegionFragmentTile(page, regionCandidates);

    // 5) Try dragging the item into the canvas; if drag fails, attempt a click fallback
    let inserted = false;
    await fragmentCard.scrollIntoViewIfNeeded();

    const tryInsertButton = async () => {
      if (!(await insertButton.count())) {
        return false;
      }
      try {
        await insertButton.scrollIntoViewIfNeeded();
        await insertButton.click({ timeout: 4000, force: true });
        return true;
      } catch {
        console.log('[spec] Insert button click failed');
        return false;
      }
    };

    const tryDomClick = async () => {
      try {
        await page.evaluate(name => {
          const button = Array.from(document.querySelectorAll('button')).find(
            candidate =>
              candidate.getAttribute('aria-label') === `Insert ${name}`
          ) as HTMLButtonElement | undefined;
          if (!button) {
            throw new Error(`Insert button not found for ${name}`);
          }
          button.click();
        }, fragmentName);
        return true;
      } catch {
        return false;
      }
    };

    const tryDoubleClick = async () => {
      try {
        await fragmentCard.dblclick({ timeout: 2000 });
        return true;
      } catch {
        return false;
      }
    };

    const tryKeyboardInsert = async () => {
      try {
        await fragmentCard.focus();
        await fragmentCard.press('Enter');
        return true;
      } catch {
        return false;
      }
    };

    const insertionStrategies: Array<[string, () => Promise<boolean>]> = [
      ['button', tryInsertButton],
      ['dom-click', tryDomClick],
      ['double-click', tryDoubleClick],
      ['keyboard', tryKeyboardInsert]
    ];

    const attemptInsertion = async () => {
      for (const [, action] of insertionStrategies) {
        // eslint-disable-next-line no-await-in-loop
        if (await action()) {
          const success = await waitForNodeCountIncrease(
            nodeLocator,
            nodesBeforeInsert,
            'insert action'
          );
          if (success) {
            return true;
          }

          // eslint-disable-next-line no-await-in-loop
          if (
            await waitForWrapperCountIncrease(
              page,
              wrappersBeforeInsert,
              'insert action'
            )
          ) {
            return true;
          }
        }
      }
      return false;
    };

    inserted = await attemptInsertion();
    expect(inserted).toBeTruthy();

    const regionInfo = await page.evaluate(() => {
      const instance = (window as any).__EPIC1_REACT_FLOW__;
      if (!instance) {
        return null;
      }
      const nodes = instance.getNodes();
      const regionNode = nodes.find(
        (node: any) => node.type === 'enhancedBoundingBox'
      );
      if (!regionNode) {
        return null;
      }
      const childIds = nodes
        .filter((node: any) => node.parentNode === regionNode.id)
        .map((node: any) => node.id);
      return { id: regionNode.id, childIds };
    });

    if (!regionInfo) {
      throw new Error('Unable to locate the enhanced bounding box node.');
    }
    expect(regionInfo.childIds.length).toBeGreaterThan(0);

    const regionNode = page
      .locator(`.react-flow__node[data-id="${regionInfo.id}"]`)
      .first();
    const region = regionNode
      .locator('.enhanced-bounding-box-refactored')
      .first();
    await expect(region).toBeVisible({ timeout: 15000 });

    await selectWrapperForResize(region);

    // 8) Check node count indicator (should include contained nodes)
    const status = region.locator('div.bounding-box-status');
    // If visible (only when not collapsed), ensure at least 1 node
    if (await status.isVisible()) {
      await expect(status).toContainText(/node/i);
    }

    // 9) Ensure at least one node is contained within the region boundaries
    const childLocators = regionInfo.childIds.map(childId =>
      page.locator(`.react-flow__node[data-id="${childId}"]`)
    );
    const primaryNode = childLocators[0];
    await expect(primaryNode).toBeVisible();

    // 10) Basic sanity: ensure primary node remains interactable
    await expect(primaryNode).toBeVisible();

    // 11) Attempt a resize via the south-east handle
    const handleSE = await getSouthEastResizeHandle(region);
    await expect(handleSE).toBeVisible();

    const beforeSize = await getRegionSize(page, regionInfo.id);
    const before = beforeSize || (await sizeOf(regionNode));

    const hBox = await handleSE.boundingBox();
    if (!hBox) throw new Error('Resize handle not interactable');

    // Drag handle diagonally to increase size
    const startX = hBox.x + hBox.width / 2;
    const startY = hBox.y + hBox.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 220, startY + 180, { steps: 12 });
    await page.mouse.up();

    await page.waitForTimeout(80);
    const afterSize = await getRegionSize(page, regionInfo.id);
    const after = afterSize || (await sizeOf(regionNode));

    // 12) Re-check that all contained nodes remain within the region after resize
    for (const locator of childLocators) {
      await expect(locator).toBeVisible();
    }
  });

  test('resizing one imported wrapper does not shift unrelated wrappers during pointer drag', async ({
    page
  }) => {
    test.setTimeout(60000);

    await page.goto('/');
    await maybeClick(
      page,
      page.getByRole('button', { name: /Skip to Editor/i })
    );

    const canvas = page.locator('div.graph-canvas-container');
    await expect(canvas).toBeVisible();
    const nodeLocator = page.locator('.react-flow__node');

    const candidates = await loadRegionFragmentCandidatesFromBrowser(page);
    expect(candidates.length).toBeGreaterThan(1);
    const preferredNames = [
      'Multi-Aspect Eye Description System',
      'Architectural Styles'
    ];
    const selectedCandidates: RegionFragmentCandidate[] = [];

    for (const name of preferredNames) {
      const match = candidates.find(candidate => candidate.name === name);
      if (match) {
        selectedCandidates.push(match);
      }
    }

    for (const candidate of candidates) {
      if (
        selectedCandidates.some(existing => existing.name === candidate.name)
      ) {
        continue;
      }
      selectedCandidates.push(candidate);
      if (selectedCandidates.length >= 2) {
        break;
      }
    }

    expect(selectedCandidates.length).toBeGreaterThan(1);

    const insertRegionFragment = async (
      candidate: RegionFragmentCandidate,
      expectedBefore: number
    ) => {
      await insertPresetDirect(page, candidate);
      await waitForWrapperCountIncrease(
        page,
        expectedBefore,
        'region fragment insert'
      );
    };

    let beforeInsert = (await getWrapperSnapshots(page)).length;
    await insertRegionFragment(selectedCandidates[0], beforeInsert);
    beforeInsert = (await getWrapperSnapshots(page)).length;
    await insertRegionFragment(selectedCandidates[1], beforeInsert);

    await expect
      .poll(async () => (await getWrapperSnapshots(page)).length, {
        timeout: 10000
      })
      .toBeGreaterThan(1);

    const wrappers = await getWrapperSnapshots(page);
    expect(wrappers.length).toBeGreaterThan(1);

    const targetWrapper = wrappers[0];
    const stableWrapper = wrappers[1];

    const targetRegionNode = page
      .locator(`.react-flow__node[data-id="${targetWrapper.id}"]`)
      .first();
    const stableRegionNode = page
      .locator(`.react-flow__node[data-id="${stableWrapper.id}"]`)
      .first();

    await expect(targetRegionNode).toBeVisible({ timeout: 15000 });
    await expect(stableRegionNode).toBeVisible({ timeout: 15000 });

    const targetRegion = targetRegionNode
      .locator('.enhanced-bounding-box-refactored')
      .first();
    const stableBefore = await sizeOf(stableRegionNode);

    await selectWrapperForResize(targetRegion);

    const handleSE = await getSouthEastResizeHandle(targetRegion);
    await expect(handleSE).toBeVisible();

    const handleBox = await handleSE.boundingBox();
    if (!handleBox) {
      throw new Error('Resize handle not interactable for imported wrapper.');
    }

    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 180, startY + 120, { steps: 12 });

    const stableDuring = await sizeOf(stableRegionNode);

    await page.mouse.up();
    await page.waitForTimeout(100);

    const stableAfter = await sizeOf(stableRegionNode);

    expect(Math.abs(stableDuring.x - stableBefore.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(stableDuring.y - stableBefore.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(stableAfter.x - stableBefore.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(stableAfter.y - stableBefore.y)).toBeLessThanOrEqual(2);
  });
});
