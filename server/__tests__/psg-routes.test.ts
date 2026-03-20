import Fastify from 'fastify';
import { psgRoutes } from '../src/routes/psg';

describe('psgRoutes', () => {
  const originalKreaApiToken = process.env.KREA_API_TOKEN;

  beforeEach(() => {
    delete process.env.KREA_API_TOKEN;
  });

  afterAll(() => {
    if (originalKreaApiToken) {
      process.env.KREA_API_TOKEN = originalKreaApiToken;
    } else {
      delete process.env.KREA_API_TOKEN;
    }
  });

  async function buildApp() {
    process.env.LOCAL_TEST_AUTH_TOKEN = 'jest-local-psg-token';
    const app = Fastify();
    app.addHook('onRequest', async request => {
      request.headers.authorization = 'Bearer jest-local-psg-token';
    });
    await psgRoutes(app);
    return app;
  }

  it('returns PSG protocol capabilities', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/psg/capabilities'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
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
      exportTargets: ['comfy'],
      previewBackends: [
        {
          id: 'mock-image-preview',
          mode: 'mock',
          label: 'Mock Image Preview',
          profile: 'bootstrap',
          model: 'bootstrap-deterministic-v1',
          supportedModels: [
            'bootstrap-deterministic-v1',
            'bootstrap-fast-v1'
          ]
        },
        {
          id: 'mock-scene-preview',
          mode: 'mock',
          label: 'Mock Scene Preview',
          profile: 'scene',
          model: 'scene-comprehension-v1',
          supportedModels: ['scene-comprehension-v1']
        }
      ]
    });

    await app.close();
  });

  it('normalizes a direct flat PSG fragment into the canonical document envelope', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/psg/normalize',
      payload: {
        document: {
          version: '1.0.0',
          name: 'Market Crowd Seed',
          metadata: { tags: ['crowd', 'market'] },
          nodes: [
            { id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'merchant' },
            { id: 'n2', type: 'Output', x: 200, y: 0, template: '{n1}' }
          ],
          edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
        }
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.ok).toBe(true);
    expect(body.document.version).toBe('psg/1');
    expect(body.document.kind).toBe('fragment');
    expect(body.document.fragment.name).toBe('Market Crowd Seed');
    expect(body.document.fragment.nodes).toHaveLength(2);

    await app.close();
  });

  it('analyzes registered image assets into a review checkpoint', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/psg/images/analyze',
      payload: {
        document: {
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Prop Analysis Seed' },
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
          fragment: {
            version: '1.0.0',
            name: 'Prop Analysis Seed',
            nodes: [
              { id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'hero prop' },
              { id: 'n2', type: 'Output', x: 200, y: 0, template: '{n1}' }
            ],
            edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
          }
        },
        assetIds: ['prop-1'],
        userIntent: 'build prop variations'
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      analyses: [
        expect.objectContaining({
          assetId: 'prop-1'
        })
      ],
      checkpoint: expect.objectContaining({
        analyses: [
          expect.objectContaining({
            assetId: 'prop-1'
          })
        ]
      })
    });

    await app.close();
  });

  it('runs the deterministic prop fixture through analyze, review, and draft-graph', async () => {
    const app = await buildApp();
    const document = {
      version: 'psg/1',
      kind: 'fragment',
      metadata: { name: 'Prop Fixture Seed' },
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
      fragment: {
        version: '1.0.0',
        name: 'Prop Fixture Seed',
        nodes: [
          { id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'hero prop' },
          { id: 'n2', type: 'Output', x: 200, y: 0, template: '{n1}' }
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
      }
    };

    const analyzeResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/analyze',
      payload: {
        document,
        assetIds: ['prop-1'],
        userIntent: 'build prop variations'
      }
    });

    expect(analyzeResponse.statusCode).toBe(200);
    const analyzed = analyzeResponse.json();
    expect(analyzed).toMatchObject({
      analyses: [
        expect.objectContaining({
          assetId: 'prop-1',
          bootstrapMode: 'prop-variation',
          lockedTraits: expect.arrayContaining([
            expect.objectContaining({
              key: 'world_style',
              value: 'rusted venue prop family'
            })
          ]),
          variableTraits: expect.arrayContaining([
            expect.objectContaining({ key: 'damage_pattern' }),
            expect.objectContaining({ key: 'label_variant' })
          ])
        })
      ],
      comparableMatches: [
        expect.objectContaining({
          label: 'rusted venue prop fragment',
          sourceRef: 'fixture://rusted-venue-prop-fragment'
        })
      ]
    });

    const reviewResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/review',
      payload: {
        document,
        checkpoint: analyzed.checkpoint,
        guidance: {
          bootstrapMode: 'prop-variation',
          primarySubjectId: 'prop-1-subject-1',
          excludedRegionIds: ['prop-1-region-2'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern', 'label_variant'],
          rejectedTraitKeys: [],
          addedLockedTraits: [],
          addedVariableTraits: [],
          preferredComparableMatchIds: ['comp-prop-1-venue'],
          forceSynthesisKeys: ['damage_pattern'],
          notes: 'Keep the venue wear family but synthesize new damage'
        }
      }
    });

    expect(reviewResponse.statusCode).toBe(200);
    const reviewed = reviewResponse.json();
    expect(reviewed.checkpoint).toMatchObject({
      guidance: expect.objectContaining({
        preferredComparableMatchIds: ['comp-prop-1-venue'],
        forceSynthesisKeys: ['damage_pattern']
      })
    });

    const draftResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/draft-graph',
      payload: {
        document,
        checkpoint: reviewed.checkpoint
      }
    });

    expect(draftResponse.statusCode).toBe(200);
    expect(draftResponse.json()).toMatchObject({
      draftFragment: {
        metadata: {
          imageBootstrap: {
            bootstrapMode: 'prop-variation',
            preferredComparableRefs: [
              expect.objectContaining({
                id: 'comp-prop-1-venue',
                label: 'rusted venue prop fragment'
              })
            ],
            forceSynthesisKeys: ['damage_pattern']
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
                meta: expect.objectContaining({
                  forceSynthesis: true
                })
              }),
              expect.objectContaining({
                label: 'label_variant'
              })
            ])
          })
        ])
      }
    });

    await app.close();
  });

  it('returns deterministic preview results for a reviewed bootstrap checkpoint', async () => {
    const app = await buildApp();
    const document = {
      version: 'psg/1',
      kind: 'fragment',
      metadata: { name: 'Preview Seed' },
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
      fragment: {
        version: '1.0.0',
        name: 'Preview Seed',
        nodes: [
          { id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'hero prop' },
          { id: 'n2', type: 'Output', x: 200, y: 0, template: '{n1}' }
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
      }
    };

    const analyzeResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/analyze',
      payload: {
        document,
        assetIds: ['prop-1'],
        userIntent: 'build prop variations'
      }
    });

    expect(analyzeResponse.statusCode).toBe(200);
    const analyzed = analyzeResponse.json();

    const reviewResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/review',
      payload: {
        document,
        checkpoint: analyzed.checkpoint,
        guidance: {
          bootstrapMode: 'prop-variation',
          primarySubjectId: 'prop-1-subject-1',
          excludedRegionIds: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern', 'label_variant'],
          rejectedTraitKeys: [],
          addedLockedTraits: [],
          addedVariableTraits: [],
          preferredComparableMatchIds: ['comp-prop-1-venue'],
          forceSynthesisKeys: [],
          notes: 'Keep the venue wear family'
        }
      }
    });

    expect(reviewResponse.statusCode).toBe(200);
    const reviewed = reviewResponse.json();

    const previewResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/preview',
      payload: {
        document,
        checkpoint: reviewed.checkpoint,
        request: {
          count: 2,
          seed: 9001,
          includePromptBlueprint: true
        }
      }
    });

    expect(previewResponse.statusCode).toBe(200);
    expect(previewResponse.json()).toMatchObject({
      preview: {
        backend: {
          id: 'mock-image-preview',
          mode: 'mock'
        },
        count: 2,
        seed: 9001,
        promptBlueprint:
          'locked:world_style | vary:damage_pattern,label_variant | refs:rusted venue prop fragment | notes:Keep the venue wear family',
        results: [
          expect.objectContaining({
            id: 'preview-1',
            seed: 9001,
            imageUrl:
              'mock://image-preview/mock-image-preview/bootstrap-deterministic-v1/9001',
            prompt:
              'locked:world_style | vary:damage_pattern,label_variant | refs:rusted venue prop fragment | notes:Keep the venue wear family | placement:isolated-prop | render:standard | family:rusted venue prop fragment | sample:1',
            metadata: expect.objectContaining({
              assetIds: ['prop-1'],
              preferredComparableLabels: ['rusted venue prop fragment'],
              guidanceNotes: 'Keep the venue wear family'
            })
          }),
          expect.objectContaining({
            id: 'preview-2',
            seed: 9002
          })
        ]
      }
    });

    await app.close();
  });

  it('runs the deterministic crowd fixture through analyze', async () => {
    const app = await buildApp();
    const document = {
      version: 'psg/1',
      kind: 'fragment',
      metadata: { name: 'Crowd Fixture Seed' },
      assets: [
        {
          id: 'crowd-1',
          kind: 'reference-still',
          role: 'crowd-extra',
          storage: {
            provider: 'local',
            uri: 'file://crowd-extra.png',
            contentType: 'image/png'
          },
          provenance: {
            source: 'upload'
          }
        }
      ],
      fragment: {
        version: '1.0.0',
        name: 'Crowd Fixture Seed',
        nodes: [
          { id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'crowd extra' },
          { id: 'n2', type: 'Output', x: 200, y: 0, template: '{n1}' }
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
      }
    };

    const analyzeResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/analyze',
      payload: {
        document,
        assetIds: ['crowd-1'],
        userIntent: 'build punk crowd variations'
      }
    });

    expect(analyzeResponse.statusCode).toBe(200);
    expect(analyzeResponse.json()).toMatchObject({
      analyses: [
        expect.objectContaining({
          assetId: 'crowd-1',
          bootstrapMode: 'crowd-archetype-expansion',
          subjectKind: 'person',
          analysisSource: expect.objectContaining({
            fixtureId: 'punk-crowd-extra',
            selectionMode: 'heuristic'
          }),
          lockedTraits: expect.arrayContaining([
            expect.objectContaining({
              key: 'world_style',
              value: 'sweaty underground punk venue'
            })
          ]),
          variableTraits: expect.arrayContaining([
            expect.objectContaining({ key: 'pose_energy' }),
            expect.objectContaining({ key: 'wardrobe_variation' })
          ])
        })
      ],
      comparableMatches: [
        expect.objectContaining({
          kind: 'crowd-archetype',
          label: 'punk crowd archetype fragment',
          sourceRef: 'fixture://punk-crowd-archetype-fragment'
        })
      ]
    });

    await app.close();
  });

  it('supports explicit image bootstrap fixture selection through asset metadata', async () => {
    const app = await buildApp();
    const document = {
      version: 'psg/1',
      kind: 'fragment',
      metadata: { name: 'Explicit Fixture Seed' },
      assets: [
        {
          id: 'fixture-1',
          kind: 'reference-still',
          role: 'generic-reference',
          storage: {
            provider: 'local',
            uri: 'file://fixture-reference.png',
            contentType: 'image/png'
          },
          provenance: {
            source: 'upload'
          },
          metadata: {
            imageBootstrapFixture: 'punk-crowd-extra'
          }
        }
      ],
      fragment: {
        version: '1.0.0',
        name: 'Explicit Fixture Seed',
        nodes: [
          { id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'fixture ref' },
          { id: 'n2', type: 'Output', x: 200, y: 0, template: '{n1}' }
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
      }
    };

    const analyzeResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/analyze',
      payload: {
        document,
        assetIds: ['fixture-1'],
        userIntent: 'generic variation work'
      }
    });

    expect(analyzeResponse.statusCode).toBe(200);
    expect(analyzeResponse.json()).toMatchObject({
      analyses: [
        expect.objectContaining({
          assetId: 'fixture-1',
          bootstrapMode: 'crowd-archetype-expansion',
          subjectKind: 'person',
          analysisSource: expect.objectContaining({
            fixtureId: 'punk-crowd-extra',
            selectionMode: 'explicit'
          })
        })
      ],
      comparableMatches: [
        expect.objectContaining({
          label: 'punk crowd archetype fragment'
        })
      ]
    });

    await app.close();
  });

  it('promotes fixture provenance to explicit through the review endpoint', async () => {
    const app = await buildApp();
    const document = {
      version: 'psg/1',
      kind: 'fragment',
      metadata: { name: 'Review Fixture Promotion' },
      assets: [
        {
          id: 'crowd-1',
          kind: 'reference-still',
          role: 'crowd-extra',
          storage: {
            provider: 'local',
            uri: 'file://crowd-extra.png',
            contentType: 'image/png'
          },
          provenance: {
            source: 'upload'
          }
        }
      ],
      fragment: {
        version: '1.0.0',
        name: 'Review Fixture Promotion',
        nodes: [
          { id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'crowd extra' },
          { id: 'n2', type: 'Output', x: 200, y: 0, template: '{n1}' }
        ],
        edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
      }
    };

    const analyzeResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/analyze',
      payload: {
        document,
        assetIds: ['crowd-1'],
        userIntent: 'build punk crowd variations'
      }
    });

    expect(analyzeResponse.statusCode).toBe(200);
    const analyzePayload = analyzeResponse.json();
    expect(analyzePayload.analyses[0]).toMatchObject({
      assetId: 'crowd-1',
      analysisSource: expect.objectContaining({
        fixtureId: 'punk-crowd-extra',
        selectionMode: 'heuristic'
      })
    });

    const reviewResponse = await app.inject({
      method: 'POST',
      url: '/api/psg/images/review',
      payload: {
        document,
        checkpoint: analyzePayload.checkpoint,
        guidance: {
          bootstrapMode: 'crowd-archetype-expansion',
          primarySubjectId: 'crowd-1-subject-1',
          excludedRegionIds: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['pose_energy', 'wardrobe_variation'],
          rejectedTraitKeys: [],
          addedLockedTraits: [],
          addedVariableTraits: [],
          explicitFixtureSelections: [
            {
              assetId: 'crowd-1',
              fixtureId: 'punk-crowd-extra'
            }
          ],
          preferredComparableMatchIds: [],
          forceSynthesisKeys: []
        }
      }
    });

    expect(reviewResponse.statusCode).toBe(200);
    expect(reviewResponse.json()).toMatchObject({
      checkpoint: {
        analyses: [
          expect.objectContaining({
            assetId: 'crowd-1',
            analysisSource: expect.objectContaining({
              fixtureId: 'punk-crowd-extra',
              selectionMode: 'explicit'
            })
          })
        ],
        guidance: expect.objectContaining({
          explicitFixtureSelections: [
            expect.objectContaining({
              assetId: 'crowd-1',
              fixtureId: 'punk-crowd-extra'
            })
          ]
        })
      }
    });

    await app.close();
  });

  it('reports validation errors for broken fragment edges', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/psg/validate',
      payload: {
        document: {
          version: '1.0.0',
          name: 'Broken Fragment',
          nodes: [{ id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'guard' }],
          edges: [{ id: 'e1', source: 'n1', target: 'missing-node' }]
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      valid: false,
      kind: 'fragment'
    });
    expect(response.json().issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'MISSING_TARGET_NODE',
          severity: 'error'
        }),
        expect.objectContaining({
          code: 'NO_OUTPUT_NODE',
          severity: 'warning'
        })
      ])
    );

    await app.close();
  });

  it('expands a crowd-plan document into concrete members', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/psg/expand-crowd',
      payload: {
        document: {
          version: 'psg/1',
          kind: 'crowd-plan',
          metadata: { name: 'Rainy Alley Crowd' },
          crowd: {
            count: 3,
            archetypes: [
              { id: 'merchant', label: 'Merchant', weight: 2 },
              { id: 'guard', label: 'Guard', weight: 1 }
            ],
            variationAxes: ['emotion', 'motion'],
            placement: {
              zones: ['foreground', 'midground'],
              density: 'dense'
            }
          }
        }
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.ok).toBe(true);
    expect(body.kind).toBe('crowd-plan');
    expect(body.members).toHaveLength(3);
    expect(body.members[0]).toMatchObject({
      archetypeId: 'merchant',
      zone: 'foreground',
      density: 'dense'
    });
    expect(body.members[0].variation).toEqual({
      emotion: 'emotion-1',
      motion: 'motion-2'
    });

    await app.close();
  });

  it('registers reference assets into the canonical document envelope', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/psg/assets/register',
      payload: {
        document: {
          version: '1.0.0',
          name: 'Crowd Asset Seed',
          nodes: [
            { id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'town square' },
            { id: 'n2', type: 'Output', x: 200, y: 0, template: '{n1}' }
          ],
          edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
        },
        assets: [
          {
            id: 'asset-1',
            kind: 'reference-still',
            role: 'market-crowd-style',
            storage: {
              provider: 'supabase',
              uri: 'supabase://assets/market-crowd-style.png',
              contentType: 'image/png'
            },
            provenance: {
              source: 'generated',
              vendor: 'xai',
              model: 'grok-2-image-1212'
            }
          }
        ]
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      registeredAssets: [
        {
          id: 'asset-1',
          kind: 'reference-still'
        }
      ],
      document: {
        kind: 'fragment',
        assets: [
          {
            id: 'asset-1',
            kind: 'reference-still'
          }
        ]
      }
    });

    await app.close();
  });

  it('records derived assets with parent lineage warnings when parents are missing', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/psg/assets/derive',
      payload: {
        document: {
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Derived Asset Seed' },
          fragment: {
            version: '1.0.0',
            name: 'Derived Asset Seed',
            nodes: [
              { id: 'n1', type: 'TextBlock', x: 0, y: 0, value: 'guard' },
              { id: 'n2', type: 'Output', x: 200, y: 0, template: '{n1}' }
            ],
            edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
          }
        },
        asset: {
          id: 'asset-plate-1',
          kind: 'motion-plate',
          role: 'guard-walk-cycle',
          storage: {
            provider: 'blob',
            uri: 'blob://guard-walk-cycle.webm',
            contentType: 'video/webm'
          },
          provenance: {
            source: 'derived',
            vendor: 'wan',
            model: 'wan-animate',
            parentAssetIds: ['missing-parent']
          }
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      asset: {
        id: 'asset-plate-1',
        kind: 'motion-plate'
      }
    });
    expect(response.json().issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'UNKNOWN_PARENT_ASSET',
          severity: 'warning'
        })
      ])
    );

    await app.close();
  });

  it('assembles a scene plan from registered assets and placements', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/psg/scene/assemble',
      payload: {
        document: {
          version: 'psg/1',
          kind: 'scene-plan',
          metadata: { name: 'Crowd Assembly' },
          assets: [
            {
              id: 'still-1',
              kind: 'reference-still',
              storage: {
                provider: 'local',
                uri: 'file://still-1.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            },
            {
              id: 'motion-1',
              kind: 'motion-plate',
              storage: {
                provider: 'local',
                uri: 'file://motion-1.webm',
                contentType: 'video/webm'
              },
              provenance: {
                source: 'derived',
                parentAssetIds: ['still-1']
              }
            }
          ],
          scene: {
            stillAssetIds: ['still-1'],
            motionAssetIds: ['motion-1'],
            placements: [
              {
                id: 'placement-1',
                assetId: 'motion-1',
                zone: 'midground',
                x: 120,
                y: 48,
                depthLayer: 2
              }
            ],
            renderTargets: ['scene-still', 'comfy']
          }
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      assembly: {
        stillAssetIds: ['still-1'],
        motionAssetIds: ['motion-1'],
        placements: [
          {
            id: 'placement-1',
            assetId: 'motion-1',
            zone: 'midground'
          }
        ],
        renderTargets: ['scene-still', 'comfy']
      }
    });

    await app.close();
  });

  it('exports a fragment document to the Comfy bridge workflow shape', async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: 'POST',
      url: '/api/psg/export/comfy',
      payload: {
        document: {
          version: 'psg/1',
          kind: 'fragment',
          metadata: {
            name: 'Comfy Export Seed'
          },
          assets: [
            {
              id: 'still-1',
              kind: 'reference-still',
              storage: {
                provider: 'local',
                uri: 'file://still-1.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            }
          ],
          scene: {
            stillAssetIds: ['still-1'],
            motionAssetIds: [],
            placements: [
              {
                id: 'placement-1',
                assetId: 'still-1',
                zone: 'background',
                x: 20,
                y: 40,
                depthLayer: 1
              }
            ],
            renderTargets: ['comfy']
          },
          fragment: {
            version: '1.0.0',
            name: 'Comfy Export Seed',
            nodes: [
              {
                id: 'n1',
                type: 'TextBlock',
                x: 0,
                y: 0,
                value: 'rain-soaked alley crowd'
              },
              {
                id: 'n2',
                type: 'Output',
                x: 200,
                y: 0,
                template: '{n1}'
              }
            ],
            edges: [{ id: 'e1', source: 'n1', target: 'n2' }]
          }
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      ok: true,
      target: 'comfy',
      workflow: {
        version: 'promptscape-comfy/1',
        metadata: {
          name: 'Comfy Export Seed',
          sourceKind: 'fragment',
          sourceVersion: 'psg/1'
        },
        outputNodeIds: ['2'],
        assetRefs: ['still-1'],
        placements: [
          expect.objectContaining({
            id: 'placement-1',
            assetId: 'still-1'
          })
        ]
      }
    });
    expect(response.json().workflow.nodes['2']).toMatchObject({
      class_type: 'PromptScapeOutput',
      inputs: {
        input_1: ['1', 0],
        template: '{n1}'
      }
    });

    await app.close();
  });
});
