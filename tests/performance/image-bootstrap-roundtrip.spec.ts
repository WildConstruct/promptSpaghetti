import { expect, test, type Page } from '@playwright/test';

type RoutePayload = Record<string, unknown>;

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

const analyzedCheckpoint = {
  reviewId: 'review-prop-fixture',
  bootstrapMode: 'prop-variation',
  analyses: [
    {
      assetId: 'prop-1',
      subjectKind: 'prop',
      bootstrapMode: 'prop-variation',
      subjects: [
        {
          id: 'prop-1-subject-1',
          subjectKind: 'prop',
          label: 'Venue Prop',
          confidence: 0.94,
          primary: true,
          regionIds: ['prop-1-region-1', 'prop-1-region-2'],
          tags: ['prop', 'rusted']
        }
      ],
      regions: [
        {
          id: 'prop-1-region-1',
          label: 'Main silhouette',
          kind: 'subject',
          bbox: {
            x: 0.14,
            y: 0.18,
            width: 0.52,
            height: 0.56
          },
          confidence: 0.95,
          tags: ['silhouette']
        },
        {
          id: 'prop-1-region-2',
          label: 'Label plate',
          kind: 'part',
          bbox: {
            x: 0.28,
            y: 0.47,
            width: 0.18,
            height: 0.12
          },
          confidence: 0.82,
          tags: ['label']
        }
      ],
      lockedTraits: [
        {
          key: 'world_style',
          value: 'rusted venue prop family',
          classification: 'locked',
          confidence: 0.91,
          provenance: ['segmentation', 'multimodal-model'],
          evidence: [
            {
              source: 'segmentation',
              score: 0.88,
              summary: 'dominant silhouette matches venue prop fixture'
            },
            {
              source: 'multimodal-model',
              score: 0.94,
              summary: 'same-world venue prop family'
            }
          ],
          conflicts: []
        }
      ],
      variableTraits: [
        {
          key: 'damage_pattern',
          value: 'surface wear bands',
          classification: 'variable',
          confidence: 0.86,
          provenance: ['multimodal-model'],
          evidence: [
            {
              source: 'multimodal-model',
              score: 0.86,
              summary: 'wear patterns can vary while preserving silhouette'
            }
          ],
          conflicts: []
        },
        {
          key: 'label_variant',
          value: 'venue labeling treatment',
          classification: 'variable',
          confidence: 0.78,
          provenance: ['retrieval'],
          evidence: [
            {
              source: 'retrieval',
              score: 0.78,
              summary: 'comparable prop fragments vary plate typography'
            }
          ],
          conflicts: []
        }
      ],
      variationAxes: [],
      segmentationFindings: ['isolated main prop silhouette', 'detected label plate'],
      modelFindings: ['rusted venue prop', 'same-world variation candidate'],
      comparableSearchTerms: ['rusted venue prop', 'worn stage prop'],
      confidence: 0.88
    }
  ],
  exactMatches: [
    {
      id: 'exact-prop-1',
      origin: 'exact',
      kind: 'asset',
      label: 'hero-prop source image',
      score: 0.99,
      reasonCodes: ['source-image'],
      sourceRef: 'asset://prop-1'
    }
  ],
  comparableMatches: [
    {
      id: 'comp-prop-1-venue',
      origin: 'comparable',
      kind: 'fragment',
      label: 'rusted venue prop fragment',
      score: 0.84,
      reasonCodes: ['role-similarity', 'style-similarity'],
      sourceRef: 'fixture://rusted-venue-prop-fragment'
    }
  ],
  uncertainTraits: []
} as const;

function buildDraftFragment(note: string) {
  return {
    version: '1.0.0',
    name: 'Image Bootstrap Draft',
    metadata: {
      imageBootstrap: {
        bootstrapMode: 'prop-variation',
        reviewId: analyzedCheckpoint.reviewId,
        preferredComparableRefs: [
          {
            id: 'comp-prop-1-venue',
            label: 'rusted venue prop fragment',
            origin: 'comparable',
            score: 0.84,
            sourceRef: 'fixture://rusted-venue-prop-fragment'
          }
        ],
        forceSynthesisKeys: ['damage_pattern'],
        lockedTraitKeys: ['world_style'],
        variableTraitKeys: ['damage_pattern', 'label_variant'],
        notes: note,
        assetIds: ['prop-1']
      }
    },
    nodes: [
      {
        id: 'draft-text-1',
        type: 'TextBlock',
        x: 0,
        y: 0,
        value: 'rusted venue prop family',
        data: {
          bootstrapMode: 'prop-variation',
          bootstrapInserted: true,
          preferredComparableRefs: [
            {
              id: 'comp-prop-1-venue',
              label: 'rusted venue prop fragment'
            }
          ],
          forceSynthesisKeys: ['damage_pattern'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern', 'label_variant'],
          notes: note,
          assetIds: ['prop-1']
        }
      },
      {
        id: 'draft-choice-1',
        type: 'WeightedChoice',
        x: 260,
        y: 0,
        label: 'Prop Variation Axes',
        data: {
          bootstrapMode: 'prop-variation',
          bootstrapInserted: true,
          preferredComparableRefs: [
            {
              id: 'comp-prop-1-venue',
              label: 'rusted venue prop fragment'
            }
          ],
          forceSynthesisKeys: ['damage_pattern'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern', 'label_variant'],
          notes: note,
          assetIds: ['prop-1']
        },
        options: [
          {
            id: 'damage-pattern-option',
            label: 'damage_pattern',
            text: 'surface wear bands',
            weight: 1,
            meta: {
              traitKey: 'damage_pattern',
              forceSynthesis: true,
              preferredComparableRefs: [
                {
                  id: 'comp-prop-1-venue',
                  label: 'rusted venue prop fragment'
                }
              ]
            }
          },
          {
            id: 'label-variant-option',
            label: 'label_variant',
            text: 'venue labeling treatment',
            weight: 1,
            meta: {
              traitKey: 'label_variant'
            }
          }
        ]
      },
      {
        id: 'draft-output-1',
        type: 'Output',
        x: 540,
        y: 0,
        template: '{draft-text-1} {draft-choice-1}',
        data: {
          bootstrapMode: 'prop-variation',
          bootstrapInserted: true,
          preferredComparableRefs: [
            {
              id: 'comp-prop-1-venue',
              label: 'rusted venue prop fragment'
            }
          ],
          forceSynthesisKeys: ['damage_pattern'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern', 'label_variant'],
          notes: note,
          assetIds: ['prop-1']
        }
      }
    ],
    edges: [
      { id: 'draft-edge-1', source: 'draft-text-1', target: 'draft-choice-1' },
      { id: 'draft-edge-2', source: 'draft-choice-1', target: 'draft-output-1' }
    ]
  };
}

async function stubHostedImageBootstrap(page: Page, payloads: RoutePayload[]) {
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

  await page.route('**/api/psg/images/analyze', async route => {
    const body = route.request().postDataJSON() as RoutePayload;
    payloads.push({ path: 'analyze', body });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        document: body.document,
        analyses: analyzedCheckpoint.analyses,
        exactMatches: analyzedCheckpoint.exactMatches,
        comparableMatches: analyzedCheckpoint.comparableMatches,
        checkpoint: analyzedCheckpoint,
        issues: []
      })
    });
  });

  await page.route('**/api/psg/images/review', async route => {
    const body = route.request().postDataJSON() as RoutePayload;
    payloads.push({ path: 'review', body });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        document: body.document,
        checkpoint: {
          ...analyzedCheckpoint,
          guidance: body.guidance
        },
        issues: []
      })
    });
  });

  await page.route('**/api/psg/images/draft-graph', async route => {
    const body = route.request().postDataJSON() as RoutePayload;
    payloads.push({ path: 'draft', body });
    const guidance = ((body.checkpoint as RoutePayload | undefined)?.guidance ??
      {}) as RoutePayload;
    const note =
      typeof guidance.notes === 'string' && guidance.notes.length > 0
        ? guidance.notes
        : 'Fixture-driven bootstrap';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        document: body.document,
        draftFragment: buildDraftFragment(note),
        checkpoint: body.checkpoint,
        issues: []
      })
    });
  });
}

async function seedEditor(page: Page, options?: { selectedBootstrap?: boolean }) {
  await page.addInitScript(
    seed => {
    try {
      localStorage.setItem('psg:last-view', 'editor');
      localStorage.setItem(
        'epic1-psg-scene-manifest',
        JSON.stringify(seed.sceneManifest)
      );
      localStorage.removeItem('prompt-graph-autosave');
      localStorage.removeItem('graphDraft');

      if (seed?.selectedBootstrap) {
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
          })
        );
      } else {
        localStorage.removeItem('psg:test-initial-graph');
      }
    } catch {
      // Ignore localStorage restrictions in browser tests.
    }
    },
    {
      sceneManifest,
      selectedBootstrap: options?.selectedBootstrap ?? false
    }
  );

  await page.goto('/');
  await page.waitForSelector('.epic1-graph-editor', { timeout: 20_000 });
  await page.waitForSelector('.simple-menu-bar', { timeout: 20_000 });
}

async function openFreshBootstrapDialog(page: Page) {
  const fileMenu = page.locator('.menu-section').filter({ hasText: 'File' }).first();
  await fileMenu.hover();
  await page.getByRole('button', { name: 'Image Bootstrap...' }).click();
  await expect(
    page.getByRole('heading', { name: 'Image Bootstrap' })
  ).toBeVisible();
}

test('fresh image bootstrap runs analyze, review, and draft through the dialog', async ({
  page
}) => {
  const payloads: RoutePayload[] = [];
  await stubHostedImageBootstrap(page, payloads);
  await seedEditor(page);
  await openFreshBootstrapDialog(page);

  await page.getByRole('textbox', { name: 'User intent' }).fill(
    'build prop variations for the same venue world'
  );
  await page.getByRole('button', { name: 'Analyze Images' }).click();

  await expect(page.getByText('Review Checkpoint')).toBeVisible();
  await expect(page.getByText(/rusted venue prop fragment/i)).toBeVisible();

  const damagePatternRow = page.locator('label').filter({
    has: page.getByText('damage_pattern')
  });
  await damagePatternRow.getByRole('checkbox').check();
  await page
    .locator('label')
    .filter({ hasText: 'rusted venue prop fragment' })
    .getByRole('checkbox')
    .check();
  await page.getByRole('textbox', { name: 'Review notes' }).fill(
    'Prefer the rusted venue prop family'
  );
  await page.getByRole('button', { name: 'Draft And Insert' }).click();

  await expect.poll(() => payloads.length).toBe(3);
  await expect(page.getByText(/invalid_type/i)).toHaveCount(0);

  expect(payloads).toHaveLength(3);
  expect(payloads[0]).toMatchObject({
    path: 'analyze',
    body: {
      assetIds: ['prop-1'],
      userIntent: 'build prop variations for the same venue world'
    }
  });
  expect(payloads[1]).toMatchObject({
    path: 'review',
    body: {
      guidance: expect.objectContaining({
        preferredComparableMatchIds: ['comp-prop-1-venue'],
        forceSynthesisKeys: ['damage_pattern'],
        notes: 'Prefer the rusted venue prop family'
      })
    }
  });
  expect(payloads[2]).toMatchObject({
    path: 'draft',
    body: {
      checkpoint: expect.objectContaining({
        guidance: expect.objectContaining({
          preferredComparableMatchIds: ['comp-prop-1-venue'],
          forceSynthesisKeys: ['damage_pattern']
        })
      })
    }
  });
});

test('refinement mode runs analyze, review, and in-place replacement through the dialog', async ({
  page
}) => {
  const payloads: RoutePayload[] = [];
  await stubHostedImageBootstrap(page, payloads);
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
  await page.getByRole('button', { name: 'Analyze Images' }).click();
  await expect(page.getByText('Review Checkpoint')).toBeVisible();

  await page.getByRole('textbox', { name: 'Review notes' }).fill(
    'Replace the seeded bootstrap with fixture-backed refinement'
  );
  await page.getByRole('button', { name: 'Refine And Replace' }).click();

  await expect.poll(() => payloads.length).toBe(3);
  await expect(page.getByText(/invalid_type/i)).toHaveCount(0);

  expect(payloads).toHaveLength(3);
  expect(payloads[0]).toMatchObject({
    path: 'analyze',
    body: {
      assetIds: ['prop-1'],
      userIntent: 'build prop variations and preserve the venue wear family'
    }
  });
  expect(payloads[1]).toMatchObject({
    path: 'review',
    body: {
      guidance: expect.objectContaining({
        notes: 'Replace the seeded bootstrap with fixture-backed refinement'
      })
    }
  });
  expect(payloads[2]).toMatchObject({
    path: 'draft'
  });
});
