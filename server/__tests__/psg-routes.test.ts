import Fastify from 'fastify';
import { psgRoutes } from '../src/routes/psg';

jest.mock('../src/utils/routeAccess', () => ({
  requireRouteAccess: jest.fn(() => async () => undefined)
}));

describe('psgRoutes', () => {
  async function buildApp() {
    const app = Fastify();
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
        'scene-assemble'
      ],
      exportTargets: ['comfy']
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
