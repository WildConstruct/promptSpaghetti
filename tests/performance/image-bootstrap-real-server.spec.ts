import { expect, test, type Page } from '@playwright/test';

const sceneManifest = {
  assets: [
    {
      id: 'prop-1',
      kind: 'reference-still',
      role: 'hero-prop',
      storage: {
        provider: 'local',
        uri: 'file://hero-prop.png',
        contentType: 'image/png'
      },
      provenance: {
        source: 'upload'
      }
    }
  ],
  scene: null
};
const realServerAuthToken = 'playwright-real-psg-token';

const seededBootstrapGraph = {
  nodes: [
    {
      id: 'bootstrap-box-seeded',
      type: 'enhancedBoundingBox',
      position: { x: 480, y: 120 },
      selected: true,
      data: {
        bootstrapInserted: true,
        bootstrapGroupId: 'bootstrap-group-seeded',
        bootstrapMode: 'prop-variation',
        preferredComparableRefs: [
          {
            id: 'comp-prop-1-venue',
            label: 'rusted venue prop fragment'
          }
        ],
        forceSynthesisKeys: ['damage_pattern'],
        variableTraitKeys: ['damage_pattern'],
        lockedTraitKeys: ['world_style'],
        notes: 'Seeded bootstrap to refine',
        assetIds: ['prop-1']
      }
    },
    {
      id: 'bootstrap-node-seeded',
      type: 'textBlock',
      parentNode: 'bootstrap-box-seeded',
      position: { x: 32, y: 68 },
      selected: true,
      data: {
        bootstrapInserted: true,
        bootstrapGroupId: 'bootstrap-group-seeded',
        bootstrapMode: 'prop-variation',
        preferredComparableRefs: [
          {
            id: 'comp-prop-1-venue',
            label: 'rusted venue prop fragment'
          }
        ],
        forceSynthesisKeys: ['damage_pattern'],
        variableTraitKeys: ['damage_pattern'],
        lockedTraitKeys: ['world_style'],
        notes: 'Seeded bootstrap to refine',
        assetIds: ['prop-1'],
        label: 'Seeded Bootstrap'
      }
    }
  ],
  edges: []
};

async function seedEditor(page: Page, options?: { selectedBootstrap?: boolean }) {
  await page.addInitScript(seed => {
    try {
      localStorage.setItem('psg:last-view', 'editor');
      localStorage.setItem(
        'epic1-psg-scene-manifest',
        JSON.stringify(seed.sceneManifest)
      );
      localStorage.removeItem('prompt-graph-autosave');
      localStorage.removeItem('graphDraft');
      if (seed.selectedBootstrap) {
        localStorage.setItem(
          'psg:test-initial-graph',
          JSON.stringify(seed.seededBootstrapGraph)
        );
      } else {
        localStorage.removeItem('psg:test-initial-graph');
      }
      (globalThis as typeof globalThis & {
        __PROMPTSCAPE_API_BASE_URL__?: string;
        __PROMPTSCAPE_AUTH_TOKEN__?: string;
      }).__PROMPTSCAPE_API_BASE_URL__ = 'http://127.0.0.1:8000';
      (globalThis as typeof globalThis & {
        __PROMPTSCAPE_AUTH_TOKEN__?: string;
      }).__PROMPTSCAPE_AUTH_TOKEN__ = seed.authToken;
    } catch {
      // Ignore localStorage restrictions in browser tests.
    }
  }, {
    sceneManifest,
    seededBootstrapGraph,
    selectedBootstrap: options?.selectedBootstrap ?? false,
    authToken: realServerAuthToken
  });

  await page.goto('/');
  await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });
  await page.waitForSelector('.simple-menu-bar', { timeout: 20_000 });
}

test('image bootstrap uses the real PSG server fixture path', async ({ page }) => {
  await seedEditor(page);

  const fileMenu = page.locator('.menu-section').filter({ hasText: 'File' }).first();
  await fileMenu.hover();
  await page.getByRole('button', { name: 'Image Bootstrap...' }).click();

  await expect(
    page.getByRole('heading', { name: 'Image Bootstrap' })
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'User intent' }).fill(
    'build prop variations'
  );
  const analyzeResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/analyze') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Analyze Images' }).click();
  const analyzeResponse = await analyzeResponsePromise;
  expect(analyzeResponse.status()).toBe(200);
  const analyzePayload = await analyzeResponse.json();

  await expect(page.getByText('Review Checkpoint')).toBeVisible();
  await expect(page.getByText(/rusted venue prop family/i)).toBeVisible();
  await expect(page.getByText(/rusted venue prop fragment/i)).toBeVisible();
  await page.getByLabel(/lock explicitly/i).check();
  expect(analyzePayload).toMatchObject({
    checkpoint: {
      bootstrapMode: 'prop-variation',
      analyses: [
        expect.objectContaining({
          assetId: 'prop-1'
        })
      ],
      comparableMatches: [
        expect.objectContaining({
          label: 'rusted venue prop fragment'
        })
      ]
    }
  });

  await page
    .locator('label')
    .filter({ hasText: 'rusted venue prop fragment' })
    .getByRole('checkbox')
    .check();
  await page.getByRole('textbox', { name: 'Review notes' }).fill(
    'Keep the venue wear family but synthesize new damage'
  );
  const reviewResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/review') &&
      response.request().method() === 'POST'
  );
  const draftResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/draft-graph') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Draft And Insert' }).click();
  const reviewResponse = await reviewResponsePromise;
  const draftResponse = await draftResponsePromise;
  expect(reviewResponse.status()).toBe(200);
  expect(draftResponse.status()).toBe(200);
  const draftPayload = await draftResponse.json();

  await expect(page.getByText(/invalid_type/i)).toHaveCount(0);
  expect(draftPayload).toMatchObject({
    draftFragment: {
      metadata: {
        imageBootstrap: {
          bootstrapMode: 'prop-variation',
          analysisSources: [
            expect.objectContaining({
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'explicit'
            })
          ],
          preferredComparableRefs: [
            expect.objectContaining({
              label: 'rusted venue prop fragment'
            })
          ],
          notes: 'Keep the venue wear family but synthesize new damage'
        }
      },
      nodes: expect.arrayContaining([
        expect.objectContaining({
          type: 'TextBlock'
        }),
        expect.objectContaining({
          type: 'WeightedChoice',
          options: expect.arrayContaining([
            expect.objectContaining({
              label: 'damage_pattern',
              text: 'surface wear'
            })
          ])
        })
      ])
    }
  });
});

test('image bootstrap refinement uses the real PSG server fixture path', async ({
  page
}) => {
  await seedEditor(page, { selectedBootstrap: true });

  await expect(
    page.getByText(/prop-variation grounded in selected refs/i)
  ).toBeVisible();
  await page.getByRole('button', { name: 'Refine Bootstrap...' }).click();

  await expect(
    page.getByRole('heading', { name: 'Refine Image Bootstrap' })
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'User intent' }).fill(
    'build prop variations and preserve the venue wear family'
  );
  const analyzeResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/analyze') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Analyze Images' }).click();
  const analyzeResponse = await analyzeResponsePromise;
  expect(analyzeResponse.status()).toBe(200);

  await expect(page.getByText('Review Checkpoint')).toBeVisible();
  await page.getByLabel(/lock explicitly/i).check();
  await expect(
    page.locator('label').filter({ hasText: 'rusted venue prop fragment' }).first()
  ).toBeVisible();

  await page.getByRole('textbox', { name: 'Review notes' }).fill(
    'Refine the seeded bootstrap through the real PSG server'
  );
  const reviewResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/review') &&
      response.request().method() === 'POST'
  );
  const draftResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/draft-graph') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Refine And Replace' }).click();
  const reviewResponse = await reviewResponsePromise;
  const draftResponse = await draftResponsePromise;
  expect(reviewResponse.status()).toBe(200);
  expect(draftResponse.status()).toBe(200);

  const reviewPayload = await reviewResponse.json();
  const draftPayload = await draftResponse.json();

  await expect(page.getByText(/invalid_type/i)).toHaveCount(0);
  expect(reviewPayload).toMatchObject({
    checkpoint: {
      guidance: {
        notes: 'Refine the seeded bootstrap through the real PSG server'
      }
    }
  });
  expect(draftPayload).toMatchObject({
    draftFragment: {
      metadata: {
        imageBootstrap: {
          bootstrapMode: 'prop-variation',
          analysisSources: [
            expect.objectContaining({
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'explicit'
            })
          ],
          notes: 'Refine the seeded bootstrap through the real PSG server'
        }
      },
      nodes: expect.arrayContaining([
        expect.objectContaining({
          type: 'WeightedChoice',
          options: expect.arrayContaining([
            expect.objectContaining({
              label: 'label_variant',
              text: 'faded venue sticker'
            })
          ])
        })
      ])
    }
  });
});
