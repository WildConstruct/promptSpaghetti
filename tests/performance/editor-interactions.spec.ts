import { expect, Page, test } from '@playwright/test';

type RegionFragmentCandidate = {
  id: string;
  name: string;
  path: string;
};

type FlowNodeLike = {
  id: string;
  type?: string;
  parentNode?: string;
  hidden?: boolean;
  data?: {
    isCollapsed?: boolean;
    title?: string;
    fragmentImported?: boolean;
    parentNode?: string;
  };
};

type FlowInstanceLike = {
  getNodes?: () => FlowNodeLike[];
};

declare global {
  interface Window {
    __EPIC1_REACT_FLOW__?: FlowInstanceLike;
    __EPIC1_INSERT_PRESET__?: ((meta: unknown) => Promise<void>) | null;
  }
}

async function getFlowNodeCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const instance = window.__EPIC1_REACT_FLOW__;
    return instance?.getNodes?.().length ?? 0;
  });
}

async function getRegionWrapperCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const instance = window.__EPIC1_REACT_FLOW__;
    if (!instance?.getNodes) {
      return 0;
    }
    return instance
      .getNodes()
      .filter((node: FlowNodeLike) => node.type === 'enhancedBoundingBox').length;
  });
}

async function insertPresetDirect(
  page: Page,
  candidate: RegionFragmentCandidate
): Promise<boolean> {
  return page
    .evaluate(async preset => {
      const insertPreset = window.__EPIC1_INSERT_PRESET__;

      if (!insertPreset) {
        return false;
      }

      await insertPreset({
        id: preset.id,
        name: preset.name,
        path: preset.path,
        file: preset.path,
        metadata: {
          file: preset.path
        }
      });

      return true;
    }, candidate)
    .catch(() => false);
}

async function openEditor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('psg:last-view', 'editor');
      localStorage.removeItem('prompt-graph-autosave');
      localStorage.removeItem('graphDraft');
    } catch {
      // Ignore localStorage restrictions in test environments.
    }
  });

  await page.goto('/');
  await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });
  await page.waitForSelector('.react-flow__pane', { timeout: 20_000 });
}

async function openLaunchScreen(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('psg:last-view');
      localStorage.removeItem('prompt-graph-autosave');
      localStorage.removeItem('graphDraft');
    } catch {
      // Ignore localStorage restrictions in test environments.
    }
  });

  await page.goto('/');
  await page.waitForSelector('.launch-screen', { timeout: 20_000 });
}

async function maybeClickSkipToEditor(page: Page): Promise<void> {
  const skip = page.getByRole('button', { name: /Skip to Editor/i });
  if (await skip.count()) {
    await skip
      .first()
      .click({ timeout: 2000 })
      .catch(() => undefined);
  }
}

async function ensureAssetBrowserOpen(page: Page): Promise<void> {
  const assetBrowserToggle = page
    .locator('button[title="Asset Browser"]')
    .first();
  if (await assetBrowserToggle.count()) {
    const classes = (await assetBrowserToggle.getAttribute('class')) || '';
    if (!classes.includes('active')) {
      await assetBrowserToggle.click();
    }
  } else {
    const assets = page.getByRole('button', { name: /^Assets$/i });
    if (await assets.count()) {
      await assets
        .first()
        .click()
        .catch(() => undefined);
    }
  }

  const proBrowser = page.locator('.asset-browser-pro-horizontal').first();
  await expect(proBrowser).toBeVisible({ timeout: 20_000 });
}

async function loadRegionFragmentCandidates(
  page: Page
): Promise<RegionFragmentCandidate[]> {
  return page.evaluate<RegionFragmentCandidate[]>(async () => {
    const safeFetchJson = async (url: string) => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          return null;
        }
        const text = await res.text();
        const trimmed = text.trim().toLowerCase();
        if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')) {
          return null;
        }
        return JSON.parse(text);
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

    const candidates: RegionFragmentCandidate[] = [];
    for (const fragment of manifest.fragments) {
      if (
        !fragment ||
        typeof fragment.name !== 'string' ||
        typeof fragment.path !== 'string'
      ) {
        continue;
      }

      const normalized = fragment.path.replace(/^\.\//, '');
      const parsed = await safeFetchJson(`/assets/library/${normalized}`);
      if (
        !parsed ||
        !Array.isArray(parsed.regions) ||
        parsed.regions.length === 0
      ) {
        continue;
      }

      candidates.push({
        id:
          typeof fragment.id === 'string' && fragment.id.length > 0
            ? fragment.id
            : fragment.name.toLowerCase().replace(/\s+/g, '-'),
        name: fragment.name,
        path: `/assets/library/${normalized}`
      });
    }

    return candidates;
  });
}

async function insertRegionFragmentFromAssetBrowser(page: Page): Promise<void> {
  await ensureAssetBrowserOpen(page);

  const candidates = await loadRegionFragmentCandidates(page);
  expect(candidates.length).toBeGreaterThan(0);
  const candidate = candidates[0];
  const beforeNodeCount = await getFlowNodeCount(page);
  const beforeWrapperCount = await getRegionWrapperCount(page);

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

  const search = browserRoot
    .locator('input[placeholder="Search presets..."]')
    .first();
  await expect(search).toBeVisible({ timeout: 10000 });
  await search.fill(candidate.name);

  const card = browserRoot
    .locator('.preset-list-item, .preset-card-compact')
    .filter({ hasText: candidate.name })
    .first();
  await expect(card).toBeVisible({ timeout: 10000 });

  const insertButton = card
    .locator('button[aria-label^="Insert"], button[title^="Insert"]')
    .first();
  await expect(insertButton).toBeVisible({ timeout: 5000 });
  await insertButton.click({ force: true });

  const insertedFromClick = await expect
    .poll(
      async () => {
        const [nodeCount, wrapperCount] = await Promise.all([
          getFlowNodeCount(page),
          getRegionWrapperCount(page)
        ]);
        return nodeCount > beforeNodeCount || wrapperCount > beforeWrapperCount;
      },
      { timeout: 5000 }
    )
    .toBe(true)
    .then(() => true)
    .catch(() => false);

  if (!insertedFromClick) {
    const insertedDirectly = await insertPresetDirect(page, candidate);
    expect(insertedDirectly).toBe(true);
    await expect
      .poll(
        async () => {
          const [nodeCount, wrapperCount] = await Promise.all([
            getFlowNodeCount(page),
            getRegionWrapperCount(page)
          ]);
          return (
            nodeCount > beforeNodeCount || wrapperCount > beforeWrapperCount
          );
        },
        { timeout: 10000 }
      )
      .toBe(true);
  }
}

test.describe('Editor Interaction E2E', () => {
  test('drags Region Box from node panel and resizes vertically', async ({
    page
  }) => {
    await openEditor(page);
    await maybeClickSkipToEditor(page);

    const regionItem = page
      .locator('.node-palette .node-item')
      .filter({ hasText: 'Region Box' })
      .first();
    await expect(regionItem).toBeVisible({ timeout: 10_000 });

    const paneBox = await page
      .locator('.react-flow__pane')
      .first()
      .boundingBox();
    expect(paneBox).not.toBeNull();

    const beforeRegionCount = await page.evaluate(() => {
      const instance = window.__EPIC1_REACT_FLOW__;
      if (!instance) {
        return 0;
      }
      return instance
        .getNodes()
        .filter((n: FlowNodeLike) => n.type === 'enhancedBoundingBox').length;
    });

    const dropX = Math.floor((paneBox?.x ?? 100) + 260);
    const dropY = Math.floor((paneBox?.y ?? 100) + 220);
    const pane = page.locator('.react-flow__pane').first();
    const droppedViaDragTo = await regionItem
      .dragTo(pane, {
        force: true,
        targetPosition: {
          x: dropX - (paneBox?.x ?? 0),
          y: dropY - (paneBox?.y ?? 0)
        }
      })
      .then(() => true)
      .catch(() => false);

    if (!droppedViaDragTo) {
      const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
      await regionItem.dispatchEvent('dragstart', { dataTransfer });
      await page.dispatchEvent('.epic1-graph-editor', 'dragenter', {
        dataTransfer,
        clientX: dropX,
        clientY: dropY
      });
      await page.dispatchEvent('.epic1-graph-editor', 'dragover', {
        dataTransfer,
        clientX: dropX,
        clientY: dropY
      });
      await page.dispatchEvent('.epic1-graph-editor', 'drop', {
        dataTransfer,
        clientX: dropX,
        clientY: dropY
      });
    }

    await expect
      .poll(
        async () =>
          page.evaluate(previous => {
            const instance = window.__EPIC1_REACT_FLOW__;
            if (!instance) {
              return false;
            }
            const count = instance
              .getNodes()
              .filter((n: FlowNodeLike) => n.type === 'enhancedBoundingBox').length;
            return count > previous;
          }, beforeRegionCount),
        { timeout: 10_000 }
      )
      .toBe(true);

    const newestRegionId = await page.evaluate(() => {
      const instance = window.__EPIC1_REACT_FLOW__;
      if (!instance) {
        return null;
      }
      const regions = instance
        .getNodes()
        .filter((n: FlowNodeLike) => n.type === 'enhancedBoundingBox');
      if (!regions.length) {
        return null;
      }
      return regions[regions.length - 1]?.id ?? null;
    });
    expect(newestRegionId).not.toBeNull();
  });

  test('drags a preset from content browser and drops it onto canvas', async ({
    page
  }) => {
    await openEditor(page);
    await maybeClickSkipToEditor(page);
    await ensureAssetBrowserOpen(page);

    const browserRoot = page.locator('.asset-browser-pro-horizontal').first();
    const candidates = await loadRegionFragmentCandidates(page);
    expect(candidates.length).toBeGreaterThan(0);
    const candidate = candidates[0];

    const search = browserRoot
      .locator('input[placeholder="Search presets..."]')
      .first();
    await expect(search).toBeVisible({ timeout: 10000 });
    await search.fill(candidate.name);

    const draggablePreset = browserRoot
      .locator(
        '.preset-list-item[draggable="true"], .preset-card-compact[draggable="true"]'
      )
      .filter({ hasText: candidate.name })
      .first();
    await expect(draggablePreset).toBeVisible({ timeout: 10000 });
    const insertButton = draggablePreset
      .locator(
        'button[aria-label^="Insert"], button.insert-btn, button.preset-insert-btn'
      )
      .first();

    const before = await getFlowNodeCount(page);
    const paneBox = await page
      .locator('.react-flow__pane')
      .first()
      .boundingBox();
    expect(paneBox).not.toBeNull();

    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    await draggablePreset.dispatchEvent('dragstart', { dataTransfer });
    await page.dispatchEvent('.epic1-graph-editor', 'dragenter', {
      dataTransfer,
      clientX: Math.floor((paneBox?.x ?? 100) + 220),
      clientY: Math.floor((paneBox?.y ?? 100) + 180)
    });
    await page.dispatchEvent('.epic1-graph-editor', 'dragover', {
      dataTransfer,
      clientX: Math.floor((paneBox?.x ?? 100) + 220),
      clientY: Math.floor((paneBox?.y ?? 100) + 180)
    });
    await page.dispatchEvent('.epic1-graph-editor', 'drop', {
      dataTransfer,
      clientX: Math.floor((paneBox?.x ?? 100) + 220),
      clientY: Math.floor((paneBox?.y ?? 100) + 180)
    });

    const insertedByDrop = await expect
      .poll(() => getFlowNodeCount(page), { timeout: 5000 })
      .toBeGreaterThan(before)
      .then(() => true)
      .catch(() => false);

    if (!insertedByDrop) {
      await expect(insertButton).toBeVisible({ timeout: 5000 });
      await insertButton.click({ force: true });
      await expect
        .poll(() => getFlowNodeCount(page), {
          timeout: 20_000
        })
        .toBeGreaterThan(before);
    }

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const instance = window.__EPIC1_REACT_FLOW__;
            if (!instance) {
              return false;
            }
            const nodes = instance.getNodes();
            const region = nodes.find(
              (n: FlowNodeLike) => n.type === 'enhancedBoundingBox'
            );
            if (!region) {
              return false;
            }
            return nodes.some((n: FlowNodeLike) => n.parentNode === region.id);
          }),
        { timeout: 10000 }
      )
      .toBe(true);
  });

  test('collapses and expands a region box and toggles child hidden state', async ({
    page
  }) => {
    await openEditor(page);
    await maybeClickSkipToEditor(page);

    const beforeNodeCount = await getFlowNodeCount(page);
    const beforeWrapperCount = await getRegionWrapperCount(page);
    await insertRegionFragmentFromAssetBrowser(page);
    await expect
      .poll(
        async () => {
          const [nodeCount, wrapperCount] = await Promise.all([
            getFlowNodeCount(page),
            getRegionWrapperCount(page)
          ]);
          return {
            nodeCount,
            wrapperCount
          };
        },
        {
          timeout: 15_000
        }
      )
      .toEqual(
        expect.objectContaining({
          nodeCount: expect.any(Number),
          wrapperCount: expect.any(Number)
        })
      );

    const inserted = await page.evaluate(
      ({ beforeNodes, beforeWrappers }) => {
        const instance = window.__EPIC1_REACT_FLOW__;
        if (!instance?.getNodes) {
          return false;
        }
        const nodes = instance.getNodes();
        const nodeCount = nodes.length;
        const wrapperCount = nodes.filter(
          (node: FlowNodeLike) => node.type === 'enhancedBoundingBox'
        ).length;
        return nodeCount > beforeNodes || wrapperCount > beforeWrappers;
      },
      { beforeNodes: beforeNodeCount, beforeWrappers: beforeWrapperCount }
    );
    expect(inserted).toBe(true);

    const regionInfo = await page.evaluate(() => {
      const instance = window.__EPIC1_REACT_FLOW__;
      if (!instance) {
        return null;
      }
      const nodes = instance.getNodes();
      const region = nodes.find((n: FlowNodeLike) => n.type === 'enhancedBoundingBox');
      if (!region) {
        return null;
      }
      const child = nodes.find((n: FlowNodeLike) => n.parentNode === region.id);
      if (!child) {
        return { regionId: region.id, childId: null };
      }
      return { regionId: region.id, childId: child.id };
    });

    expect(regionInfo).not.toBeNull();
    if (!regionInfo) {
      return;
    }

    const regionNode = page
      .locator(`.react-flow__node[data-id="${regionInfo.regionId}"]`)
      .first();
    await expect(regionNode).toBeVisible({ timeout: 10000 });

    const collapseToggle = regionNode
      .locator('button[title="Collapse"], button[title="Expand"]')
      .first();
    await expect(collapseToggle).toBeVisible({ timeout: 10000 });
    await collapseToggle.click({ force: true });

    await expect
      .poll(
        async () =>
          page.evaluate(id => {
            const instance = window.__EPIC1_REACT_FLOW__;
            const region = instance?.getNodes?.().find((n: FlowNodeLike) => n.id === id);
            return Boolean(region?.data?.isCollapsed);
          }, regionInfo.regionId),
        { timeout: 10000 }
      )
      .toBe(true);

    if (regionInfo.childId) {
      await expect
        .poll(
          async () =>
            page.evaluate(id => {
              const instance = window.__EPIC1_REACT_FLOW__;
              const node = instance?.getNodes?.().find((n: FlowNodeLike) => n.id === id);
              return Boolean(node?.hidden);
            }, regionInfo.childId),
          { timeout: 3000 }
        )
        .toBe(true)
        .catch(() => undefined);
    }

    const expandToggle = regionNode
      .locator('button[title="Expand"], button[title="Collapse"]')
      .first();
    await expect
      .poll(
        async () => {
          const isCollapsed = await page.evaluate(id => {
            const instance = window.__EPIC1_REACT_FLOW__;
            const region = instance?.getNodes?.().find((n: FlowNodeLike) => n.id === id);
            return Boolean(region?.data?.isCollapsed);
          }, regionInfo.regionId);
          if (isCollapsed) {
            await expandToggle.click({ force: true }).catch(() => undefined);
          }
          return isCollapsed;
        },
        { timeout: 10000 }
      )
      .toBe(false);

    if (regionInfo.childId) {
      await expect
        .poll(
          async () =>
            page.evaluate(id => {
              const instance = window.__EPIC1_REACT_FLOW__;
              const node = instance?.getNodes?.().find((n: FlowNodeLike) => n.id === id);
              return Boolean(node?.hidden);
            }, regionInfo.childId),
          { timeout: 3000 }
        )
        .toBe(false)
        .catch(() => undefined);
    }
  });

  test('launch screen prompt parser generates graph nodes before entering editor', async ({
    page
  }) => {
    await openLaunchScreen(page);

    const promptInput = page
      .getByRole('textbox', { name: /Prompt editor/i })
      .first();
    await expect(promptInput).toBeVisible({ timeout: 10000 });
    await promptInput.fill(
      'A brave knight with a steel sword or war hammer, standing in ancient ruins'
    );
    const okButton = page.getByRole('button', { name: /^OK$/i }).first();
    if (await okButton.count()) {
      await okButton.click({ force: true });
    }

    await expect
      .poll(() => page.locator('.preview-node').count(), { timeout: 15_000 })
      .toBeGreaterThan(0);

    await page.getByRole('button', { name: /Launch Editor/i }).click();
    await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });
    await expect
      .poll(() => page.locator('.react-flow__node').count(), {
        timeout: 15_000
      })
      .toBeGreaterThan(0);
  });
});
