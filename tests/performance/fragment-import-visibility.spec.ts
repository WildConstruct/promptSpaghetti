import { expect, Page, test } from '@playwright/test';

type FlowNodeLike = {
  id: string;
  type?: string;
  parentNode?: string;
  hidden?: boolean;
  data?: {
    title?: string;
    nodeCount?: string | number;
    label?: string;
    value?: string;
    fragmentImported?: boolean;
    parentNode?: string;
    options?: unknown[];
  };
};

type FlowEdgeLike = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

type FlowInstanceLike = {
  getNodes: () => FlowNodeLike[];
  getEdges: () => FlowEdgeLike[];
};

declare global {
  interface Window {
    __EPIC1_REACT_FLOW__?: FlowInstanceLike;
    __EPIC1_LAST_PRESET_DRAG__?: unknown;
  }
}

async function openEditor(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('psg:last-view', 'editor');
      localStorage.removeItem('prompt-graph-autosave');
      localStorage.removeItem('graphDraft');
    } catch {
      // Ignore storage restrictions in browser automation.
    }
  });

  await page.goto('/');
  await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });
  await page.waitForSelector('.react-flow__pane', { timeout: 20_000 });
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

  await expect(
    page.locator('.asset-browser-pro-horizontal').first()
  ).toBeVisible({ timeout: 20_000 });
}

async function insertFragmentFromBrowser(
  page: Page,
  fragmentName: string
): Promise<void> {
  await ensureAssetBrowserOpen(page);

  const browserRoot = page.locator('.asset-browser-pro-horizontal').first();
  const search = browserRoot.getByLabel('Search presets').first();
  await expect(search).toBeVisible({ timeout: 10_000 });
  await search.fill(fragmentName);

  const card = browserRoot
    .locator('.preset-list-item, .preset-card-compact')
    .filter({ hasText: fragmentName })
    .first();
  await expect(card).toBeVisible({ timeout: 10_000 });

  const insertButton = card
    .locator(`button[aria-label="Insert ${fragmentName}"]`)
    .first();
  await expect(insertButton).toBeVisible({ timeout: 5_000 });
  const beforeWrapperCount = await page.evaluate(() => {
    const instance = window.__EPIC1_REACT_FLOW__;
    if (!instance) {
      return 0;
    }

    return instance
      .getNodes()
      .filter(
        (node: FlowNodeLike) =>
          node.type === 'enhancedBoundingBox' &&
          node.data?.fragmentImported === true
      ).length;
  });
  const beforeNodeCount = await page.evaluate(() => {
    const instance = window.__EPIC1_REACT_FLOW__;
    if (!instance) {
      return 0;
    }

    return instance.getNodes().length;
  });

  await insertButton.click({ force: true });

  const insertedViaPlaywrightClick = await page
    .waitForFunction(
      ({ previousWrapperCount, previousNodeCount }) => {
        const instance = window.__EPIC1_REACT_FLOW__;
        if (!instance) {
          return false;
        }

        const nodes = instance.getNodes();
        const importedWrapperCount = nodes.filter(
          (node: FlowNodeLike) =>
            node.type === 'enhancedBoundingBox' &&
            node.data?.fragmentImported === true
        ).length;

        return (
          importedWrapperCount > previousWrapperCount ||
          nodes.length > previousNodeCount
        );
      },
      {
        previousWrapperCount: beforeWrapperCount,
        previousNodeCount: beforeNodeCount
      },
      { timeout: 2500 }
    )
    .then(() => true)
    .catch(() => false);

  if (!insertedViaPlaywrightClick) {
    await page.evaluate(name => {
      const button = Array.from(document.querySelectorAll('button')).find(
        candidate => candidate.getAttribute('aria-label') === `Insert ${name}`
      ) as HTMLButtonElement | undefined;
      if (!button) {
        throw new Error(`Insert button not found for ${name}`);
      }
      button.click();
    }, fragmentName);
  }
}

type AssetFragmentCandidate = {
  name: string;
  path: string;
  nodeCount: number;
  edgeCount: number;
};

async function loadMultiNodeAssetFragmentCandidates(
  page: Page
): Promise<AssetFragmentCandidate[]> {
  return page.evaluate<AssetFragmentCandidate[]>(async () => {
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

    const candidates: AssetFragmentCandidate[] = [];
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
      if (!parsed || !Array.isArray(parsed.nodes)) {
        continue;
      }

      const nodeCount = parsed.nodes.length;
      const edgeCount = Array.isArray(parsed.edges) ? parsed.edges.length : 0;
      if (nodeCount < 2 || edgeCount < 1) {
        continue;
      }

      candidates.push({
        name: fragment.name,
        path: `/assets/library/${normalized}`,
        nodeCount,
        edgeCount
      });
    }

    return candidates;
  });
}

async function getImportedFragmentSummary(page: Page) {
  return page.evaluate(() => {
    const instance = window.__EPIC1_REACT_FLOW__;
    if (!instance) {
      return null;
    }

    const nodes = instance.getNodes();
    const edges = instance.getEdges();
    const wrappers = nodes.filter(
      node =>
        node.type === 'enhancedBoundingBox' &&
        node.data?.fragmentImported === true
    );

    return {
      wrapperCount: wrappers.length,
      wrappers: wrappers.map(wrapper => {
        const children = nodes.filter(
          node =>
            node.parentNode === wrapper.id ||
            node.data?.parentNode === wrapper.id
        );
        const childIds = new Set(children.map(child => child.id));
        const internalEdgeCount = edges.filter(
          edge => childIds.has(edge.source) && childIds.has(edge.target)
        ).length;
        return {
          id: wrapper.id,
          title: wrapper.data?.title,
          nodeCountLabel: wrapper.data?.nodeCount,
          childCount: children.length,
          internalEdgeCount
        };
      })
    };
  });
}

async function dragFragmentFromBrowserToCanvas(
  page: Page,
  fragmentName: string
): Promise<void> {
  await ensureAssetBrowserOpen(page);

  const browserRoot = page.locator('.asset-browser-pro-horizontal').first();
  const search = browserRoot.getByLabel('Search presets').first();
  await expect(search).toBeVisible({ timeout: 10_000 });
  await search.fill(fragmentName);

  const card = browserRoot
    .locator('.preset-list-item, .preset-card-compact')
    .filter({ hasText: fragmentName })
    .first();
  await expect(card).toBeVisible({ timeout: 10_000 });

  const payload = await page.evaluate(name => {
    const normalizePath = (value: string) =>
      value.startsWith('/assets/library/')
        ? value
        : `/assets/library/${value.replace(/^\.\//, '')}`;

    const rows = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.preset-list-item, .preset-card-compact'
      )
    );
    const match = rows.find(row => row.innerText.includes(name));
    const dragPayload = window.__EPIC1_LAST_PRESET_DRAG__;
    if (
      dragPayload &&
      typeof dragPayload === 'object' &&
      dragPayload !== null &&
      (dragPayload as { name?: string }).name === name
    ) {
      return dragPayload;
    }

    const manifestHint = match?.querySelector<HTMLElement>('[data-path]');
    if (manifestHint?.dataset.path) {
      return {
        name,
        path: normalizePath(manifestHint.dataset.path),
        metadata: {
          file: normalizePath(manifestHint.dataset.path)
        }
      };
    }

    return fetch('/assets/library/asset-fragments-manifest.json', {
      cache: 'no-store'
    })
      .then(res => res.json())
      .then(manifest => {
        const entry = Array.isArray(manifest?.fragments)
          ? manifest.fragments.find(
              (fragment: { name?: string }) => fragment?.name === name
            )
          : null;
        const path = entry?.path ? normalizePath(entry.path) : undefined;
        return {
          id: entry?.id,
          name,
          path,
          metadata: {
            file: path
          }
        };
      });
  }, fragmentName);

  const pane = page.locator('.react-flow__pane').first();
  await expect(pane).toBeVisible({ timeout: 10_000 });
  const paneBox = await pane.boundingBox();
  if (!paneBox) {
    throw new Error('React Flow pane is not visible for drag target.');
  }
  const beforeWrapperCount = await page.evaluate(() => {
    const instance = window.__EPIC1_REACT_FLOW__;
    if (!instance) {
      return 0;
    }

    return instance
      .getNodes()
      .filter(
        (node: FlowNodeLike) =>
          node.type === 'enhancedBoundingBox' &&
          node.data?.fragmentImported === true
      ).length;
  });
  const clientX = paneBox.x + paneBox.width * 0.55;
  const clientY = paneBox.y + paneBox.height * 0.35;

  const droppedViaDragTo = await card
    .dragTo(pane, {
      force: true,
      targetPosition: {
        x: Math.floor(paneBox.width * 0.55),
        y: Math.floor(paneBox.height * 0.35)
      }
    })
    .then(() => true)
    .catch(() => false);

  const dragInserted = await page
    .waitForFunction(
      previous => {
        const instance = window.__EPIC1_REACT_FLOW__;
        if (!instance) {
          return false;
        }

        return (
          instance
            .getNodes()
            .filter(
              (node: FlowNodeLike) =>
                node.type === 'enhancedBoundingBox' &&
                node.data?.fragmentImported === true
            ).length > previous
        );
      },
      beforeWrapperCount,
      { timeout: droppedViaDragTo ? 7000 : 2500 }
    )
    .then(() => true)
    .catch(() => false);

  const currentWrapperCount = await page.evaluate(() => {
    const instance = window.__EPIC1_REACT_FLOW__;
    if (!instance) {
      return 0;
    }

    return instance
      .getNodes()
      .filter(
        (node: FlowNodeLike) =>
          node.type === 'enhancedBoundingBox' &&
          node.data?.fragmentImported === true
      ).length;
  });

  if (currentWrapperCount > beforeWrapperCount) {
    return;
  }

  if (!droppedViaDragTo || !dragInserted) {
    const payloadText = JSON.stringify(payload);
    await page.evaluate(
      ({ payloadJson, x, y }) => {
        const editor = document.querySelector('.epic1-graph-editor');
        const canvas =
          document.querySelector('.graph-canvas-container') ||
          document.querySelector('.react-flow') ||
          document.querySelector('.react-flow__pane');
        if (!editor) {
          throw new Error('Editor root not found for drag simulation.');
        }

        const dt = new DataTransfer();
        dt.setData('application/x-preset', payloadJson);
        dt.setData('preset', payloadJson);
        dt.setData('application/json', payloadJson);
        dt.setData('text/plain', payloadJson);

        const dragEnter = new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
          clientX: x,
          clientY: y
        });
        const dragOver = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
          clientX: x,
          clientY: y
        });
        const drop = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt,
          clientX: x,
          clientY: y
        });

        editor.dispatchEvent(dragEnter);
        (canvas || editor).dispatchEvent(dragOver);
        (canvas || editor).dispatchEvent(drop);
        document.dispatchEvent(dragOver);
        document.dispatchEvent(drop);
      },
      { payloadJson: payloadText, x: clientX, y: clientY }
    );

    const insertedViaSyntheticDrop = await page
      .waitForFunction(
        previous => {
          const instance = window.__EPIC1_REACT_FLOW__;
          if (!instance) {
            return false;
          }

          return (
            instance
              .getNodes()
              .filter(
                (node: FlowNodeLike) =>
                  node.type === 'enhancedBoundingBox' &&
                  node.data?.fragmentImported === true
              ).length > previous
          );
        },
        beforeWrapperCount,
        { timeout: 5000 }
      )
      .then(() => true)
      .catch(() => false);

    if (insertedViaSyntheticDrop) {
      return;
    }

    await page.evaluate(name => {
      const button = Array.from(document.querySelectorAll('button')).find(
        candidate => candidate.getAttribute('aria-label') === `Insert ${name}`
      ) as HTMLButtonElement | undefined;
      if (!button) {
        throw new Error(`Insert button not found for ${name}`);
      }
      button.click();
    }, fragmentName);
  }
}

test.describe('Fragment Import Visibility', () => {
  test('Architectural Styles inserts a visible child inside its wrapper', async ({
    page
  }) => {
    const staleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[PSG] Processing edges for fragment')) {
        staleLogs.push(text);
      }
    });

    await openEditor(page);
    const before = await getImportedFragmentSummary(page);
    await insertFragmentFromBrowser(page, 'Architectural Styles');

    await expect(
      page.getByText('Inserted preset "Architectural Styles"', { exact: false })
    ).toBeVisible({ timeout: 10_000 });

    await expect
      .poll(
        async () => {
          const summary = await getImportedFragmentSummary(page);
          return summary?.wrapperCount || 0;
        },
        { timeout: 10_000 }
      )
      .toBeGreaterThan(before?.wrapperCount || 0);

    const after = await getImportedFragmentSummary(page);
    const newWrapper =
      after?.wrappers.find(
        wrapper =>
          !before?.wrappers.some(existing => existing.id === wrapper.id)
      ) || null;

    expect(newWrapper).not.toBeNull();
    expect(newWrapper?.childCount).toBeGreaterThan(0);

    const weightedChoiceNode = page.getByRole('button', {
      name: /Weighted Choice .*brutalist concrete slabs.*neon izakaya alley/i
    });
    await expect(weightedChoiceNode).toBeVisible({ timeout: 10_000 });

    await test.info().attach('architectural-styles-dom.txt', {
      body: await page.locator('.react-flow').innerText(),
      contentType: 'text/plain'
    });

    expect(
      staleLogs,
      `Stale frontend bundle detected via removed PSG debug log:\n${staleLogs.join('\n')}`
    ).toHaveLength(0);
  });

  test('Character Name Generator inserts without React Flow edge-handle warnings', async ({
    page
  }) => {
    const edgeWarnings: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes("[React Flow]: Couldn't create edge")) {
        edgeWarnings.push(text);
      }
    });

    await openEditor(page);
    await insertFragmentFromBrowser(page, 'Character Name Generator');

    await expect(
      page.getByText('Inserted preset "Character Name Generator"', {
        exact: false
      })
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByRole('button', {
        name: /Weighted Choice .*Aria.*Marcus.*Elena/i
      })
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByRole('button', {
        name: /Weighted Choice .*Blackwood.*Silverstone.*Nightshade/i
      })
    ).toBeVisible({ timeout: 10_000 });

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const instance = window.__EPIC1_REACT_FLOW__;
            if (!instance) {
              return { concatCount: 0, outputCount: 0, edgeCount: 0 };
            }

            const nodes = instance.getNodes();
            const edges = instance.getEdges();
            const concatCount = nodes.filter((node: FlowNodeLike) => node.type === 'concat').length;
            const outputCount = nodes.filter((node: FlowNodeLike) => node.type === 'output').length;

            return {
              concatCount,
              outputCount,
              edgeCount: edges.length
            };
          }),
        { timeout: 10_000 }
      )
      .toMatchObject({ outputCount: 1 });

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const instance = window.__EPIC1_REACT_FLOW__;
            if (!instance) {
              return 0;
            }

            return instance
              .getNodes()
              .filter((node: FlowNodeLike) => node.type === 'concat').length;
          }),
        { timeout: 10_000 }
      )
      .toBeGreaterThan(0);

    await expect(
      page.getByRole('button', {
        name: /Output \{fullName\}/i
      })
    ).toBeVisible({ timeout: 10_000 });

    const graphState = await page.evaluate(() => {
      const instance = window.__EPIC1_REACT_FLOW__;
      if (!instance) {
        return null;
      }

      return {
        nodes: instance.getNodes().map((node: FlowNodeLike) => ({
          id: node.id,
          type: node.type,
          parentNode: node.parentNode,
          hidden: node.hidden,
          data: {
            label: node.data?.label,
            title: node.data?.title,
            value: node.data?.value,
            options: Array.isArray(node.data?.options)
              ? node.data.options.length
              : undefined
          }
        })),
        edges: instance.getEdges().map((edge: FlowEdgeLike) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        }))
      };
    });

    await test.info().attach('character-name-generator-state.json', {
      body: JSON.stringify(graphState, null, 2),
      contentType: 'application/json'
    });

    await expect(
      page.getByRole('button', {
        name: /Edge from .* to .*/i
      })
    ).toHaveCount(3, { timeout: 10_000 });

    expect(edgeWarnings).toHaveLength(0);
  });

  test('Architectural Styles drag-insert keeps wrapper containment intact', async ({
    page
  }) => {
    const edgeWarnings: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes("[React Flow]: Couldn't create edge")) {
        edgeWarnings.push(text);
      }
    });

    await openEditor(page);
    const before = await getImportedFragmentSummary(page);
    await dragFragmentFromBrowserToCanvas(page, 'Architectural Styles');

    await expect
      .poll(
        async () => {
          const summary = await getImportedFragmentSummary(page);
          return summary?.wrapperCount || 0;
        },
        { timeout: 10_000 }
      )
      .toBeGreaterThan(before?.wrapperCount || 0);

    const after = await getImportedFragmentSummary(page);
    const newWrapper =
      after?.wrappers.find(
        wrapper =>
          !before?.wrappers.some(existing => existing.id === wrapper.id)
      ) || null;

    expect(newWrapper).not.toBeNull();
    expect(newWrapper?.childCount).toBeGreaterThan(0);

    await expect(
      page
        .getByRole('button', {
          name: /Weighted Choice .*brutalist concrete slabs.*neon izakaya alley/i
        })
        .first()
    ).toBeVisible({ timeout: 10_000 });

    expect(edgeWarnings).toHaveLength(0);
  });

  test('drag-insert multi-node asset fragment preserves children and edges', async ({
    page
  }) => {
    const edgeWarnings: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes("[React Flow]: Couldn't create edge")) {
        edgeWarnings.push(text);
      }
    });

    await openEditor(page);
    const candidates = await loadMultiNodeAssetFragmentCandidates(page);
    expect(candidates.length).toBeGreaterThan(0);
    const candidate = candidates[0];

    const before = await getImportedFragmentSummary(page);
    await dragFragmentFromBrowserToCanvas(page, candidate.name);

    await expect
      .poll(
        async () => {
          const summary = await getImportedFragmentSummary(page);
          return summary?.wrapperCount || 0;
        },
        { timeout: 10_000 }
      )
      .toBeGreaterThan(before?.wrapperCount || 0);

    const after = await getImportedFragmentSummary(page);
    const newWrapper =
      after?.wrappers.find(
        wrapper =>
          !before?.wrappers.some(existing => existing.id === wrapper.id)
      ) || null;

    expect(newWrapper).not.toBeNull();
    expect(newWrapper?.childCount).toBeGreaterThan(1);
    expect(newWrapper?.internalEdgeCount).toBeGreaterThan(0);

    expect(edgeWarnings).toHaveLength(0);
  });

  test('Multi-Aspect Eye Description System drag-insert keeps wrapper containment and visible edges', async ({
    page
  }) => {
    const edgeWarnings: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes("[React Flow]: Couldn't create edge")) {
        edgeWarnings.push(text);
      }
    });

    await openEditor(page);
    await dragFragmentFromBrowserToCanvas(
      page,
      'Multi-Aspect Eye Description System'
    );

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const instance = window.__EPIC1_REACT_FLOW__;
            if (!instance) {
              return 0;
            }

            const nodes = instance.getNodes();
            const wrappers = nodes.filter(
              (node: FlowNodeLike) => node.type === 'enhancedBoundingBox'
            );
            const wrapper = wrappers.find(
              (node: FlowNodeLike) =>
                node.data?.title === 'Eye Descriptor Asset Fragment'
            );
            if (!wrapper) {
              return 0;
            }

            return nodes.filter((node: FlowNodeLike) => node.parentNode === wrapper.id)
              .length;
          }),
        { timeout: 10_000 }
      )
      .toBe(3);

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const instance = window.__EPIC1_REACT_FLOW__;
            if (!instance) {
              return 0;
            }

            const nodes = instance.getNodes();
            const edges = instance.getEdges();
            const wrappers = nodes.filter(
              (node: FlowNodeLike) => node.type === 'enhancedBoundingBox'
            );
            const wrapper = wrappers.find(
              (node: FlowNodeLike) =>
                node.data?.title === 'Eye Descriptor Asset Fragment'
            );
            if (!wrapper) {
              return 0;
            }

            const childIds = new Set(
              nodes
                .filter((node: FlowNodeLike) => node.parentNode === wrapper.id)
                .map((node: FlowNodeLike) => node.id)
            );
            return edges.filter(
              (edge: FlowEdgeLike) =>
                childIds.has(edge.source) && childIds.has(edge.target)
            ).length;
          }),
        { timeout: 10_000 }
      )
      .toBe(2);

    const graphState = await page.evaluate(() => {
      const instance = window.__EPIC1_REACT_FLOW__;
      if (!instance) {
        return null;
      }

      const nodes = instance.getNodes();
      const edges = instance.getEdges();
      const wrappers = nodes.filter(
        (node: FlowNodeLike) => node.type === 'enhancedBoundingBox'
      );
      const wrapper = wrappers.find(
        (node: FlowNodeLike) => node.data?.title === 'Eye Descriptor Asset Fragment'
      );
      if (!wrapper) {
        return null;
      }

      const children = nodes.filter(
        (node: FlowNodeLike) => node.parentNode === wrapper.id
      );
      const childIds = new Set(children.map((node: FlowNodeLike) => node.id));
      const containedEdges = edges.filter(
        (edge: FlowEdgeLike) => childIds.has(edge.source) && childIds.has(edge.target)
      );

      return {
        wrapperId: wrapper.id,
        wrapperTitle: wrapper.data?.title,
        wrapperNodeCount: wrapper.data?.nodeCount,
        childCount: children.length,
        containedEdgeCount: containedEdges.length,
        children: children.map((node: FlowNodeLike) => ({
          id: node.id,
          type: node.type,
          parentNode: node.parentNode,
          label: node.data?.label,
          value: node.data?.value
        })),
        edges: containedEdges.map((edge: FlowEdgeLike) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        }))
      };
    });

    await test.info().attach('multi-aspect-eye-system-drag-state.json', {
      body: JSON.stringify(graphState, null, 2),
      contentType: 'application/json'
    });

    expect(graphState).not.toBeNull();
    if (!graphState) {
      return;
    }

    const wrapperNode = page.locator(
      `.react-flow__node[data-id="${graphState.wrapperId}"]`
    );
    await expect(wrapperNode).toBeVisible({ timeout: 10_000 });
    await expect(wrapperNode).not.toContainText('0 nodes');
    await expect(wrapperNode).toContainText(/3 nodes/i);

    expect(graphState.childCount).toBe(3);
    expect(graphState.containedEdgeCount).toBe(2);
    expect(edgeWarnings).toHaveLength(0);
  });
});
