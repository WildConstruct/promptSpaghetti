import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ScenePreviewV1Panel } from '../ScenePreviewV1Panel';

const previewImages = jest.fn();

jest.mock('@promptscape/core/services/psg', () => ({
  ApiPsgClient: jest.fn().mockImplementation(() => ({
    previewImages
  }))
}));

describe('ScenePreviewV1Panel', () => {
  beforeEach(() => {
    previewImages.mockReset();
  });

  it('requests real preview results when checkpoint context is available', async () => {
    previewImages
      .mockResolvedValueOnce({
        preview: {
          backend: {
            id: 'mock-image-preview',
            mode: 'mock',
            label: 'Mock Image Preview'
          },
          count: 2,
          results: [
            {
              id: 'preview-1',
              seed: 7001,
              prompt: 'locked:world_style | vary:damage_pattern | sample:1',
              imageUrl: 'mock://image-preview/mock-image-preview/7001',
              width: 768,
              height: 768,
              metadata: {
                assetIds: ['prop-1'],
                preferredComparableLabels: [
                  'rusted venue chair',
                  'neon wall sign'
                ],
                lockedTraitKeys: ['world_style'],
                variableTraitKeys: ['damage_pattern']
              }
            },
            {
              id: 'preview-2',
              seed: 7002,
              prompt: 'locked:world_style | vary:damage_pattern | sample:2',
              imageUrl: 'mock://image-preview/mock-image-preview/7002',
              width: 768,
              height: 768,
              metadata: {
                assetIds: ['prop-1'],
                preferredComparableLabels: [
                  'rusted venue chair',
                  'neon wall sign'
                ],
                lockedTraitKeys: ['world_style'],
                variableTraitKeys: ['damage_pattern']
              }
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        preview: {
          backend: {
            id: 'mock-image-preview',
            mode: 'mock',
            label: 'Mock Image Preview'
          },
          count: 1,
          results: [
            {
              id: 'preview-3',
              seed: 7003,
              prompt: 'locked:world_style | vary:damage_pattern | sample:3',
              imageUrl: 'mock://image-preview/mock-image-preview/7003',
              width: 768,
              height: 768,
              metadata: {
                assetIds: ['prop-1'],
                preferredComparableLabels: ['rusted venue chair'],
                lockedTraitKeys: ['world_style'],
                variableTraitKeys: ['damage_pattern']
              }
            }
          ]
        }
      });

    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'explicit'
            }
          ],
          reviewCheckpoint: {
            reviewId: 'review-1',
            bootstrapMode: 'prop-variation',
            analyses: [],
            exactMatches: [],
            comparableMatches: [],
            uncertainTraits: []
          },
          preferredComparableRefs: [
            {
              id: 'comp-1',
              label: 'rusted venue chair',
              reasonCodes: ['fixture-comparable']
            },
            {
              id: 'comp-2',
              label: 'neon wall sign',
              reasonCodes: ['surface-keyword']
            }
          ],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Keep the venue wear family'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [
            {
              id: 'prop-1',
              kind: 'reference-still',
              role: 'hero-prop',
              storage: {
                provider: 'local',
                uri: 'file://prop-1.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            }
          ],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
        previewBackendId="mock-scene-preview"
        previewModel="scene-comprehension-v1"
      />
    );

    fireEvent.change(screen.getByLabelText(/populate count/i), {
      target: { value: '2' }
    });
    expect(screen.getByLabelText(/scene mode/i)).toHaveValue('grouped');
    fireEvent.click(screen.getByRole('button', { name: /populate wall surface/i }));

    await waitFor(() => {
      expect(previewImages).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reviewId: 'review-1'
        }),
        expect.objectContaining({
          count: 3,
          includePromptBlueprint: true
        })
      );
    });

    expect(screen.getByText('neon wall sign')).toBeTruthy();
    expect(screen.getByText('rusted venue chair')).toBeTruthy();
    expect(screen.getByText(/mock-image-preview:7001/i)).toBeTruthy();
    expect(screen.getByText(/mock-image-preview:7002/i)).toBeTruthy();
    expect(
      screen.getAllByText(/comparables: rusted venue chair, neon wall sign/i)[0]
    ).toBeTruthy();
    expect(screen.getAllByText(/surface bias: neon wall sign/i)[0]).toBeTruthy();
    expect(screen.getAllByText(/why: fixture-comparable/i)[0]).toBeTruthy();
    expect(screen.getAllByText(/preview source: fresh scene preview/i)[0]).toBeTruthy();
    expect(
      screen.getByText(
        /Active scene preview target: mock-scene-preview · scene-comprehension-v1 · scene-oriented/i
      )
    ).toBeTruthy();
    expect(screen.getByText(/Active scene mode: grouped families/i)).toBeTruthy();
    expect(screen.getByText(/scene batch 3/i)).toBeTruthy();
    expect(
      screen.getByText(/Reusing grouped scene preview families/i)
    ).toBeTruthy();
    expect(screen.getAllByText(/locked: world_style/i)[0]).toBeTruthy();
    expect(screen.getAllByText(/vary: damage_pattern/i)[0]).toBeTruthy();
    expect(screen.getByText('file://prop-1.png')).toBeTruthy();
    expect(
      screen.getByText('mock://image-preview/mock-image-preview/7001')
    ).toBeTruthy();
    expect(
      screen.getByText('mock://image-preview/mock-image-preview/7002')
    ).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: 'Reroll' })[0]);

    await waitFor(() => {
      expect(previewImages).toHaveBeenCalledTimes(2);
    });
    expect(
      screen.getByText('mock://image-preview/mock-image-preview/7003')
    ).toBeTruthy();
  });

  it('can switch scene mode to isolated props', async () => {
    previewImages.mockResolvedValue({
      preview: {
        backend: {
          id: 'mock-scene-preview',
          mode: 'mock',
          label: 'Mock Scene Preview',
          profile: 'scene'
        },
        count: 1,
        results: [
          {
            id: 'preview-iso-1',
            seed: 7101,
            prompt: 'scene prompt',
            imageUrl: 'mock://image-preview/mock-scene-preview/7101',
            width: 768,
            height: 768,
            metadata: {
              assetIds: ['prop-1'],
              preferredComparableLabels: [
                'rusted venue chair',
                'neon wall sign'
              ],
              lockedTraitKeys: ['world_style'],
              variableTraitKeys: ['damage_pattern']
            }
          }
        ]
      }
    });

    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [],
          reviewCheckpoint: {
            reviewId: 'review-1',
            bootstrapMode: 'prop-variation',
            analyses: [],
            exactMatches: [],
            comparableMatches: [],
            uncertainTraits: []
          },
          preferredComparableRefs: [
            {
              id: 'comp-1',
              label: 'rusted venue chair',
              reasonCodes: ['fixture-comparable']
            },
            {
              id: 'comp-2',
              label: 'neon wall sign',
              reasonCodes: ['surface-keyword']
            }
          ],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Keep the venue wear family'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
        previewBackendId="mock-scene-preview"
        previewModel="scene-comprehension-v1"
      />
    );

    fireEvent.change(screen.getByLabelText(/scene mode/i), {
      target: { value: 'isolated' }
    });
    expect(screen.getByText(/Active scene mode: isolated props/i)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/populate count/i), {
      target: { value: '2' }
    });
    fireEvent.click(screen.getByRole('button', { name: /populate wall surface/i }));

    await waitFor(() => {
      expect(previewImages).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          reviewId: 'review-1'
        }),
        expect.objectContaining({
          count: 2,
          includePromptBlueprint: true
        })
      );
    });

    expect(screen.queryByText(/Reusing grouped scene preview families/i)).toBeNull();
    expect(screen.getAllByText(/comparable: rusted venue chair/i)[0]).toBeTruthy();
    expect(screen.queryByText(/comparables: rusted venue chair, neon wall sign/i)).toBeNull();
  });

  it('falls back to metadata-only placement when hosted preview is unavailable', () => {
    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
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
              id: 'comp-1',
              label: 'rusted venue chair',
              reasonCodes: ['fixture-comparable']
            },
            {
              id: 'comp-2',
              label: 'neon wall sign',
              reasonCodes: ['surface-keyword']
            }
          ],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Keep the venue wear family'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [
            {
              id: 'prop-1',
              kind: 'reference-still',
              role: 'hero-prop',
              storage: {
                provider: 'local',
                uri: 'file://prop-1.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            }
          ],
          scene: undefined
        }}
        psgAccessMode="local"
        hostedUpgradeOperations={[]}
      />
    );

    fireEvent.change(screen.getByLabelText(/populate count/i), {
      target: { value: '2' }
    });
    fireEvent.click(screen.getByRole('button', { name: /populate floor surface/i }));

    expect(screen.getByText('rusted venue chair')).toBeTruthy();
    expect(screen.getByText('neon wall sign')).toBeTruthy();
    expect(screen.getByText(/comparable:comp-1/i)).toBeTruthy();
    expect(screen.getByText(/comparable: rusted venue chair/i)).toBeTruthy();
    expect(screen.getAllByText(/surface bias: rusted venue chair/i)[0]).toBeTruthy();
    expect(screen.getByText(/why: fixture-comparable/i)).toBeTruthy();
    expect(screen.getByText(/locked: world_style/i)).toBeTruthy();
    expect(screen.getByText(/vary: damage_pattern/i)).toBeTruthy();
    expect(screen.getByText('file://prop-1.png')).toBeTruthy();
  });

  it('reuses cached bootstrap preview results before requesting a new scene preview', () => {
    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'explicit'
            }
          ],
          reviewCheckpoint: {
            reviewId: 'review-1',
            bootstrapMode: 'prop-variation',
            analyses: [],
            exactMatches: [],
            comparableMatches: [],
            uncertainTraits: []
          },
          preferredComparableRefs: [
            {
              id: 'comp-2',
              label: 'neon wall sign'
            },
            {
              id: 'comp-1',
              label: 'rusted venue chair'
            }
          ],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Keep the venue wear family'
        }}
        cachedPreviewResponse={{
          ok: true,
          document: {
            version: 'psg/1',
            kind: 'fragment',
            metadata: { name: 'Working Graph' },
            fragment: {
              version: '1.0.0',
              name: 'Working Graph',
              nodes: [],
              edges: []
            },
            assets: []
          },
          checkpoint: {
            reviewId: 'review-1',
            bootstrapMode: 'prop-variation',
            analyses: [
              {
                assetId: 'prop-1',
                subjectKind: 'prop',
                bootstrapMode: 'prop-variation',
                subjects: [],
                regions: [],
                lockedTraits: [],
                variableTraits: [],
                variationAxes: [],
                segmentationFindings: [],
                modelFindings: [],
                comparableSearchTerms: [],
                confidence: 0.9
              }
            ],
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
              label: 'Mock Image Preview'
            },
            count: 2,
            seed: 7001,
            promptBlueprint: 'locked:world_style | vary:damage_pattern',
            results: [
              {
                id: 'preview-cached-1',
                seed: 7001,
                prompt: 'cached preview 1',
                imageUrl: 'mock://image-preview/mock-image-preview/7001',
                width: 768,
                height: 768,
                metadata: {
                  assetIds: ['prop-1'],
                  preferredComparableLabels: ['rusted venue chair'],
                  lockedTraitKeys: ['world_style'],
                  variableTraitKeys: ['damage_pattern']
                }
              },
              {
                id: 'preview-cached-2',
                seed: 7002,
                prompt: 'cached preview 2',
                imageUrl: 'mock://image-preview/mock-image-preview/7002',
                width: 768,
                height: 768,
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
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [
            {
              id: 'prop-1',
              kind: 'reference-still',
              role: 'hero-prop',
              storage: {
                provider: 'local',
                uri: 'file://prop-1.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            }
          ],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
      />
    );

    fireEvent.change(screen.getByLabelText(/populate count/i), {
      target: { value: '2' }
    });
    fireEvent.click(screen.getByRole('button', { name: /populate wall surface/i }));

    expect(previewImages).not.toHaveBeenCalled();
    expect(screen.getByText(/mock-image-preview:7001/i)).toBeTruthy();
    expect(screen.getByText(/mock-image-preview:7002/i)).toBeTruthy();
    expect(screen.getByText(/reusing cached bootstrap preview/i)).toBeTruthy();
    expect(screen.getAllByText(/preview source: cached bootstrap preview/i)[0]).toBeTruthy();
  });

  it('consumes cached preview results across multiple populate actions before requesting more', async () => {
    previewImages.mockResolvedValue({
      preview: {
        backend: {
          id: 'mock-image-preview',
          mode: 'mock',
          label: 'Mock Image Preview'
        },
        count: 1,
        results: [
          {
            id: 'preview-fresh-3',
            seed: 7003,
            prompt: 'fresh preview 3',
            imageUrl: 'mock://image-preview/mock-image-preview/7003',
            width: 768,
            height: 768,
            metadata: {
              assetIds: ['prop-1'],
              preferredComparableLabels: ['rusted venue chair'],
              lockedTraitKeys: ['world_style'],
              variableTraitKeys: ['damage_pattern']
            }
          }
        ]
      }
    });

    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'explicit'
            }
          ],
          reviewCheckpoint: {
            reviewId: 'review-1',
            bootstrapMode: 'prop-variation',
            analyses: [],
            exactMatches: [],
            comparableMatches: [],
            uncertainTraits: []
          },
          preferredComparableRefs: [
            {
              id: 'comp-2',
              label: 'neon wall sign'
            },
            {
              id: 'comp-1',
              label: 'rusted venue chair'
            }
          ],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Keep the venue wear family'
        }}
        cachedPreviewResponse={{
          ok: true,
          document: {
            version: 'psg/1',
            kind: 'fragment',
            metadata: { name: 'Working Graph' },
            fragment: {
              version: '1.0.0',
              name: 'Working Graph',
              nodes: [],
              edges: []
            },
            assets: []
          },
          checkpoint: {
            reviewId: 'review-1',
            bootstrapMode: 'prop-variation',
            analyses: [
              {
                assetId: 'prop-1',
                subjectKind: 'prop',
                bootstrapMode: 'prop-variation',
                subjects: [],
                regions: [],
                lockedTraits: [],
                variableTraits: [],
                variationAxes: [],
                segmentationFindings: [],
                modelFindings: [],
                comparableSearchTerms: [],
                confidence: 0.9
              }
            ],
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
              label: 'Mock Image Preview'
            },
            count: 2,
            seed: 7001,
            promptBlueprint: 'locked:world_style | vary:damage_pattern',
            results: [
              {
                id: 'preview-cached-1',
                seed: 7001,
                prompt: 'cached preview 1',
                imageUrl: 'mock://image-preview/mock-image-preview/7001',
                width: 768,
                height: 768,
                metadata: {
                  assetIds: ['prop-1'],
                  preferredComparableLabels: ['rusted venue chair'],
                  lockedTraitKeys: ['world_style'],
                  variableTraitKeys: ['damage_pattern']
                }
              },
              {
                id: 'preview-cached-2',
                seed: 7002,
                prompt: 'cached preview 2',
                imageUrl: 'mock://image-preview/mock-image-preview/7002',
                width: 768,
                height: 768,
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
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [
            {
              id: 'prop-1',
              kind: 'reference-still',
              role: 'hero-prop',
              storage: {
                provider: 'local',
                uri: 'file://prop-1.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            }
          ],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
      />
    );

    fireEvent.change(screen.getByLabelText(/populate count/i), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: /populate wall surface/i }));
    expect(previewImages).not.toHaveBeenCalled();
    expect(screen.getByText(/mock-image-preview:7001/i)).toBeTruthy();
    expect(screen.getAllByText(/preview source: cached bootstrap preview/i)[0]).toBeTruthy();
    expect(screen.getByText(/reusing cached bootstrap preview/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /populate floor surface/i }));
    expect(previewImages).not.toHaveBeenCalled();
    expect(screen.getByText(/mock-image-preview:7002/i)).toBeTruthy();
    expect(screen.getByText(/reusing cached bootstrap preview/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /populate wall surface/i }));

    await waitFor(() => {
      expect(previewImages).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText(/mock-image-preview:7003/i)).toBeTruthy();
    expect(screen.getAllByText(/preview source: fresh scene preview/i)[0]).toBeTruthy();
    expect(screen.getByText(/cached \\+ fresh preview mix/i)).toBeTruthy();
  });

  it('returns a cached preview result to the pool when a cached placement is rerolled away', async () => {
    previewImages.mockResolvedValue({
      preview: {
        backend: {
          id: 'mock-image-preview',
          mode: 'mock',
          label: 'Mock Image Preview'
        },
        count: 1,
        results: [
          {
            id: 'preview-fresh-reroll',
            seed: 7010,
            prompt: 'fresh reroll preview',
            imageUrl: 'mock://image-preview/mock-image-preview/7010',
            width: 768,
            height: 768,
            metadata: {
              assetIds: ['prop-1'],
              preferredComparableLabels: ['rusted venue chair'],
              lockedTraitKeys: ['world_style'],
              variableTraitKeys: ['damage_pattern']
            }
          }
        ]
      }
    });

    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'explicit'
            }
          ],
          reviewCheckpoint: {
            reviewId: 'review-1',
            bootstrapMode: 'prop-variation',
            analyses: [],
            exactMatches: [],
            comparableMatches: [],
            uncertainTraits: []
          },
          preferredComparableRefs: [
            {
              id: 'comp-2',
              label: 'neon wall sign'
            },
            {
              id: 'comp-1',
              label: 'rusted venue chair'
            }
          ],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Keep the venue wear family'
        }}
        cachedPreviewResponse={{
          ok: true,
          document: {
            version: 'psg/1',
            kind: 'fragment',
            metadata: { name: 'Working Graph' },
            fragment: {
              version: '1.0.0',
              name: 'Working Graph',
              nodes: [],
              edges: []
            },
            assets: []
          },
          checkpoint: {
            reviewId: 'review-1',
            bootstrapMode: 'prop-variation',
            analyses: [
              {
                assetId: 'prop-1',
                subjectKind: 'prop',
                bootstrapMode: 'prop-variation',
                subjects: [],
                regions: [],
                lockedTraits: [],
                variableTraits: [],
                variationAxes: [],
                segmentationFindings: [],
                modelFindings: [],
                comparableSearchTerms: [],
                confidence: 0.9
              }
            ],
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
              label: 'Mock Image Preview'
            },
            count: 2,
            seed: 7001,
            promptBlueprint: 'locked:world_style | vary:damage_pattern',
            results: [
              {
                id: 'preview-cached-1',
                seed: 7001,
                prompt: 'cached preview 1',
                imageUrl: 'mock://image-preview/mock-image-preview/7001',
                width: 768,
                height: 768,
                metadata: {
                  assetIds: ['prop-1'],
                  preferredComparableLabels: ['rusted venue chair'],
                  lockedTraitKeys: ['world_style'],
                  variableTraitKeys: ['damage_pattern']
                }
              },
              {
                id: 'preview-cached-2',
                seed: 7002,
                prompt: 'cached preview 2',
                imageUrl: 'mock://image-preview/mock-image-preview/7002',
                width: 768,
                height: 768,
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
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [
            {
              id: 'prop-1',
              kind: 'reference-still',
              role: 'hero-prop',
              storage: {
                provider: 'local',
                uri: 'file://prop-1.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            }
          ],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
      />
    );

    fireEvent.change(screen.getByLabelText(/populate count/i), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: /populate wall surface/i }));
    expect(previewImages).not.toHaveBeenCalled();
    expect(screen.getByText(/mock-image-preview:7001/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Reroll' }));

    await waitFor(() => {
      expect(previewImages).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText(/mock-image-preview:7010/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /populate floor surface/i }));
    expect(screen.getByText(/mock-image-preview:7001/i)).toBeTruthy();
  });

  it('shows and uses queued refinement bias from the selected bootstrap summary', () => {
    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
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
              id: 'comp-promoted',
              label: 'neon wall sign'
            },
            {
              id: 'comp-1',
              label: 'rusted venue chair'
            }
          ],
          forceSynthesisKeys: ['damage_pattern'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Scene preview promoted wall family: neon wall sign'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [
            {
              id: 'prop-1',
              kind: 'reference-still',
              role: 'hero-prop',
              storage: {
                provider: 'local',
                uri: 'file://prop-1.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            }
          ],
          scene: undefined
        }}
        psgAccessMode="local"
        hostedUpgradeOperations={[]}
      />
    );

    expect(screen.getByText(/Active refinement bias: neon wall sign/i)).toBeTruthy();
    expect(screen.getByText(/lock: world_style/i)).toBeTruthy();
    expect(screen.getByText(/force synth: damage_pattern/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /populate wall surface/i }));

    expect(screen.getAllByText('neon wall sign')[0]).toBeTruthy();
    expect(screen.getAllByText(/surface bias: neon wall sign/i)[0]).toBeTruthy();
  });

  it('promotes a placed family back into graph refinement', async () => {
    const onPromotePlacement = jest.fn();
    previewImages.mockResolvedValue({
      preview: {
        backend: {
          id: 'mock-image-preview',
          mode: 'mock',
          label: 'Mock Image Preview'
        },
        count: 1,
        results: [
          {
            id: 'preview-1',
            seed: 7001,
            prompt: 'locked:world_style | vary:damage_pattern | sample:1',
            imageUrl: 'mock://image-preview/mock-image-preview/7001',
            width: 768,
            height: 768,
            metadata: {
              assetIds: ['prop-1'],
              preferredComparableLabels: ['rusted venue chair'],
              lockedTraitKeys: ['world_style'],
              variableTraitKeys: ['damage_pattern']
            }
          }
        ]
      }
    });

    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [
            {
              assetId: 'prop-1',
              fixtureId: 'hero-prop-venue',
              selectionMode: 'explicit'
            }
          ],
          reviewCheckpoint: {
            reviewId: 'review-1',
            bootstrapMode: 'prop-variation',
            analyses: [],
            exactMatches: [],
            comparableMatches: [],
            uncertainTraits: []
          },
          preferredComparableRefs: [
            {
              id: 'comp-1',
              label: 'rusted venue chair'
            }
          ],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Keep the venue wear family'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [
            {
              id: 'prop-1',
              kind: 'reference-still',
              role: 'hero-prop',
              storage: {
                provider: 'local',
                uri: 'file://prop-1.png',
                contentType: 'image/png'
              },
              provenance: {
                source: 'upload'
              }
            }
          ],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
        onPromotePlacement={onPromotePlacement}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /populate wall surface/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /promote to graph/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /promote to graph/i }));

    expect(onPromotePlacement).toHaveBeenCalledWith(
      expect.objectContaining({
        preferredComparableRefId: 'comp-1',
        preferredComparableLabel: 'rusted venue chair',
        lockedTraitKeys: ['world_style'],
        forceSynthesisKeys: ['damage_pattern']
      })
    );
  });

  it('restores persisted scene placements when the selected bootstrap group changes back', () => {
    const { rerender } = render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [],
          preferredComparableRefs: [],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: null
        }}
        persistedState={{
          placements: [
            {
              id: 'wall-1',
              surface: 'wall',
              label: 'neon wall sign',
              provenance: 'mock-image-preview:7001',
              previewSource: 'cached'
            }
          ],
          usedCachedPreviewResultIds: ['preview-cached-1'],
          mode: 'isolated'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
      />
    );

    expect(screen.getByText(/neon wall sign/i)).toBeTruthy();
    expect(screen.getByText(/saved scene state/i)).toBeTruthy();
    expect(screen.getByLabelText(/scene mode/i)).toHaveValue('isolated');
    expect(
      screen.getByRole('button', { name: /reset saved scene preview/i })
    ).toBeTruthy();

    rerender(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-2',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-2'],
          analysisSources: [],
          preferredComparableRefs: [],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: null
        }}
        persistedState={{
          placements: [],
          usedCachedPreviewResultIds: [],
          mode: 'grouped'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
      />
    );

    expect(screen.queryByText(/neon wall sign/i)).toBeNull();

    rerender(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [],
          preferredComparableRefs: [],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: null
        }}
        persistedState={{
          placements: [
            {
              id: 'wall-1',
              surface: 'wall',
              label: 'neon wall sign',
              provenance: 'mock-image-preview:7001',
              previewSource: 'cached'
            }
          ],
          usedCachedPreviewResultIds: ['preview-cached-1'],
          mode: 'isolated'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
      />
    );

    expect(screen.getByText(/neon wall sign/i)).toBeTruthy();
  });

  it('highlights the scene panel when requested', () => {
    const { container } = render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [],
          preferredComparableRefs: [],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: null
        }}
        persistedState={{
          placements: [],
          usedCachedPreviewResultIds: [],
          mode: 'grouped'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
        isHighlighted={true}
      />
    );

    expect(container.firstChild).toHaveStyle(
      'box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.18), 0 18px 40px rgba(15, 23, 42, 0.18)'
    );
  });

  it('highlights the active refinement bias lines when requested', () => {
    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [],
          preferredComparableRefs: [
            {
              id: 'comp-2',
              label: 'neon wall sign'
            }
          ],
          forceSynthesisKeys: ['damage_pattern'],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: 'Scene preview promoted wall family: neon wall sign'
        }}
        persistedState={{
          placements: [],
          usedCachedPreviewResultIds: [],
          mode: 'grouped'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
        highlightBiasSurface="both"
      />
    );

    expect(screen.getByText(/lock: world_style/i)).toHaveStyle(
      'background: rgba(250, 204, 21, 0.16)'
    );
    expect(screen.getByText(/force synth: damage_pattern/i)).toHaveStyle(
      'background: rgba(250, 204, 21, 0.16)'
    );
  });

  it('accepts an external populate request for the wall surface', async () => {
    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [],
          preferredComparableRefs: [
            {
              id: 'comp-2',
              label: 'neon wall sign'
            }
          ],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: null
        }}
        persistedState={{
          placements: [],
          usedCachedPreviewResultIds: [],
          mode: 'grouped'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [],
          scene: undefined
        }}
        psgAccessMode="offline"
        hostedUpgradeOperations={[]}
        externalPopulateRequest={{
          surface: 'wall',
          requestId: 1
        }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/neon wall sign/i)).toBeTruthy();
    });
  });

  it('clears persisted scene preview state from the active bootstrap view', () => {
    render(
      <ScenePreviewV1Panel
        summary={{
          bootstrapGroupId: 'bootstrap-group-1',
          bootstrapMode: 'prop-variation',
          assetIds: ['prop-1'],
          analysisSources: [],
          preferredComparableRefs: [],
          forceSynthesisKeys: [],
          lockedTraitKeys: ['world_style'],
          variableTraitKeys: ['damage_pattern'],
          notes: null
        }}
        persistedState={{
          placements: [
            {
              id: 'wall-1',
              surface: 'wall',
              label: 'neon wall sign',
              provenance: 'mock-image-preview:7001',
              previewSource: 'cached'
            }
          ],
          usedCachedPreviewResultIds: ['preview-cached-1'],
          mode: 'isolated'
        }}
        document={{
          version: 'psg/1',
          kind: 'fragment',
          metadata: { name: 'Working Graph' },
          fragment: {
            version: '1.0.0',
            name: 'Working Graph',
            nodes: [],
            edges: []
          },
          assets: [],
          scene: undefined
        }}
        psgAccessMode="cloud"
        hostedUpgradeOperations={['images-preview']}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /reset saved scene preview/i })
    );

    expect(screen.queryByText(/neon wall sign/i)).toBeNull();
    expect(screen.queryByText(/saved scene state/i)).toBeNull();
    expect(screen.getByRole('button', { name: /^clear$/i })).toBeTruthy();
  });
});
