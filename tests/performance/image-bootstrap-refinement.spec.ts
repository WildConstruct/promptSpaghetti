import { expect, test, type Page } from '@playwright/test';

async function openEditorWithBootstrapSelection(page: Page) {
  await page.addInitScript(() => {
    try {
      (globalThis as typeof globalThis & {
        __env__?: Record<string, string>;
      }).__env__ = {
        ...((globalThis as typeof globalThis & {
          __env__?: Record<string, string>;
        }).__env__ || {}),
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'test-anon-key',
        VITE_FEATURE_SUPABASE: 'true',
        VITE_FEATURE_CLOUD_PSG: 'true'
      };
      localStorage.setItem('psg:last-view', 'editor');
      localStorage.setItem('psg:scene-preview-v1', 'true');
      localStorage.setItem(
        'psg:test-initial-graph',
        JSON.stringify({
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
                reviewCheckpoint: {
                  requestId: 'req-seeded',
                  bootstrapMode: 'prop-variation',
                  analyses: [],
                  exactMatches: [],
                  comparableMatches: [],
                  uncertainTraitKeys: [],
                  guidance: {}
                },
                preferredComparableRefs: [
                  {
                    id: 'comp-1',
                    label: 'similar prop'
                  }
                ],
                forceSynthesisKeys: ['damage_pattern'],
                variableTraitKeys: ['damage_pattern'],
                lockedTraitKeys: ['world_style'],
                notes: 'Prefer the rusted venue prop family',
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
                reviewCheckpoint: {
                  requestId: 'req-seeded',
                  bootstrapMode: 'prop-variation',
                  analyses: [],
                  exactMatches: [],
                  comparableMatches: [],
                  uncertainTraitKeys: [],
                  guidance: {}
                },
                preferredComparableRefs: [
                  {
                    id: 'comp-1',
                    label: 'similar prop'
                  }
                ],
                forceSynthesisKeys: ['damage_pattern'],
                variableTraitKeys: ['damage_pattern'],
                lockedTraitKeys: ['world_style'],
                notes: 'Prefer the rusted venue prop family',
                assetIds: ['prop-1'],
                label: 'Seeded Bootstrap'
              }
            }
          ],
          edges: []
        })
      );
      localStorage.setItem(
        'epic1-psg-scene-manifest',
        JSON.stringify({
          assets: [
            {
              id: 'prop-1',
              kind: 'reference-still',
              role: 'hero-prop',
              storage: {
                provider: 'local',
                uri: 'file://prop.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            }
          ],
          scene: null
        })
      );
      localStorage.removeItem('epic1-graph');
      localStorage.removeItem('prompt-graph-autosave');
      localStorage.removeItem('graphDraft');
      localStorage.removeItem('prompt-spaghetti:autosave');
      localStorage.removeItem('prompt-spaghetti:workspace');
      localStorage.removeItem('epic1-graph-autosave');
      localStorage.removeItem('promptgraph:state:v1');
      sessionStorage.removeItem('prompt-spaghetti:recovery-dismissed');
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
          'images-preview',
          'images-generate-batch'
        ],
        exportTargets: ['comfy']
      })
    });
  });

  await page.goto('/');
  await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });
}

test('selected bootstrap opens the image bootstrap dialog in refinement mode', async ({
  page
}) => {
  await openEditorWithBootstrapSelection(page);

  await expect(
    page.getByText(/prop-variation grounded in selected refs/i)
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refine Bootstrap...' })).toBeVisible();

  await page.getByRole('button', { name: 'Refine Bootstrap...' }).click();

  await expect(page.getByText('Refine Image Bootstrap')).toBeVisible();
  await expect(
    page.getByText(/replace bootstrap group bootstrap-group-seeded in place/i)
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refine And Replace' })).toBeVisible();
});

test('selected bootstrap can preview and refresh all from the selection panel', async ({
  page
}) => {
  let previewCallCount = 0;

  await page.route('**/api/psg/images/preview', async route => {
    previewCallCount += 1;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        document: {
          version: 'psg/1',
          kind: 'fragment',
          metadata: {
            name: 'Working Graph'
          },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [
              {
                id: 'output-1',
                type: 'Output',
                x: 0,
                y: 0,
                label: 'Output',
                output: 'preview'
              }
            ],
            edges: []
          },
          assets: []
        },
        checkpoint: {
          reviewId: 'review-seeded',
          bootstrapMode: 'prop-variation',
          analyses: [
            {
              assetId: 'prop-1',
              subjectKind: 'prop',
              bootstrapMode: 'prop-variation',
              analysisSource: {
                fixtureId: 'hero-prop-venue',
                selectionMode: 'explicit'
              },
              subjects: [],
              regions: [],
              lockedTraits: [
                {
                  key: 'world_style',
                  value: 'rusted venue prop family',
                  classification: 'locked',
                  confidence: 0.91,
                  provenance: ['human'],
                  evidence: [],
                  conflicts: []
                }
              ],
              variableTraits: [
                {
                  key: 'damage_pattern',
                  value: 'surface wear',
                  classification: 'variable',
                  confidence: 0.86,
                  provenance: ['human'],
                  evidence: [],
                  conflicts: []
                }
              ],
              variationAxes: [],
              segmentationFindings: [],
              modelFindings: [],
              comparableSearchTerms: [],
              confidence: 0.9
            }
          ],
          exactMatches: [],
          comparableMatches: [
            {
              id: 'comp-1',
              origin: 'comparable',
              kind: 'asset',
              label: 'rusted venue prop fragment',
              score: 0.79,
              reasonCodes: ['fixture-comparable'],
              sourceRef: 'fixture://rusted-venue-prop-fragment'
            }
          ],
          uncertainTraits: [],
          guidance: {
            bootstrapMode: 'prop-variation',
            excludedRegionIds: [],
            lockedTraitKeys: ['world_style'],
            variableTraitKeys: ['damage_pattern'],
            rejectedTraitKeys: [],
            addedLockedTraits: [],
            addedVariableTraits: [],
            preferredComparableMatchIds: ['comp-1'],
            forceSynthesisKeys: [],
            notes: 'Keep the venue wear family'
          }
        },
        preview: {
          backend: {
            id: 'mock-image-preview',
            mode: 'mock',
            label: 'Mock Image Preview',
            model: 'bootstrap-deterministic-v1'
          },
          count: 3,
          seed: 1234 + previewCallCount,
          promptBlueprint: `locked:world_style | vary:damage_pattern | pass_${previewCallCount}`,
          results: [
            {
              id: `preview-${previewCallCount}-1`,
              seed: 1234 + previewCallCount,
              prompt: 'preview prompt 1',
              imageUrl: `https://example.com/preview-${previewCallCount}-1.png`,
              width: 512,
              height: 512,
              metadata: {
                assetIds: ['prop-1'],
                preferredComparableLabels: ['neon wall sign'],
                lockedTraitKeys: ['world_style'],
                variableTraitKeys: ['damage_pattern']
              }
            }
          ]
        },
        issues: []
      })
    });
  });

  await openEditorWithBootstrapSelection(page);

  await expect(
    page.getByRole('button', { name: 'Preview Bootstrap...' })
  ).toBeEnabled();
  const firstPreviewResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/preview') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Preview Bootstrap...' }).click();
  const firstPreviewResponse = await firstPreviewResponsePromise;
  expect(firstPreviewResponse.status()).toBe(200);
  await expect(
    page.getByText(/Mock Image Preview · bootstrap-deterministic-v1/i)
  ).toBeVisible();
  await expect(
    page.getByText(/locked:world_style \| vary:damage_pattern \| pass_1/i)
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Refresh all' })).toBeVisible();

  const secondPreviewResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/preview') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Refresh all' }).click();
  const secondPreviewResponse = await secondPreviewResponsePromise;
  expect(secondPreviewResponse.status()).toBe(200);
  await expect(
    page.getByText(/locked:world_style \| vary:damage_pattern \| pass_2/i)
  ).toBeVisible();
});

test('selected bootstrap preview can promote a result into queued refinement', async ({
  page
}) => {
  await page.route('**/api/psg/images/preview', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        document: {
          version: 'psg/1',
          kind: 'fragment',
          metadata: {
            name: 'Working Graph'
          },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [
              {
                id: 'output-1',
                type: 'Output',
                x: 0,
                y: 0,
                label: 'Output',
                output: 'preview'
              }
            ],
            edges: []
          },
          assets: []
        },
        checkpoint: {
          reviewId: 'review-seeded',
          bootstrapMode: 'prop-variation',
          analyses: [
            {
              assetId: 'prop-1',
              subjectKind: 'prop',
              bootstrapMode: 'prop-variation',
              analysisSource: {
                fixtureId: 'hero-prop-venue',
                selectionMode: 'explicit'
              },
              subjects: [],
              regions: [],
              lockedTraits: [
                {
                  key: 'world_style',
                  value: 'rusted venue prop family',
                  classification: 'locked',
                  confidence: 0.91,
                  provenance: ['human'],
                  evidence: [],
                  conflicts: []
                }
              ],
              variableTraits: [
                {
                  key: 'damage_pattern',
                  value: 'surface wear',
                  classification: 'variable',
                  confidence: 0.86,
                  provenance: ['human'],
                  evidence: [],
                  conflicts: []
                }
              ],
              variationAxes: [],
              segmentationFindings: [],
              modelFindings: [],
              comparableSearchTerms: [],
              confidence: 0.9
            }
          ],
          exactMatches: [],
          comparableMatches: [
            {
              id: 'comp-1',
              origin: 'comparable',
              kind: 'asset',
              label: 'rusted venue prop fragment',
              score: 0.79,
              reasonCodes: ['fixture-comparable'],
              sourceRef: 'fixture://rusted-venue-prop-fragment'
            }
          ],
          uncertainTraits: [],
          guidance: {
            bootstrapMode: 'prop-variation',
            excludedRegionIds: [],
            lockedTraitKeys: ['world_style'],
            variableTraitKeys: ['damage_pattern'],
            rejectedTraitKeys: [],
            addedLockedTraits: [],
            addedVariableTraits: [],
            preferredComparableMatchIds: ['comp-1'],
            forceSynthesisKeys: [],
            notes: 'Keep the venue wear family'
          }
        },
        preview: {
          backend: {
            id: 'mock-image-preview',
            mode: 'mock',
            label: 'Mock Image Preview',
            model: 'bootstrap-deterministic-v1'
          },
          count: 1,
          seed: 3456,
          promptBlueprint: 'locked:world_style | vary:damage_pattern | promote_pass',
          results: [
            {
              id: 'preview-promote-1',
              seed: 3456,
              prompt: 'preview prompt promote',
              imageUrl: 'https://example.com/preview-promote-1.png',
              width: 512,
              height: 512,
              metadata: {
                assetIds: ['prop-1'],
                preferredComparableLabels: ['neon wall sign'],
                lockedTraitKeys: ['world_style'],
                variableTraitKeys: ['damage_pattern']
              }
            }
          ]
        },
        issues: []
      })
    });
  });

  await openEditorWithBootstrapSelection(page);

  const previewResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/preview') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Preview Bootstrap...' }).click();
  const previewResponse = await previewResponsePromise;
  expect(previewResponse.status()).toBe(200);

  await expect(page.getByRole('button', { name: 'Promote' })).toBeVisible();
  await page.getByRole('button', { name: 'Promote' }).click();

  await expect(
    page.getByText(/Queued refinement: neon wall sign/i)
  ).toBeVisible();
  const queuedRefinementBanner = page
    .getByRole('button', { name: 'Clear queued refinement' })
    .locator('..');
  await expect(
    queuedRefinementBanner.getByText(/^lock: world_style$/i)
  ).toBeVisible();
  await expect(
    queuedRefinementBanner.getByText(/^force synth: damage_pattern$/i)
  ).toBeVisible();
  await expect(
    page.getByText(/Promoted to queued refinement/i)
  ).toBeVisible();
});

test.skip('selected bootstrap can populate the scene surface from the panel quick action', async ({
  page
}) => {
  await page.route('**/api/psg/images/preview', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        document: {
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [
              {
                id: 'output-1',
                type: 'Output',
                x: 0,
                y: 0,
                label: 'Output',
                output: 'preview'
              }
            ],
            edges: []
          },
          assets: []
        },
        checkpoint: {
          reviewId: 'review-scene-quick-action',
          bootstrapMode: 'prop-variation',
          analyses: [],
          exactMatches: [],
          comparableMatches: [],
          uncertainTraits: [],
          guidance: {
            bootstrapMode: 'prop-variation',
            excludedRegionIds: [],
            lockedTraitKeys: ['world_style'],
            variableTraitKeys: ['damage_pattern'],
            rejectedTraitKeys: [],
            addedLockedTraits: [],
            addedVariableTraits: [],
            preferredComparableMatchIds: [],
            forceSynthesisKeys: [],
            notes: 'Keep the venue wear family'
          }
        },
        preview: {
          backend: {
            id: 'mock-image-preview',
            mode: 'mock',
            label: 'Mock Image Preview',
            model: 'bootstrap-deterministic-v1'
          },
          count: 1,
          seed: 9901,
          promptBlueprint: 'quick_action_wall',
          results: [
            {
              id: 'preview-quick-wall-1',
              seed: 9901,
              prompt: 'quick action wall preview',
              imageUrl: 'https://example.com/preview-quick-wall-1.png',
              width: 512,
              height: 512,
              metadata: {
                assetIds: ['prop-1'],
                preferredComparableLabels: ['neon wall sign'],
                lockedTraitKeys: ['world_style'],
                variableTraitKeys: ['damage_pattern']
              }
            }
          ]
        },
        issues: []
      })
    });
  });

  await openEditorWithBootstrapSelection(page);

  const scenePanel = page.getByTestId('scene-preview-v1-panel');
  const sceneSummary = page.getByTestId('scene-preview-v1-summary');

  const quickPopulateResponse = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/preview') &&
      response.request().method() === 'POST'
  );
  await page.getByTestId('scene-quick-populate-wall').click();
  const response = await quickPopulateResponse;
  expect(response.status()).toBe(200);

  await expect(scenePanel).toBeVisible();
  await expect(sceneSummary).toHaveText(/1 placement/i);
});

test('selected bootstrap queued refinement can be cleared after preview promotion', async ({
  page
}) => {
  await page.route('**/api/psg/images/preview', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        document: {
          version: 'psg/1',
          kind: 'fragment',
          metadata: {
            name: 'Working Graph'
          },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [
              {
                id: 'output-1',
                type: 'Output',
                x: 0,
                y: 0,
                label: 'Output',
                output: 'preview'
              }
            ],
            edges: []
          },
          assets: []
        },
        checkpoint: {
          reviewId: 'review-seeded',
          bootstrapMode: 'prop-variation',
          analyses: [
            {
              assetId: 'prop-1',
              subjectKind: 'prop',
              bootstrapMode: 'prop-variation',
              analysisSource: {
                fixtureId: 'hero-prop-venue',
                selectionMode: 'explicit'
              },
              subjects: [],
              regions: [],
              lockedTraits: [
                {
                  key: 'world_style',
                  value: 'rusted venue prop family',
                  classification: 'locked',
                  confidence: 0.91,
                  provenance: ['human'],
                  evidence: [],
                  conflicts: []
                }
              ],
              variableTraits: [
                {
                  key: 'damage_pattern',
                  value: 'surface wear',
                  classification: 'variable',
                  confidence: 0.86,
                  provenance: ['human'],
                  evidence: [],
                  conflicts: []
                }
              ],
              variationAxes: [],
              segmentationFindings: [],
              modelFindings: [],
              comparableSearchTerms: [],
              confidence: 0.9
            }
          ],
          exactMatches: [],
          comparableMatches: [
            {
              id: 'comp-1',
              origin: 'comparable',
              kind: 'asset',
              label: 'rusted venue prop fragment',
              score: 0.79,
              reasonCodes: ['fixture-comparable'],
              sourceRef: 'fixture://rusted-venue-prop-fragment'
            }
          ],
          uncertainTraits: [],
          guidance: {
            bootstrapMode: 'prop-variation',
            excludedRegionIds: [],
            lockedTraitKeys: ['world_style'],
            variableTraitKeys: ['damage_pattern'],
            rejectedTraitKeys: [],
            addedLockedTraits: [],
            addedVariableTraits: [],
            preferredComparableMatchIds: ['comp-1'],
            forceSynthesisKeys: [],
            notes: 'Keep the venue wear family'
          }
        },
        preview: {
          backend: {
            id: 'mock-image-preview',
            mode: 'mock',
            label: 'Mock Image Preview',
            model: 'bootstrap-deterministic-v1'
          },
          count: 1,
          seed: 4567,
          promptBlueprint: 'locked:world_style | vary:damage_pattern | clear_pass',
          results: [
            {
              id: 'preview-clear-1',
              seed: 4567,
              prompt: 'preview prompt clear',
              imageUrl: 'https://example.com/preview-clear-1.png',
              width: 512,
              height: 512,
              metadata: {
                assetIds: ['prop-1'],
                preferredComparableLabels: ['neon wall sign'],
                lockedTraitKeys: ['world_style'],
                variableTraitKeys: ['damage_pattern']
              }
            }
          ]
        },
        issues: []
      })
    });
  });

  await openEditorWithBootstrapSelection(page);

  const previewResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/preview') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Preview Bootstrap...' }).click();
  const previewResponse = await previewResponsePromise;
  expect(previewResponse.status()).toBe(200);

  await page.getByRole('button', { name: 'Promote' }).click();
  await expect(
    page.getByText(/Queued refinement: neon wall sign/i)
  ).toBeVisible();
  await expect(
    page.getByText(/Active refinement bias: neon wall sign/i)
  ).toBeVisible();
  await expect(
    page.getByText(/Promoted to queued refinement/i)
  ).toBeVisible();

  await page.getByRole('button', { name: 'Clear queued refinement' }).click();

  await expect(
    page.getByText(/Queued refinement: neon wall sign/i)
  ).toHaveCount(0);
  await expect(
    page.getByText(/Promoted to queued refinement/i)
  ).toHaveCount(0);
  await expect(
    page.getByText(/Active refinement bias: neon wall sign/i)
  ).toHaveCount(0);
  await expect(
    page.getByText(/Prefer the rusted venue prop family/i)
  ).toBeVisible();
});

test.skip('scene preview surface reuses cached preview results before requesting fresh ones', async ({
  page
}) => {
  let previewCallCount = 0;

  await page.route('**/api/psg/images/preview', async route => {
    previewCallCount += 1;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        document: {
          version: 'psg/1',
          kind: 'fragment',
          metadata: {
            name: 'Working Graph'
          },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [
              {
                id: 'output-1',
                type: 'Output',
                x: 0,
                y: 0,
                label: 'Output',
                output: 'preview'
              }
            ],
            edges: []
          },
          assets: []
        },
        checkpoint: {
          reviewId: 'review-seeded',
          bootstrapMode: 'prop-variation',
          analyses: [
            {
              assetId: 'prop-1',
              subjectKind: 'prop',
              bootstrapMode: 'prop-variation',
              analysisSource: {
                fixtureId: 'hero-prop-venue',
                selectionMode: 'explicit'
              },
              subjects: [],
              regions: [],
              lockedTraits: [
                {
                  key: 'world_style',
                  value: 'rusted venue prop family',
                  classification: 'locked',
                  confidence: 0.91,
                  provenance: ['human'],
                  evidence: [],
                  conflicts: []
                }
              ],
              variableTraits: [
                {
                  key: 'damage_pattern',
                  value: 'surface wear',
                  classification: 'variable',
                  confidence: 0.86,
                  provenance: ['human'],
                  evidence: [],
                  conflicts: []
                }
              ],
              variationAxes: [],
              segmentationFindings: [],
              modelFindings: [],
              comparableSearchTerms: [],
              confidence: 0.9
            }
          ],
          exactMatches: [],
          comparableMatches: [
            {
              id: 'comp-1',
              origin: 'comparable',
              kind: 'asset',
              label: 'rusted venue prop fragment',
              score: 0.79,
              reasonCodes: ['fixture-comparable'],
              sourceRef: 'fixture://rusted-venue-prop-fragment'
            }
          ],
          uncertainTraits: [],
          guidance: {
            bootstrapMode: 'prop-variation',
            excludedRegionIds: [],
            lockedTraitKeys: ['world_style'],
            variableTraitKeys: ['damage_pattern'],
            rejectedTraitKeys: [],
            addedLockedTraits: [],
            addedVariableTraits: [],
            preferredComparableMatchIds: ['comp-1'],
            forceSynthesisKeys: [],
            notes: 'Keep the venue wear family'
          }
        },
        preview: {
          backend: {
            id: 'mock-image-preview',
            mode: 'mock',
            label: 'Mock Image Preview',
            model: 'bootstrap-deterministic-v1'
          },
          count: previewCallCount === 1 ? 3 : 1,
          seed: 5000 + previewCallCount,
          promptBlueprint: `source_pass_${previewCallCount}`,
          results: previewCallCount === 1
            ? [
                {
                  id: 'preview-cached-a',
                  seed: 5001,
                  prompt: 'cached a',
                  imageUrl: 'https://example.com/preview-cached-a.png',
                  width: 512,
                  height: 512,
                  metadata: {
                    assetIds: ['prop-1'],
                    preferredComparableLabels: ['neon wall sign'],
                    lockedTraitKeys: ['world_style'],
                    variableTraitKeys: ['damage_pattern']
                  }
                },
                {
                  id: 'preview-cached-b',
                  seed: 5002,
                  prompt: 'cached b',
                  imageUrl: 'https://example.com/preview-cached-b.png',
                  width: 512,
                  height: 512,
                  metadata: {
                    assetIds: ['prop-1'],
                    preferredComparableLabels: ['rusted venue chair'],
                    lockedTraitKeys: ['world_style'],
                    variableTraitKeys: ['damage_pattern']
                  }
                },
                {
                  id: 'preview-cached-c',
                  seed: 5003,
                  prompt: 'cached c',
                  imageUrl: 'https://example.com/preview-cached-c.png',
                  width: 512,
                  height: 512,
                  metadata: {
                    assetIds: ['prop-1'],
                    preferredComparableLabels: ['rusted venue chair'],
                    lockedTraitKeys: ['world_style'],
                    variableTraitKeys: ['damage_pattern']
                  }
                }
              ]
            : [
                {
                  id: 'preview-fresh-z',
                  seed: 6001,
                  prompt: 'fresh z',
                  imageUrl: 'https://example.com/preview-fresh-z.png',
                  width: 512,
                  height: 512,
                  metadata: {
                    assetIds: ['prop-1'],
                    preferredComparableLabels: ['rusted venue chair'],
                    lockedTraitKeys: ['world_style'],
                    variableTraitKeys: ['damage_pattern']
                  }
                }
              ]
        },
        issues: []
      })
    });
  });

  await openEditorWithBootstrapSelection(page);

  const previewResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/psg/images/preview') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Preview Bootstrap...' }).click();
  const previewResponse = await previewResponsePromise;
  expect(previewResponse.status()).toBe(200);
  await expect(
    page.getByText(/Mock Image Preview · bootstrap-deterministic-v1/i)
  ).toBeVisible();

  await page.getByRole('spinbutton', { name: 'Populate count' }).fill('3');
  await page.getByRole('button', { name: 'Populate wall surface' }).click({
    force: true
  });
  await expect.poll(() => previewCallCount).toBe(1);

  await page.getByRole('button', { name: 'Populate floor surface' }).click({
    force: true
  });
  await expect.poll(() => previewCallCount).toBe(2);
});

test.skip('queued scene-promoted refinement survives reload and appears in the dialog', async ({
  page
}) => {
  await openEditorWithBootstrapSelection(page);

  await page.evaluate(() => {
    localStorage.removeItem('prompt-spaghetti:workspace');
    localStorage.removeItem('prompt-spaghetti:autosave');
    localStorage.removeItem('epic1-graph-autosave');
    localStorage.setItem(
      'psg:test-initial-graph',
      JSON.stringify({
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
                  id: 'comp-1',
                  label: 'similar prop'
                }
              ],
              forceSynthesisKeys: ['damage_pattern'],
              variableTraitKeys: ['damage_pattern'],
              lockedTraitKeys: ['world_style'],
              notes: 'Prefer the rusted venue prop family',
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
                  id: 'comp-1',
                  label: 'similar prop'
                }
              ],
              forceSynthesisKeys: ['damage_pattern'],
              variableTraitKeys: ['damage_pattern'],
              lockedTraitKeys: ['world_style'],
              notes: 'Prefer the rusted venue prop family',
              assetIds: ['prop-1'],
              label: 'Seeded Bootstrap'
            }
          }
        ],
        edges: []
      })
    );
    localStorage.setItem(
      'epic1-bootstrap-refinement-seed',
      JSON.stringify({
        bootstrapGroupId: 'bootstrap-group-seeded',
        bootstrapMode: 'prop-variation',
        assetIds: ['prop-1'],
        analysisSources: [
          {
            assetId: 'prop-1',
            fixtureId: 'hero-prop-venue',
            selectionMode: 'explicit'
          }
        ],
        preferredComparableRefs: [
          {
            id: 'comp-2',
            label: 'neon wall sign'
          },
          {
            id: 'comp-1',
            label: 'similar prop'
          }
        ],
        forceSynthesisKeys: ['damage_pattern'],
        lockedTraitKeys: ['world_style'],
        variableTraitKeys: ['damage_pattern'],
        notes: 'Scene preview promoted wall family: neon wall sign'
      })
    );
  });

  await page.reload();
  await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });

  await expect(
    page.getByText(/Queued refinement: neon wall sign/i)
  ).toBeVisible();

  await page.getByRole('button', { name: 'Refine Bootstrap...' }).click();
  await expect(page.getByText(/Scene-promoted refinement queued/i)).toBeVisible();
  await expect(page.getByText(/preferred family: neon wall sign/i)).toBeVisible();
  await expect(page.getByText(/locked traits: world_style/i)).toBeVisible();
  await expect(page.getByText(/force synthesis: damage_pattern/i)).toBeVisible();
});
