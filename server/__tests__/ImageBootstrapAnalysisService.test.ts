import { ImageBootstrapAnalysisService } from '../src/services/ImageBootstrapAnalysisService';

describe('ImageBootstrapAnalysisService', () => {
  const service = new ImageBootstrapAnalysisService();
  const originalReplicateApiToken = process.env.REPLICATE_API_TOKEN;
  const originalReplicateSegmentationVersion = process.env.REPLICATE_SEGMENTATION_VERSION;
  const originalFetch = global.fetch;
  const propAsset = {
    id: 'prop-1',
    kind: 'reference-still' as const,
    role: 'hero-prop',
    storage: {
      provider: 'local' as const,
      uri: 'file://prop.png',
      contentType: 'image/png'
    },
    provenance: {
      source: 'upload' as const
    }
  };
  const crowdAsset = {
    id: 'crowd-1',
    kind: 'reference-still' as const,
    role: 'crowd-extra',
    storage: {
      provider: 'local' as const,
      uri: 'file://crowd.png',
      contentType: 'image/png'
    },
    provenance: {
      source: 'upload' as const
    }
  };
  const explicitFixtureAsset = {
    id: 'fixture-1',
    kind: 'reference-still' as const,
    role: 'generic-reference',
    storage: {
      provider: 'local' as const,
      uri: 'file://fixture.png',
      contentType: 'image/png'
    },
    provenance: {
      source: 'upload' as const
    },
    metadata: {
      imageBootstrapFixture: 'punk-crowd-extra'
    }
  };
  const metadataPreferredAsset = {
    id: 'prop-2',
    kind: 'reference-still' as const,
    role: 'hero-prop',
    storage: {
      provider: 'local' as const,
      uri: 'file://prop-2.png',
      contentType: 'image/png'
    },
    provenance: {
      source: 'upload' as const
    },
    metadata: {
      imageBootstrapPreferredComparableRefs: [
        {
          id: 'comp-saved-1',
          label: 'saved venue prop family',
          origin: 'comparable',
          score: 0.81,
          sourceRef: 'fixture://saved-venue-prop-family'
        }
      ]
    }
  };
  const publicImageAsset = {
    id: 'prop-3',
    kind: 'reference-still' as const,
    role: 'hero-prop',
    storage: {
      provider: 'local' as const,
      uri: 'file://prop-3.png',
      contentType: 'image/png'
    },
    provenance: {
      source: 'upload' as const
    },
    metadata: {
      publicImageUrl: 'https://cdn.example.com/prop-3.png'
    }
  };

  beforeEach(() => {
    delete process.env.REPLICATE_API_TOKEN;
    delete process.env.REPLICATE_SEGMENTATION_VERSION;
    global.fetch = originalFetch;
  });

  afterAll(() => {
    if (originalReplicateApiToken) {
      process.env.REPLICATE_API_TOKEN = originalReplicateApiToken;
    } else {
      delete process.env.REPLICATE_API_TOKEN;
    }

    if (originalReplicateSegmentationVersion) {
      process.env.REPLICATE_SEGMENTATION_VERSION = originalReplicateSegmentationVersion;
    } else {
      delete process.env.REPLICATE_SEGMENTATION_VERSION;
    }

    global.fetch = originalFetch;
  });

  it('runs segmentation as a distinct stage', () => {
    const segmentation = service.runSegmentationStage(propAsset);

    expect(segmentation.bootstrapMode).toBe('prop-variation');
    expect(segmentation.subjectKind).toBe('prop');
    expect(segmentation.subjects[0]).toMatchObject({
      primary: true,
      subjectKind: 'prop'
    });
    expect(segmentation.findings).toContain('bootstrap:prop-variation');
    expect(segmentation.findings).toContain(
      'segmentation-provider:fallback-no-public-image'
    );
  });

  it('uses a public image url when present in the segmentation provider seam', () => {
    const segmentation = service.runSegmentationStage(publicImageAsset);

    expect(segmentation.findings).toContain(
      'segmentation-provider:fallback-public-image'
    );
    expect(segmentation.subjects[0]?.confidence).toBeGreaterThan(0.72);
    expect(segmentation.regions[0]?.confidence).toBeGreaterThan(0.81);
  });

  it('uses Replicate-backed segmentation asynchronously when configured', async () => {
    process.env.REPLICATE_API_TOKEN = 'replicate-test-token';
    process.env.REPLICATE_SEGMENTATION_VERSION =
      'fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'pred-1',
        status: 'succeeded',
        output: [
          {
            label: 'hero prop silhouette',
            confidence: 0.91,
            bbox: { x: 12, y: 20, width: 180, height: 220 }
          },
          {
            label: 'surface wear',
            score: 0.78,
            bbox: { x: 60, y: 80, width: 75, height: 90 }
          }
        ]
      })
    }) as typeof fetch;

    const segmentation = await service.runSegmentationStageAsync(publicImageAsset);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(segmentation.findings).toContain('segmentation-provider:replicate');
    expect(segmentation.findings).toContain('segmentation-regions:2');
    expect(segmentation.subjects[0]).toMatchObject({
      primary: true,
      subjectKind: 'prop'
    });
    expect(segmentation.regions[0]).toMatchObject({
      label: 'hero prop silhouette',
      kind: 'subject',
      bbox: {
        x: 12,
        y: 20,
        width: 180,
        height: 220
      }
    });
    expect(segmentation.regions[1]).toMatchObject({
      label: 'surface wear',
      kind: 'part'
    });
  });

  it('accepts Replicate combined-mask output from sam-2', async () => {
    process.env.REPLICATE_API_TOKEN = 'replicate-test-token';
    delete process.env.REPLICATE_SEGMENTATION_VERSION;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'pred-2',
        status: 'succeeded',
        output: {
          combined_mask: 'https://replicate.delivery/pbxt/mock-mask.png'
        }
      })
    }) as typeof fetch;

    const segmentation = await service.runSegmentationStageAsync(publicImageAsset);

    expect(segmentation.findings).toContain('segmentation-provider:replicate');
    expect(segmentation.findings).toContain('segmentation-output:combined-mask');
    expect(segmentation.subjects[0]).toMatchObject({
      primary: true,
      subjectKind: 'prop'
    });
    expect(segmentation.regions[0]).toMatchObject({
      label: 'hero-prop',
      kind: 'subject'
    });
  });

  it('runs multimodal interpretation as a distinct stage', () => {
    const multimodal = service.runMultimodalStage(
      propAsset,
      'build variations'
    );

    expect(multimodal.findings).toContain('intent:build variations');
    expect(multimodal.lockedTraitHints).toContain('build variations');
    expect(multimodal.comparableSearchTerms).toContain('hero-prop');
  });

  it('reconciles segmentation and multimodal evidence into traits', () => {
    const segmentation = service.runSegmentationStage(propAsset);
    const multimodal = service.runMultimodalStage(
      propAsset,
      'build variations'
    );
    const reconciled = service.reconcileTraitEvidence({
      asset: propAsset,
      segmentation,
      multimodal
    });

    expect(reconciled.lockedTraits[0]).toMatchObject({
      key: 'world_style',
      classification: 'locked'
    });
    expect(reconciled.lockedTraits[0]?.confidence).toBeGreaterThan(0);
    expect(reconciled.variableTraits[0]?.provenance).toEqual(
      expect.arrayContaining(['segmentation', 'multimodal-model'])
    );
  });

  it('applies conflict penalties when multimodal hints diverge from the role', () => {
    const segmentation = service.runSegmentationStage(propAsset);
    const multimodal = service.runMultimodalStage(
      propAsset,
      'weathered sci-fi salvage'
    );
    const reconciled = service.reconcileTraitEvidence({
      asset: propAsset,
      segmentation,
      multimodal
    });

    expect(reconciled.lockedTraits[0]?.conflicts).toContain(
      'role:hero-prop differs from locked:weathered sci-fi salvage'
    );
    expect(reconciled.lockedTraits[0]?.confidence).toBeLessThan(0.64);
  });

  it('assembles staged analysis into a review checkpoint bundle', () => {
    const result = service.analyzeAssets({
      assets: [propAsset],
      userIntent: 'build variations'
    });

    expect(result.analyses[0]).toMatchObject({
      assetId: 'prop-1',
      bootstrapMode: 'prop-variation',
      subjectKind: 'prop',
      analysisSource: {
        selectionMode: 'derived'
      }
    });
    expect(result.exactMatches[0]?.origin).toBe('exact');
    expect(result.comparableMatches[0]?.origin).toBe('comparable');
    expect(result.checkpoint.uncertainTraits.length).toBeGreaterThan(0);
    expect(result.checkpoint.analyses[0]?.assetId).toBe('prop-1');
  });

  it('uses the crowd fixture catalog path for punk crowd references', () => {
    const result = service.analyzeAssets({
      assets: [crowdAsset],
      userIntent: 'build punk crowd variations'
    });

    expect(result.analyses[0]).toMatchObject({
      assetId: 'crowd-1',
      bootstrapMode: 'crowd-archetype-expansion',
      subjectKind: 'person',
      analysisSource: {
        fixtureId: 'punk-crowd-extra',
        selectionMode: 'heuristic'
      },
      lockedTraits: expect.arrayContaining([
        expect.objectContaining({
          key: 'world_style',
          value: 'sweaty underground punk venue'
        })
      ]),
      variableTraits: expect.arrayContaining([
        expect.objectContaining({
          key: 'pose_energy'
        }),
        expect.objectContaining({
          key: 'wardrobe_variation'
        })
      ])
    });
    expect(result.comparableMatches[0]).toMatchObject({
      kind: 'crowd-archetype',
      label: 'punk crowd archetype fragment',
      sourceRef: 'fixture://punk-crowd-archetype-fragment'
    });
  });

  it('uses an explicit fixture id from asset metadata before heuristic matching', () => {
    const result = service.analyzeAssets({
      assets: [explicitFixtureAsset],
      userIntent: 'generic variation work'
    });

    expect(result.analyses[0]).toMatchObject({
      assetId: 'fixture-1',
      bootstrapMode: 'crowd-archetype-expansion',
      subjectKind: 'person',
      analysisSource: {
        fixtureId: 'punk-crowd-extra',
        selectionMode: 'explicit'
      }
    });
    expect(result.comparableMatches[0]).toMatchObject({
      label: 'punk crowd archetype fragment',
      sourceRef: 'fixture://punk-crowd-archetype-fragment'
    });
  });

  it('prioritizes persisted asset comparable signals ahead of generic heuristics', () => {
    const result = service.analyzeAssets({
      assets: [metadataPreferredAsset],
      userIntent: 'build prop variations'
    });

    expect(result.comparableMatches[0]).toMatchObject({
      label: 'saved venue prop family',
      reasonCodes: ['saved-reuse-signal', 'asset-bootstrap-preference'],
      sourceRef: 'fixture://saved-venue-prop-family'
    });
    expect(result.comparableMatches[1]).toMatchObject({
      label: expect.stringMatching(/prop/i)
    });
  });

  it('applies review guidance and reduces uncertainty for confirmed traits', () => {
    const result = service.analyzeAssets({
      assets: [propAsset],
      userIntent: 'build variations'
    });
    const reviewed = service.applyReviewGuidance({
      checkpoint: result.checkpoint,
      guidance: {
        bootstrapMode: 'prop-variation',
        primarySubjectId: 'prop-1-subject-1',
        excludedRegionIds: ['prop-1-region-1'],
        lockedTraitKeys: ['world_style'],
        variableTraitKeys: ['variation_axis'],
        rejectedTraitKeys: [],
        addedLockedTraits: ['weathering_level'],
        addedVariableTraits: ['damage_pattern'],
        preferredComparableMatchIds: result.comparableMatches.map(match => match.id),
        forceSynthesisKeys: []
      }
    });

    expect(reviewed.guidance?.preferredComparableMatchIds).toEqual(
      result.comparableMatches.map(match => match.id)
    );
    expect(reviewed.analyses[0]?.regions).toHaveLength(0);
    expect(reviewed.analyses[0]?.lockedTraits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'world_style',
          provenance: expect.arrayContaining(['human']),
          confidence: expect.any(Number)
        }),
        expect.objectContaining({
          key: 'weathering_level',
          classification: 'locked'
        })
      ])
    );
    expect(reviewed.analyses[0]?.variableTraits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'damage_pattern',
          classification: 'variable'
        })
      ])
    );
    expect(reviewed.uncertainTraits.length).toBeLessThanOrEqual(
      result.checkpoint.uncertainTraits.length
    );
  });

  it('promotes a fixture-backed analysis source to explicit when review guidance locks it', () => {
    const result = service.analyzeAssets({
      assets: [crowdAsset],
      userIntent: 'build punk crowd variations'
    });

    expect(result.checkpoint.analyses[0]?.analysisSource).toMatchObject({
      fixtureId: 'punk-crowd-extra',
      selectionMode: 'heuristic'
    });

    const reviewed = service.applyReviewGuidance({
      checkpoint: result.checkpoint,
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
    });

    expect(reviewed.analyses[0]?.analysisSource).toMatchObject({
      fixtureId: 'punk-crowd-extra',
      selectionMode: 'explicit'
    });
  });
});
